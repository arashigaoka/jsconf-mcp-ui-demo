import React from 'react';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import * as Separator from '@radix-ui/react-separator';
import type { ComponentLibrary } from '@mcp-ui/client';

// ===== UI Components =====

/** Text component - displays text with optional styling */
interface RadixTextProps {
  children?: React.ReactNode;
  content?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
}

const RadixText = React.forwardRef<HTMLSpanElement, RadixTextProps>(
  ({ children, content, fontSize = '15px', fontWeight = '400', color = '#1a202c' }, ref) => {
    return (
      <span ref={ref} style={{ fontSize, fontWeight, color, display: 'block' }}>
        {content || children}
      </span>
    );
  }
);

/** Button component - styled button with variants */
interface RadixButtonProps {
  label?: string;
  variant?: 'solid' | 'soft' | 'outline';
  onPress?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}

const RadixButton = React.forwardRef<HTMLButtonElement, RadixButtonProps>(
  ({ label, variant = 'solid', onPress, type = 'button', children }, ref) => {
    const baseStyle: React.CSSProperties = {
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      solid: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      },
      soft: {
        backgroundColor: '#f0f0ff',
        color: '#667eea',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
      },
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onPress) {
        e.preventDefault();
        onPress();
      }
      // If type is 'submit', let the event bubble up to trigger form submission
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        style={{ ...baseStyle, ...variantStyles[variant] }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {label || children}
      </button>
    );
  }
);

/** Stack component - flexbox layout container */
interface RadixStackProps {
  direction?: 'horizontal' | 'vertical';
  gap?: string;
  align?: string;
  children?: React.ReactNode;
}

const RadixStack = React.forwardRef<HTMLDivElement, RadixStackProps>(
  ({ direction = 'vertical', gap = '16px', align = 'stretch', children }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          gap,
          alignItems: align,
        }}
      >
        {children}
      </div>
    );
  }
);

/** TextInput component - text input field with label */
interface RadixTextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  required?: boolean | string;
  type?: string;
  onChange?: (value: string) => void;
}

const RadixTextInput = React.forwardRef<HTMLDivElement, RadixTextInputProps>(
  ({ label, placeholder, value, name, required, type = 'text', onChange }, ref) => {
    // Convert string 'true'/'false' to boolean
    const isRequired = required === true || required === 'true';

    return (
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {label && (
          <Label.Root
            htmlFor={name}
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
            }}
          >
            {label} {isRequired && <span style={{ color: '#e53e3e' }}>*</span>}
          </Label.Root>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          required={isRequired}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '15px',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#667eea';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    );
  }
);

/** Select component - dropdown select with options */
interface RadixSelectComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  required?: boolean | string;
  options?: string | Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
}

const RadixSelectComponent = React.forwardRef<HTMLDivElement, RadixSelectComponentProps>(
  ({ label, placeholder = '選択してください', value, name, required, options = [], onChange }, ref) => {
    // Convert string 'true'/'false' to boolean
    const isRequired = required === true || required === 'true';

    // Parse options if it's a JSON string
    let parsedOptions: Array<{ value: string; label: string }> = [];
    if (typeof options === 'string') {
      try {
        parsedOptions = JSON.parse(options);
      } catch (e) {
        console.error('Failed to parse options:', options, e);
        parsedOptions = [];
      }
    } else {
      parsedOptions = options;
    }

    return (
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {label && (
          <Label.Root
            htmlFor={name}
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2d3748',
            }}
          >
            {label} {isRequired && <span style={{ color: '#e53e3e' }}>*</span>}
          </Label.Root>
        )}
        <Select.Root value={value} onValueChange={onChange}>
          <Select.Trigger
            aria-required={isRequired}
            aria-label={label || name}
            style={{
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon>▼</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              <Select.Viewport>
                {parsedOptions.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontSize: '15px',
                    }}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        {/* Hidden input for form validation - using text type to enable required validation */}
        {isRequired && (
          <input
            type="text"
            tabIndex={-1}
            name={name}
            value={value || ''}
            required={isRequired}
            aria-hidden="true"
            readOnly
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              height: 0,
              width: 0,
              border: 'none',
            }}
          />
        )}
      </div>
    );
  }
);

/** Separator component - visual divider */
const RadixSeparatorComponent = React.forwardRef<HTMLDivElement, Record<string, never>>(
  (_props, ref) => {
    return (
      <Separator.Root
        ref={ref}
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
          margin: '16px 0',
        }}
      />
    );
  }
);

/** Form component - form container */
interface RadixFormProps {
  onSubmit?: () => void;
  children?: React.ReactNode;
}

const RadixForm = React.forwardRef<HTMLFormElement, RadixFormProps>(
  ({ onSubmit, children }, ref) => {
    const handleSubmit = (e: React.FormEvent) => {
      // Check HTML5 validation first
      const form = e.currentTarget as HTMLFormElement;
      if (!form.checkValidity()) {
        // Let browser show native validation messages
        return;
      }

      e.preventDefault();
      // Pass the event to the Remote DOM event handler
      onSubmit?.();
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} style={{ width: '100%' }}>
        {children}
      </form>
    );
  }
);

// ===== Component Library Definition =====

export const radixComponentLibrary: ComponentLibrary = {
  name: 'Radix UI Components',
  elements: [
    {
      tagName: 'ui-text',
      component: RadixText,
      propMapping: {
        content: 'content',
        fontSize: 'fontSize',
        fontWeight: 'fontWeight',
        color: 'color',
      },
      eventMapping: {},
    },
    {
      tagName: 'ui-button',
      component: RadixButton,
      propMapping: {
        label: 'label',
        variant: 'variant',
        type: 'type',
      },
      eventMapping: {
        press: 'onPress',
      },
    },
    {
      tagName: 'ui-stack',
      component: RadixStack,
      propMapping: {
        direction: 'direction',
        gap: 'gap',
        align: 'align',
      },
      eventMapping: {},
    },
    {
      tagName: 'ui-text-input',
      component: RadixTextInput,
      propMapping: {
        label: 'label',
        placeholder: 'placeholder',
        value: 'value',
        name: 'name',
        required: 'required',
        type: 'type',
      },
      eventMapping: {
        change: 'onChange',
      },
    },
    {
      tagName: 'ui-select',
      component: RadixSelectComponent,
      propMapping: {
        label: 'label',
        placeholder: 'placeholder',
        value: 'value',
        name: 'name',
        required: 'required',
        options: 'options',
      },
      eventMapping: {
        change: 'onChange',
      },
    },
    {
      tagName: 'ui-separator',
      component: RadixSeparatorComponent,
      propMapping: {},
      eventMapping: {},
    },
    {
      tagName: 'ui-form',
      component: RadixForm,
      propMapping: {},
      eventMapping: {
        submit: 'onSubmit',
      },
    },
  ],
};
