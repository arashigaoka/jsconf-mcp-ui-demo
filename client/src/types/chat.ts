import type { EmbeddedResource } from '@modelcontextprotocol/sdk/types.js';

// Chat message types

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  uiResource?: EmbeddedResource;
}

// Legacy UIResource type (not used anymore, kept for reference)
export interface UIResource {
  uri: string;
  content: {
    type: 'rawHtml' | 'remoteDom';
    htmlString?: string;
    url?: string;
  };
  encoding: 'text' | 'base64';
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

// API request/response types
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  conversationId: string;
  message: string;
  uiResource?: EmbeddedResource;
  functionCall?: {
    name: string;
    arguments: string;
  };
  error?: string;
}

// Tool call from UIResource
export interface UIToolCall {
  toolName: string;
  params: Record<string, any>;
}
