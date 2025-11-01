import { useEffect, useRef } from 'react';
import type { Message, UIToolCall } from '../types/chat';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onToolCall: (toolCall: UIToolCall) => void;
}

export function MessageList({ messages, isLoading = false, onToolCall }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={styles.container}>
      {messages.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <h3 style={styles.emptyTitle}>Start a conversation</h3>
          <p style={styles.emptyText}>
            Try saying "こんにちは" or "レストランを予約したい"
          </p>
        </div>
      ) : (
        <div style={styles.messageList}>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onToolCall={onToolCall}
            />
          ))}
          {isLoading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingDot} />
              <div style={{ ...styles.loadingDot, animationDelay: '0.2s' }} />
              <div style={{ ...styles.loadingDot, animationDelay: '0.4s' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
    backgroundColor: '#fafafa',
  } as React.CSSProperties,
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  } as React.CSSProperties,
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  } as React.CSSProperties,
  emptyText: {
    margin: '0',
    fontSize: '16px',
  } as React.CSSProperties,
  messageList: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  loadingContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    justifyContent: 'flex-start',
  } as React.CSSProperties,
  loadingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#666',
    animation: 'bounce 1.4s infinite ease-in-out both',
  } as React.CSSProperties,
};

// Add keyframes animation for loading dots
if (typeof document !== 'undefined') {
  const styleId = 'message-list-animations';

  // Only add styles if they haven't been added yet
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1.0);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
