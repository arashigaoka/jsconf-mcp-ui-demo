import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MCP-UI Demo</h1>
      <p>Interactive chat demo using Model Context Protocol UI extensions</p>

      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        minHeight: '400px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Chat Interface</h2>
        <p style={{ color: '#666' }}>Chat UI will be implemented in Phase 4</p>

        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Status:</strong> Phase 1 Complete - Project Setup</p>
        <p><strong>Next:</strong> Phase 2 - MCP Server Implementation</p>
      </div>
    </div>
  );
}

export default App;
