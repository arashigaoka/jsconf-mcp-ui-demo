// Shared MCP-UI types used across client, server, and mcp-server

/**
 * UIResource represents an interactive UI component
 * that can be rendered in the chat interface
 */
export interface UIResource {
  /** Unique identifier for this UI resource */
  uri: string;

  /** Content of the UI resource */
  content: UIResourceContent;

  /** Encoding type */
  encoding: 'text' | 'base64';

  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Content types for UIResource
 */
export type UIResourceContent = RawHtmlContent | RemoteDomContent;

export interface RawHtmlContent {
  type: 'rawHtml';
  htmlString: string;
}

export interface RemoteDomContent {
  type: 'remoteDom';
  url: string;
}

/**
 * Tool call request from UI to host
 */
export interface UIToolCall {
  toolName: string;
  params: Record<string, any>;
}

/**
 * Tool definition for MCP
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Reservation form data (specific to our use case)
 */
export interface ReservationFormData {
  name: string;
  date: string;
  time: string;
  partySize: number;
  contact: string;
  restaurantName?: string;
}
