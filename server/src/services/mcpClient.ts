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
 * Tool list response from MCP server
 */
export interface MCPToolListResponse {
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
}

/**
 * Reservation form data
 */
export interface ReservationData {
  name: string;
  date: string;
  time: string;
  partySize: number;
  contact: string;
  restaurantName: string;
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
   * Get list of available tools from MCP server
   */
  async listTools(): Promise<MCPToolListResponse> {
    const response = await fetch(`${this.baseUrl}/tools`);
    if (!response.ok) {
      throw new Error(`Failed to list tools: ${response.statusText}`);
    }
    return response.json() as Promise<MCPToolListResponse>;
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, params: Record<string, unknown>): Promise<MCPToolResponse> {
    const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to call tool ${toolName}: ${response.statusText}`
      );
    }

    return response.json() as Promise<MCPToolResponse>;
  }

  /**
   * Show reservation form
   */
  async showReservationForm(restaurantName: string): Promise<MCPToolResponse> {
    return this.callTool('show_reservation_form', { restaurantName });
  }

  /**
   * Submit reservation
   */
  async submitReservation(data: ReservationData): Promise<MCPToolResponse> {
    // Convert ReservationData to Record<string, unknown>
    return this.callTool('submit_reservation', data as unknown as Record<string, unknown>);
  }
}

export const mcpClient = new MCPClient();
