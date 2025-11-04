import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import * as Separator from '@radix-ui/react-separator';

export function ChatUI() {
  const { messages, isLoading, error, sendMessage, handleToolCall, clearConversation } = useChat();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>MCP-UI Demo</h1>
          <p style={styles.subtitle}>Interactive chat with Model Context Protocol</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            style={styles.clearButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
          >
            Clear Chat
          </button>
        )}
      </div>
      <Separator.Root style={styles.separator} />

      {/* Error display */}
      {error && (
        <div style={styles.errorBanner}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Chat area */}
      <div style={styles.chatContainer}>
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onToolCall={handleToolCall}
        />
      </div>

      {/* Input area */}
      <InputArea onSend={sendMessage} disabled={isLoading} />

      <Separator.Root style={styles.separator} />

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>
          Powered by OpenAI GPT-4 • MCP Server • @mcp-ui/client
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: '#fff',
  } as React.CSSProperties,
  title: {
    margin: '0 0 4px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a202c',
  } as React.CSSProperties,
  subtitle: {
    margin: '0',
    fontSize: '14px',
    color: '#718096',
  } as React.CSSProperties,
  separator: {
    height: '1px',
    backgroundColor: '#e2e8f0',
  } as React.CSSProperties,
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    color: '#2d3748',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    backgroundColor: '#fff3cd',
    borderBottom: '1px solid #ffc107',
    color: '#856404',
  } as React.CSSProperties,
  errorIcon: {
    fontSize: '18px',
  } as React.CSSProperties,
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  footer: {
    padding: '12px 24px',
    backgroundColor: '#f8f9fa',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  footerText: {
    fontSize: '12px',
    color: '#718096',
  } as React.CSSProperties,
};
