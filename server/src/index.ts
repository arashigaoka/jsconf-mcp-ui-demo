import express, { Request, Response } from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    phase: 'Phase 3 - Express Server Implementation',
  });
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'MCP-UI Demo API',
    version: '1.0.0',
    phase: 'Phase 3 - Express Server Implementation',
    endpoints: {
      chat: {
        'POST /api/chat': 'Send a chat message',
        'GET /api/chat/:conversationId': 'Get conversation history',
        'DELETE /api/chat/:conversationId': 'Delete conversation',
      },
    },
  });
});

// API routes
app.use('/api', chatRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`\n✨ Features:`);
  console.log(`   - OpenAI GPT-4 integration`);
  console.log(`   - Function calling for MCP tools`);
  console.log(`   - Conversation management`);
});
