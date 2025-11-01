import { Router, Request, Response } from 'express';
import {
  processChat,
  createSystemMessage,
  type ChatMessage,
} from '../services/openai.js';

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

    // Validate and trim input
    if (!message || !message.trim()) {
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
 * Generate a unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default router;
