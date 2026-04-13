import {
  remoteControllerPreferenceObjectStoreName,
  resolveIndexedDbStorageConfig,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '@/lib/persistence/indexed-db';

import {
  configurableKeyboardActions,
  createEmptyRemoteControllerBindings,
  type RemoteControllerBindings,
  normalizeKeyboardBindingKey
} from './keyboard-aliases';

import {
  createDefaultRemoteControllerConfig,
  createKeyboardMappingConfig,
  isLegacyRemoteControllerBindings,
  isRemoteControllerConfig,
  type RemoteControllerConfig
} from './remote-controller-config';

const defaultObjectStoreName = remoteControllerPreferenceObjectStoreName;
const remoteControllerBindingsKey = 'remote-controller-bindings';

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the remote controller database was blocked.',
  openFailed: 'Unable to open the remote controller database.'
};

interface StoredRemoteControllerConfig {
  mode: RemoteControllerConfig['mode'];
  keyboardBindings: RemoteControllerBindings;
  updatedAt: string;
}

interface RemoteControllerStorage {
  saveRemoteControllerConfig(config: RemoteControllerConfig): Promise<void>;
  loadRemoteControllerConfig(): Promise<RemoteControllerConfig | null>;
  clearRemoteControllerConfig(): Promise<void>;
}

export function loadRemoteControllerConfigWithFallback(): Promise<RemoteControllerConfig> {
  const storedConfig = loadRemoteControllerConfig();

  return storedConfig.then((config) => config ?? createDefaultRemoteControllerConfig());
}

export function createRemoteControllerStorage(
  options: { databaseName?: string; databaseVersion?: number; objectStoreName?: string } = {}
): RemoteControllerStorage {
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName);

  const saveRemoteControllerConfig = async (
    configToSave: RemoteControllerConfig
  ): Promise<void> => {
    const record: StoredRemoteControllerConfig = {
      mode: configToSave.mode,
      keyboardBindings: sanitizeRemoteControllerBindings(configToSave.keyboardBindings),
      updatedAt: new Date().toISOString()
    };

    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).put(record, remoteControllerBindingsKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  const loadRemoteControllerConfig = async (): Promise<RemoteControllerConfig | null> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly');
      const request = transaction
        .objectStore(config.objectStoreName)
        .get(remoteControllerBindingsKey);
      const storedRecord = await waitForIndexedDbRequest<StoredRemoteControllerConfig | undefined>(
        request
      );

      await waitForIndexedDbTransaction(transaction);

      if (!storedRecord) {
        return null;
      }

      return parseStoredRemoteControllerConfig(storedRecord);
    });
  };

  const clearRemoteControllerConfig = async (): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).delete(remoteControllerBindingsKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  return {
    saveRemoteControllerConfig,
    loadRemoteControllerConfig,
    clearRemoteControllerConfig
  };
}

function parseStoredRemoteControllerConfig(value: unknown): RemoteControllerConfig | null {
  if (isRemoteControllerConfig(value)) {
    return {
      mode: value.mode,
      keyboardBindings: sanitizeRemoteControllerBindings(value.keyboardBindings),
      updatedAt: value.updatedAt
    };
  }

  if (isLegacyRemoteControllerBindings(value)) {
    // Migrate legacy keyboard-only config to keyboard-mapping mode
    return createKeyboardMappingConfig(sanitizeRemoteControllerBindings(value.bindings));
  }

  return null;
}

function sanitizeRemoteControllerBindings(
  bindings: Partial<RemoteControllerBindings>
): RemoteControllerBindings {
  const sanitizedBindings = createEmptyRemoteControllerBindings();

  for (const action of configurableKeyboardActions) {
    const value = bindings[action];

    sanitizedBindings[action] =
      typeof value === 'string' && normalizeKeyboardBindingKey(value) ? value : null;
  }

  return sanitizedBindings;
}

const remoteControllerStorage = createRemoteControllerStorage();
export const saveRemoteControllerConfig = (config: RemoteControllerConfig) =>
  remoteControllerStorage.saveRemoteControllerConfig(config);
const loadRemoteControllerConfig = () => remoteControllerStorage.loadRemoteControllerConfig();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clearRemoteControllerConfig = () => remoteControllerStorage.clearRemoteControllerConfig();

// Re-export the config types for convenience
export type { RemoteControllerConfig } from './remote-controller-config';
export { createDefaultRemoteControllerConfig } from './remote-controller-config';
