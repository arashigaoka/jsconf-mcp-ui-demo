import config from '../config/index.js';
import type { EmbeddedResource } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool response from MCP server
 */
export interface MCPToolResponse {
  success: boolean;
  message?: string;
  uiResource?: EmbeddedResource;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * MCP Client for communicating with MCP Server
 */
export class MCPClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.mcp.serverUrl;
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, params: Record<string, unknown>): Promise<MCPToolResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(
          `Failed to call tool ${toolName}: ${response.status} ${errorText}`
        );
      }

      return response.json() as Promise<MCPToolResponse>;
    } catch (error) {
      // Enhanced error handling for connection issues
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        throw new Error(
          `Failed to connect to MCP server at ${this.baseUrl}. Please ensure the MCP server is running. Original error: ${error.message}`
        );
      }
      throw error;
    }
  }
}

export const mcpClient = new MCPClient();
