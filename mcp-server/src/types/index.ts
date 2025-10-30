// MCP Server types for Phase 2

export interface ReservationFormData {
  name: string;
  date: string;
  time: string;
  partySize: number;
  contact: string;
  restaurantName: string;
}

export interface ToolRequest {
  toolName: string;
  params: Record<string, any>;
}

export interface ToolResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
