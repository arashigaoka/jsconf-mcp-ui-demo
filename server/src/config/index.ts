// Configuration management for Phase 3

const config = {
  port: process.env.PORT || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  mcp: {
    serverUrl: process.env.MCP_SERVER_URL || 'http://localhost:3001',
  },
};

export default config;
