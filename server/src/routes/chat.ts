import { Router, Request, Response } from 'express';
import {
  processChat,
  createSystemMessage,
  type ChatMessage,
} from '../services/openai.js';

const router = Router();

// In-memory conversation storage (in production, use a database)
const conversations = new Map<string, ChatMessage[]>();

/**
 * POST /api/chat
 * Process a chat message with OpenAI and handle function calls
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message is required',
      });
      return;
    }

    // Get or create conversation
    const convId = conversationId || generateConversationId();
    let messages = conversations.get(convId) || [];

    // Add system message if this is a new conversation
    if (messages.length === 0) {
      messages.push(createSystemMessage());
    }

    // Add user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Process with OpenAI
    const response = await processChat(messages);

    // Add assistant message to conversation
    messages.push({
      role: 'assistant',
      content: response.message,
    });

    // Store conversation
    conversations.set(convId, messages);

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

  const messages = conversations.get(conversationId);

  if (!messages) {
    res.status(404).json({
      success: false,
      error: 'Conversation not found',
    });
    return;
  }

  res.json({
    success: true,
    conversationId,
    messages: messages.filter((m) => m.role !== 'system'), // Don't send system message to client
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
