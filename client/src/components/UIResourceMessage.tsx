import { UIResourceRenderer, type UIActionResult } from '@mcp-ui/client';
import type { EmbeddedResource } from '@modelcontextprotocol/sdk/types.js';
import type { UIToolCall } from '../types/chat';
import { useEffect, useRef } from 'react';

interface UIResourceMessageProps {
  resource: EmbeddedResource;
  onToolCall: (toolCall: UIToolCall) => void;
}

export function UIResourceMessage({ resource, onToolCall }: UIResourceMessageProps) {
  if (import.meta.env.DEV) {
    console.log('UIResourceMessage received resource:', resource);
  }
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleUIAction = async (result: UIActionResult): Promise<void> => {
    if (import.meta.env.DEV) {
      console.log('UI Action received:', result);
    }

    // Handle tool calls from the UI
    if (result.type === 'tool') {
      const payload = result.payload;
      onToolCall({
        toolName: payload.toolName,
        params: payload.params,
      });
    }
  };

  useEffect(() => {
    // Listen for postMessage from iframe
    const handleMessage = (event: MessageEvent) => {
      // Security: Validate that message comes from our iframe (null origin for sandboxed iframes without allow-same-origin)
      // Note: When sandbox doesn't include allow-same-origin, the origin is 'null'
      const isSandboxedIframe = event.origin === 'null';
      const isSameOrigin = event.origin === window.location.origin;

      if (!isSandboxedIframe && !isSameOrigin) {
        console.warn('Rejected postMessage from untrusted origin:', event.origin);
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Received postMessage:', event.data);
      }

      if (event.data && event.data.type === 'tool') {
        onToolCall({
          toolName: event.data.payload.toolName,
          params: event.data.payload.params,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onToolCall]);

  // Render HTML directly in iframe
  if (resource.type === 'resource' && resource.resource && 'text' in resource.resource) {
    const htmlContent = resource.resource.text as string;

    return (
      <div style={styles.container}>
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={styles.iframe}
          sandbox="allow-scripts allow-forms"
          title="UI Resource"
        />
      </div>
    );
  }

  // Fallback to UIResourceRenderer
  return (
    <div style={styles.container}>
      <UIResourceRenderer
        resource={resource}
        onUIAction={handleUIAction}
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '200px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
  } as React.CSSProperties,
  iframe: {
    width: '100%',
    minHeight: '500px',
    border: 'none',
    borderRadius: '8px',
  } as React.CSSProperties,
};
