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
    padding: '14px 18px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  } as React.CSSProperties,
  userBubble: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderBottomRightRadius: '4px',
  } as React.CSSProperties,
  assistantBubble: {
    backgroundColor: 'white',
    color: '#1a202c',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '4px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    fontSize: '12px',
    opacity: 0.9,
  } as React.CSSProperties,
  role: {
    fontWeight: '600',
  } as React.CSSProperties,
  timestamp: {
    fontSize: '11px',
    opacity: 0.7,
  } as React.CSSProperties,
  content: {
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    lineHeight: '1.6',
    fontSize: '15px',
  } as React.CSSProperties,
  uiResourceContainer: {
    marginTop: '12px',
  } as React.CSSProperties,
};
