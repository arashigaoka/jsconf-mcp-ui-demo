import { useState, useCallback } from 'react';
import type { ChatState, Message, ChatRequest, ChatResponse, UIToolCall } from '../types/chat';

const API_BASE_URL = '/api';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
  });

  /**
   * Send a message to the chat API
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Use functional update to access latest conversationId
      const currentConversationId = await new Promise<string | null>((resolve) => {
        setState((prev) => {
          resolve(prev.conversationId);
          return prev;
        });
      });

      const request: ChatRequest = {
        message: content.trim(),
        conversationId: currentConversationId || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        uiResource: data.uiResource,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        conversationId: data.conversationId,
        isLoading: false,
      }));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending message:', error);
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, []); // Empty dependency array - uses functional updates

  /**
   * Handle tool call from UIResource
   */
  const handleToolCall = useCallback(async (toolCall: UIToolCall) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      // Get current conversation ID
      const currentConversationId = await new Promise<string | null>((resolve) => {
        setState((prev) => {
          resolve(prev.conversationId);
          return prev;
        });
      });

      // Send tool call to dedicated endpoint
      const response = await fetch(`${API_BASE_URL}/tool-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: toolCall.toolName,
          params: toolCall.params,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Tool call failed');
      }

      // Add assistant message with the result
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        uiResource: data.uiResource,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        conversationId: data.conversationId || prev.conversationId,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to handle tool call:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'ツール呼び出しに失敗しました',
      }));
    }
  }, []);

  /**
   * Clear conversation
   */
  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    sendMessage,
    handleToolCall,
    clearConversation,
  };
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
