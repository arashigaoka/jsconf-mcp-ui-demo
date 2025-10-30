// Configuration management for Phase 3
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from project root
// This MUST be called before reading process.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
  console.error('   Please add your OpenAI API key to the .env file');
  process.exit(1);
}

const config = {
  port: process.env.PORT || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  mcp: {
    serverUrl: process.env.MCP_SERVER_URL || 'http://localhost:3001',
  },
};

export default config;
