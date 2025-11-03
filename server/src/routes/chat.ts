import { Router, Request, Response } from 'express';
import {
  processChat,
  createSystemMessage,
  type ChatMessage,
} from '../services/openai.js';
import { mcpClient, type ReservationData } from '../services/mcpClient.js';

const router = Router();

// Conversation with metadata
interface ConversationData {
  messages: ChatMessage[];
  lastAccessedAt: number;
}

// In-memory conversation storage (in production, use a database)
const conversations = new Map<string, ConversationData>();

// Conversation TTL: 1 hour
const CONVERSATION_TTL_MS = 60 * 60 * 1000;

// Maximum number of conversations
const MAX_CONVERSATIONS = 100;

/**
 * Cleanup old conversations
 */
function cleanupOldConversations(): void {
  const now = Date.now();
  let deletedCount = 0;

  for (const [id, data] of conversations.entries()) {
    if (now - data.lastAccessedAt > CONVERSATION_TTL_MS) {
      conversations.delete(id);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired conversations`);
  }
}

/**
 * Enforce max conversation limit
 */
function enforceConversationLimit(): void {
  if (conversations.size > MAX_CONVERSATIONS) {
    // Remove oldest conversations
    const sortedConversations = Array.from(conversations.entries())
      .sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt);

    const toRemove = conversations.size - MAX_CONVERSATIONS;
    for (let i = 0; i < toRemove; i++) {
      conversations.delete(sortedConversations[i][0]);
    }

    console.log(`Removed ${toRemove} oldest conversations to enforce limit`);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldConversations, 10 * 60 * 1000);

/**
 * POST /api/chat
 * Process a chat message with OpenAI and handle function calls
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;

    // Validate input type and content
    if (typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Message must be a string',
      });
      return;
    }

    if (!message.trim()) {
      res.status(400).json({
        success: false,
        error: 'Message is required',
      });
      return;
    }

    const trimmedMessage = message.trim();

    // Get or create conversation
    const convId = conversationId || generateConversationId();
    const conversationData = conversations.get(convId);
    let messages: ChatMessage[];

    if (conversationData) {
      messages = conversationData.messages;
    } else {
      messages = [createSystemMessage()];
    }

    // Add user message
    messages.push({
      role: 'user',
      content: trimmedMessage,
    });

    // Process with OpenAI
    const response = await processChat(messages);

    // Add assistant message to conversation
    messages.push({
      role: 'assistant',
      content: response.message,
    });

    // Store conversation with updated timestamp
    conversations.set(convId, {
      messages,
      lastAccessedAt: Date.now(),
    });

    // Enforce limits
    enforceConversationLimit();

    // Return response
    res.json({
      success: true,
      conversationId: convId,
      message: response.message,
      uiResource: response.uiResource,
      functionCall: response.functionCall,
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/chat/:conversationId
 * Get conversation history
 */
router.get('/chat/:conversationId', (req: Request, res: Response) => {
  const { conversationId } = req.params;

  const conversationData = conversations.get(conversationId);

  if (!conversationData) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found',
    });
    return;
  }

  // Update last accessed timestamp
  conversationData.lastAccessedAt = Date.now();

  res.json({
    success: true,
    conversationId,
    messages: conversationData.messages.filter((m) => m.role !== 'system'), // Don't send system message to client
  });
});

/**
 * DELETE /api/chat/:conversationId
 * Delete conversation
 */
router.delete('/chat/:conversationId', (req: Request, res: Response) => {
  const { conversationId } = req.params;

  const deleted = conversations.delete(conversationId);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Conversation deleted',
  });
});

/**
 * POST /api/tool-call
 * Handle tool calls from UIResource
 */
router.post('/tool-call', async (req: Request, res: Response) => {
  try {
    const { toolName, params, conversationId } = req.body;

    // Whitelist of allowed tool names
    const ALLOWED_TOOLS = ['submit_reservation', 'show_reservation_form'];

    // Validate input
    if (typeof toolName !== 'string' || !toolName.trim()) {
      res.status(400).json({
        success: false,
        error: 'toolName is required and must be a string',
      });
      return;
    }

    // Whitelist validation
    if (!ALLOWED_TOOLS.includes(toolName)) {
      res.status(400).json({
        success: false,
        error: 'Invalid tool name',
      });
      return;
    }

    if (!params || typeof params !== 'object' || Array.isArray(params)) {
      res.status(400).json({
        success: false,
        error: 'params is required and must be an object',
      });
      return;
    }

    // Call the appropriate tool via MCP client
    let result;
    if (toolName === 'submit_reservation') {
      result = await mcpClient.submitReservation(params as ReservationData);
    } else {
      result = await mcpClient.callTool(toolName, params);
    }

    // Get conversation and add the result as a message
    if (conversationId) {
      const conversationData = conversations.get(conversationId);
      if (conversationData) {
        const messages = conversationData.messages;

        // Add tool result as user message
        const toolResultMessage = result.message || JSON.stringify(result.data || {});
        messages.push({
          role: 'user',
          content: `[Tool Result: ${toolName}]\n${toolResultMessage}`,
        });

        // Process with OpenAI to get a natural language response
        const response = await processChat(messages);

        // Add assistant response
        messages.push({
          role: 'assistant',
          content: response.message,
        });

        // Update conversation
        conversations.set(conversationId, {
          messages,
          lastAccessedAt: Date.now(),
        });

        // Return both the tool result and AI response
        res.json({
          success: true,
          conversationId,
          toolResult: result,
          message: response.message,
          uiResource: response.uiResource,
        });
        return;
      }
    }

    // If no conversation context, just return the tool result
    res.json({
      success: true,
      toolResult: result,
      message: result.message || 'ツール呼び出しが成功しました',
    });
  } catch (error) {
    console.error('[Server] Error in /api/tool-call:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate a unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default router;
