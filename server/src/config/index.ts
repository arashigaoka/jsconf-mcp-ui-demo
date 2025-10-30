// Configuration management (to be expanded in Phase 3)

export const config = {
  port: process.env.PORT || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  mcp: {
    serverUrl: process.env.MCP_SERVER_URL || 'http://localhost:3001',
  },
};

export default config;
