// MCP Server types (to be expanded in Phase 2)

export interface UIResource {
  uri: string;
  content: {
    type: 'rawHtml' | 'remoteDom';
    htmlString?: string;
    url?: string;
  };
  encoding: 'text' | 'base64';
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  uiResource?: UIResource;
  error?: string;
}
