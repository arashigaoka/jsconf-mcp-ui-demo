// Server types for Phase 3

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  conversationId: string;
  message: string;
  uiResource?: any;
  functionCall?: {
    name: string;
    arguments: any;
  };
  error?: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  conversationId: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  error?: string;
}

export interface MCPToolResponse {
  success: boolean;
  message?: string;
  data?: any;
  uiResource?: any;
  error?: string;
}
