// Server types (to be expanded in Phase 3)

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  uiResource?: any; // Will be properly typed with MCP-UI types
}

export interface ToolCallRequest {
  toolName: string;
  params: Record<string, any>;
}

export interface ToolCallResponse {
  success: boolean;
  data?: any;
  error?: string;
}
