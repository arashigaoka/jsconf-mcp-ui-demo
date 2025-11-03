/**
 * Remote element definition for ui-button with type support
 */
export const remoteButtonDefinition = {
  tagName: 'ui-button',
  remoteAttributes: ['label', 'variant', 'type'],
  remoteEvents: ['press'],
};

/**
 * Remote element definition for ui-text-input
 */
export const remoteTextInputDefinition = {
  tagName: 'ui-text-input',
  remoteAttributes: ['label', 'placeholder', 'value', 'name', 'required', 'type'],
  remoteEvents: ['change'],
};

/**
 * Remote element definition for ui-select
 */
export const remoteSelectDefinition = {
  tagName: 'ui-select',
  remoteAttributes: ['label', 'placeholder', 'value', 'name', 'required', 'options'],
  remoteEvents: ['change'],
};

/**
 * Remote element definition for ui-form
 */
export const remoteFormDefinition = {
  tagName: 'ui-form',
  remoteAttributes: [],
  remoteEvents: ['submit'],
};

/**
 * Remote element definition for ui-separator
 */
export const remoteSeparatorDefinition = {
  tagName: 'ui-separator',
  remoteAttributes: [],
  remoteEvents: [],
};
