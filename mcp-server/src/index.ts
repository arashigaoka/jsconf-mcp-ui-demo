import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'MCP Server is running',
    timestamp: new Date().toISOString(),
  });
});

// MCP Tools endpoint (to be implemented in Phase 2)
app.post('/tools/:toolName', (req: Request, res: Response) => {
  const { toolName } = req.params;
  const params = req.body;

  res.json({
    message: `Tool ${toolName} called`,
    params,
    note: 'MCP Server implementation will be completed in Phase 2',
  });
});

// List available tools
app.get('/tools', (_req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: 'show_reservation_form',
        description: 'Display restaurant reservation form',
        status: 'To be implemented in Phase 2',
      },
      {
        name: 'submit_reservation',
        description: 'Submit reservation data',
        status: 'To be implemented in Phase 2',
      },
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔧 MCP Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🛠️  Tools endpoint: http://localhost:${PORT}/tools`);
});
