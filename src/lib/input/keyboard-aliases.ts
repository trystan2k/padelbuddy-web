export const configurableKeyboardActions = [
  'add-team-1',
  'revert-team-1',
  'add-team-2',
  'revert-team-2'
] as const;

export type ConfigurableKeyboardAction = (typeof configurableKeyboardActions)[number];
export type KeyboardAction = ConfigurableKeyboardAction | 'undo' | 'unknown';
export type RemoteControllerBindings = Record<ConfigurableKeyboardAction, string | null>;

interface KeyboardAliasMap {
  [key: string]: KeyboardAction;
}

const legacyKeyboardAliases: KeyboardAliasMap = {
  ArrowLeft: 'add-team-1',
  a: 'add-team-1',
  1: 'add-team-1',
  Home: 'add-team-1',
  PageUp: 'add-team-1',
  ArrowRight: 'add-team-2',
  d: 'add-team-2',
  2: 'add-team-2',
  End: 'add-team-2',
  PageDown: 'add-team-2',
  ArrowUp: 'undo',
  Backspace: 'undo',
  u: 'undo',
  Delete: 'undo',
  Escape: 'undo',
  r: 'undo'
};

const defaultRemoteControllerBindings: RemoteControllerBindings = {
  'add-team-1': 'ArrowLeft',
  'revert-team-1': 'Backspace',
  'add-team-2': 'ArrowRight',
  'revert-team-2': 'Delete'
};

const keyboardDisplayLabels: Partial<Record<string, string>> = {
  ' ': 'Space',
  ArrowDown: '↓ Down',
  ArrowLeft: '← Left',
  ArrowRight: '→ Right',
  ArrowUp: '↑ Up',
  Backspace: 'Backspace',
  Delete: 'Delete',
  End: 'End',
  Enter: 'Enter',
  Escape: 'Esc',
  Home: 'Home',
  PageDown: 'Page Down',
  PageUp: 'Page Up',
  Tab: 'Tab'
};

export function getActionFromKey(
  key: string,
  customBindings?: RemoteControllerBindings | null
): KeyboardAction {
  const normalizedKey = normalizeKeyboardBindingKey(key);

  if (!normalizedKey) {
    return 'unknown';
  }

  const customAction = getActionFromBindings(normalizedKey, customBindings);

  if (customAction !== 'unknown') {
    return customAction;
  }

  return legacyKeyboardAliases[normalizedKey] ?? 'unknown';
}

export function normalizeKeyboardBindingKey(key: string): string {
  if (!key) {
    return '';
  }

  return key.length === 1 ? key.toLowerCase() : key;
}

export function getKeyboardBindingDisplayLabel(key: string | null | undefined): string {
  if (!key) {
    return '';
  }

  if (key.length === 1) {
    return key === ' ' ? 'Space' : key.toUpperCase();
  }

  return keyboardDisplayLabels[key] ?? key;
}

export function createEmptyRemoteControllerBindings(): RemoteControllerBindings {
  const bindings = Object.fromEntries(configurableKeyboardActions.map((action) => [action, null]));

  if (!isRemoteControllerBindingsRecord(bindings)) {
    throw new Error('Unable to create empty remote controller bindings.');
  }

  return bindings;
}

function isRemoteControllerBindingsRecord(
  value: Record<string, unknown>
): value is RemoteControllerBindings {
  return configurableKeyboardActions.every((action) => value[action] === null);
}

export function createRemoteControllerBindings(
  overrides: Partial<RemoteControllerBindings> = {}
): RemoteControllerBindings {
  return {
    ...defaultRemoteControllerBindings,
    ...overrides
  };
}

export function assignRemoteControllerBinding(
  currentBindings: RemoteControllerBindings,
  action: ConfigurableKeyboardAction,
  key: string
): RemoteControllerBindings {
  const nextBindings = { ...currentBindings };
  const normalizedNewKey = normalizeKeyboardBindingKey(key);

  for (const currentAction of configurableKeyboardActions) {
    if (currentAction !== action) {
      const existingKey = nextBindings[currentAction];
      if (existingKey && normalizeKeyboardBindingKey(existingKey) === normalizedNewKey) {
        nextBindings[currentAction] = null;
      }
    }
  }

  nextBindings[action] = key;

  return nextBindings;
}

function getActionFromBindings(
  normalizedKey: string,
  bindings?: RemoteControllerBindings | null
): KeyboardAction {
  if (!bindings) {
    return 'unknown';
  }

  for (const action of configurableKeyboardActions) {
    const configuredKey = bindings[action];

    if (configuredKey && normalizeKeyboardBindingKey(configuredKey) === normalizedKey) {
      return action;
    }
  }

  return 'unknown';
}
