import config from '../config/index.js';

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
  async listTools(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tools`);
    if (!response.ok) {
      throw new Error(`Failed to list tools: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, params: Record<string, any>): Promise<any> {
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

    return response.json();
  }

  /**
   * Show reservation form
   */
  async showReservationForm(restaurantName: string): Promise<any> {
    return this.callTool('show_reservation_form', { restaurantName });
  }

  /**
   * Submit reservation
   */
  async submitReservation(data: {
    name: string;
    date: string;
    time: string;
    partySize: number;
    contact: string;
    restaurantName: string;
  }): Promise<any> {
    return this.callTool('submit_reservation', data);
  }
}

export const mcpClient = new MCPClient();
