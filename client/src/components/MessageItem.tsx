import type { Message, UIToolCall } from '../types/chat';
import { UIResourceMessage } from './UIResourceMessage';

interface MessageItemProps {
  message: Message;
  onToolCall?: (toolCall: UIToolCall) => void;
}

export function MessageItem({ message, onToolCall }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        ...styles.container,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          ...styles.bubble,
          ...(isUser ? styles.userBubble : styles.assistantBubble),
        }}
      >
        <div style={styles.header}>
          <span style={styles.role}>{isUser ? 'You' : 'Assistant'}</span>
          <span style={styles.timestamp}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div style={styles.content}>{message.content}</div>

        {/* UIResource rendering */}
        {message.uiResource && onToolCall && (
          <div style={styles.uiResourceContainer}>
            <UIResourceMessage
              resource={message.uiResource}
              onToolCall={onToolCall}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 24 hours
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return date.toLocaleString();
  }
}

const styles = {
  container: {
    display: 'flex',
    marginBottom: '16px',
    animation: 'fadeIn 0.3s ease-in',
  } as React.CSSProperties,
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  userBubble: {
    backgroundColor: '#007bff',
    color: 'white',
    borderBottomRightRadius: '4px',
  } as React.CSSProperties,
  assistantBubble: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    borderBottomLeftRadius: '4px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    fontSize: '12px',
    opacity: 0.8,
  } as React.CSSProperties,
  role: {
    fontWeight: 'bold',
  } as React.CSSProperties,
  timestamp: {
    fontSize: '11px',
  } as React.CSSProperties,
  content: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: '1.5',
  } as React.CSSProperties,
  uiResourceContainer: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #ddd',
  } as React.CSSProperties,
};
