// Chat message types (to be expanded in Phase 4)

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  uiResource?: UIResource;
}

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
}
