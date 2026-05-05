import {
  createEmptyRemoteControllerBindings,
  type RemoteControllerBindings
} from './keyboard-aliases';

/**
 * Remote controller mode types.
 * - 'media-buttons': Uses fixed media button mappings (Previous/Next Track with single/double press)
 * - 'keyboard-mapping': Uses customizable keyboard bindings
 */
type RemoteControllerMode = 'media-buttons' | 'keyboard-mapping';

/**
 * Full remote controller configuration persisted in storage.
 */
export interface RemoteControllerConfig {
  mode: RemoteControllerMode;
  keyboardBindings: RemoteControllerBindings;
  updatedAt: string;
}

/**
 * Legacy stored record shape - only keyboard bindings without mode.
 */
interface LegacyRemoteControllerBindings {
  bindings: RemoteControllerBindings;
  updatedAt: string;
}

/**
 * Default configuration for new users: Media Buttons mode with empty keyboard bindings.
 */
const defaultRemoteControllerConfig: RemoteControllerConfig = {
  mode: 'media-buttons',
  keyboardBindings: createEmptyRemoteControllerBindings(),
  updatedAt: new Date().toISOString()
};

/**
 * Creates a default remote controller config.
 */
export function createDefaultRemoteControllerConfig(): RemoteControllerConfig {
  return { ...defaultRemoteControllerConfig, updatedAt: new Date().toISOString() };
}

/**
 * Creates a config with keyboard-mapping mode for migrated legacy users.
 */
export function createKeyboardMappingConfig(
  keyboardBindings: RemoteControllerBindings
): RemoteControllerConfig {
  return {
    mode: 'keyboard-mapping',
    keyboardBindings,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Checks if a stored value is a legacy bindings-only record.
 */
export function isLegacyRemoteControllerBindings(
  value: unknown
): value is LegacyRemoteControllerBindings {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LegacyRemoteControllerBindings>;

  if (!candidate.bindings || typeof candidate.bindings !== 'object') {
    return false;
  }

  if (typeof candidate.updatedAt !== 'string') {
    return false;
  }

  return true;
}

/**
 * Checks if a stored value is a new full config record.
 */
export function isRemoteControllerConfig(value: unknown): value is RemoteControllerConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RemoteControllerConfig>;

  if (typeof candidate.mode !== 'string') {
    return false;
  }

  if (candidate.mode !== 'media-buttons' && candidate.mode !== 'keyboard-mapping') {
    return false;
  }

  if (!candidate.keyboardBindings || typeof candidate.keyboardBindings !== 'object') {
    return false;
  }

  if (typeof candidate.updatedAt !== 'string') {
    return false;
  }

  return true;
}
