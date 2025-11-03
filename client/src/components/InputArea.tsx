import { useState, FormEvent, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSend, disabled = false }: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        disabled={disabled}
        rows={3}
        style={styles.textarea}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#667eea';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        style={{
          ...styles.button,
          ...(disabled || !input.trim() ? styles.buttonDisabled : {}),
        }}
        onMouseEnter={(e) => {
          if (!disabled && input.trim()) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {disabled ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#fff',
  } as React.CSSProperties,
  textarea: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'none' as const,
    outline: 'none',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignSelf: 'flex-end',
  } as React.CSSProperties,
  buttonDisabled: {
    background: '#cbd5e0',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  } as React.CSSProperties,
};
