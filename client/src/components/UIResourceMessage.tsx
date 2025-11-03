import {
  UIResourceRenderer,
  type UIActionResult,
  remoteTextDefinition,
  remoteStackDefinition,
  remoteImageDefinition,
} from '@mcp-ui/client';
import type { EmbeddedResource } from '@modelcontextprotocol/sdk/types.js';
import type { UIToolCall } from '../types/chat';
import { radixComponentLibrary } from '../libraries/radix';
import {
  remoteButtonDefinition,
  remoteTextInputDefinition,
  remoteSelectDefinition,
  remoteFormDefinition,
  remoteSeparatorDefinition,
} from '../libraries/remoteElements';
import { useState, useRef, useEffect } from 'react';

const remoteElements = [
  remoteTextDefinition,
  remoteButtonDefinition,  // Using custom definition with type attribute
  remoteStackDefinition,
  remoteImageDefinition,
  remoteTextInputDefinition,
  remoteSelectDefinition,
  remoteFormDefinition,
  remoteSeparatorDefinition,
];

interface UIResourceMessageProps {
  resource: EmbeddedResource;
  onToolCall: (toolCall: UIToolCall) => void;
}

export function UIResourceMessage({ resource, onToolCall }: UIResourceMessageProps) {
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Validate resource structure: expecting {type: 'resource', resource: {mimeType, text, ...}}
  if (!resource || typeof resource !== 'object') {
    console.error('Invalid resource: not an object:', resource);
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>Invalid UI resource structure</span>
        </div>
      </div>
    );
  }

  if (resource.type !== 'resource' || !resource.resource) {
    console.error('Invalid resource: missing type or resource field:', resource);
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>Invalid UI resource format</span>
        </div>
      </div>
    );
  }

  // Extract the actual resource object to pass to UIResourceRenderer
  const actualResource = resource.resource;

  const handleUIAction = async (result: UIActionResult): Promise<void> => {
    try {
      // Handle tool calls from the UI
      if (result.type === 'tool') {
        const payload = result.payload;

        // Validate payload
        if (!payload || !payload.toolName || !payload.params) {
          console.error('Invalid tool call payload:', payload);
          setError('操作データが不正です');

          // Clear previous timeout
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
          }
          errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
          return;
        }

        onToolCall({
          toolName: payload.toolName,
          params: payload.params,
        });
      }
    } catch (error) {
      console.error('Error handling UI action:', error);
      setError('操作中にエラーが発生しました。もう一度お試しください。');

      // Clear previous timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.error}>
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <UIResourceRenderer
        resource={actualResource}
        onUIAction={handleUIAction}
        supportedContentTypes={['remoteDom', 'html', 'externalUrl']}
        remoteDomProps={{
          library: radixComponentLibrary,
          remoteElements: remoteElements,
        }}
      />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '200px',
    padding: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
  } as React.CSSProperties,
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    color: '#856404',
  } as React.CSSProperties,
  errorIcon: {
    fontSize: '20px',
  } as React.CSSProperties,
};
