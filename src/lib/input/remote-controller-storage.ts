import {
  remoteControllerPreferenceObjectStoreName,
  resolveIndexedDbStorageConfig,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '@/lib/persistence/indexed-db'

import {
  configurableKeyboardActions,
  createEmptyRemoteControllerBindings,
  type RemoteControllerBindings,
  normalizeKeyboardBindingKey
} from './keyboard-aliases'

const defaultObjectStoreName = remoteControllerPreferenceObjectStoreName
const remoteControllerBindingsKey = 'remote-controller-bindings'

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the remote controller database was blocked.',
  openFailed: 'Unable to open the remote controller database.'
}

export interface RemoteControllerStorageOptions {
  databaseName?: string
  databaseVersion?: number
  objectStoreName?: string
}

export interface StoredRemoteControllerBindings {
  bindings: RemoteControllerBindings
  updatedAt: string
}

export interface RemoteControllerStorage {
  saveRemoteControllerBindings(bindings: RemoteControllerBindings): Promise<void>
  loadRemoteControllerBindings(): Promise<RemoteControllerBindings | null>
  clearRemoteControllerBindings(): Promise<void>
}

export async function loadRemoteControllerBindingsWithFallback(): Promise<RemoteControllerBindings> {
  const storedBindings = await loadRemoteControllerBindings()

  return storedBindings ?? createEmptyRemoteControllerBindings()
}

export function createRemoteControllerStorage(
  options: RemoteControllerStorageOptions = {}
): RemoteControllerStorage {
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName)

  const saveRemoteControllerBindings = async (
    bindings: RemoteControllerBindings
  ): Promise<void> => {
    const record: StoredRemoteControllerBindings = {
      bindings: sanitizeRemoteControllerBindings(bindings),
      updatedAt: new Date().toISOString()
    }

    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).put(record, remoteControllerBindingsKey)
      await waitForIndexedDbTransaction(transaction)
    })
  }

  const loadRemoteControllerBindings = async (): Promise<RemoteControllerBindings | null> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly')
      const request = transaction
        .objectStore(config.objectStoreName)
        .get(remoteControllerBindingsKey)
      const storedRecord = await waitForIndexedDbRequest<
        StoredRemoteControllerBindings | undefined
      >(request)

      await waitForIndexedDbTransaction(transaction)

      if (!storedRecord) {
        return null
      }

      return parseStoredRemoteControllerBindings(storedRecord)
    })
  }

  const clearRemoteControllerBindings = async (): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).delete(remoteControllerBindingsKey)
      await waitForIndexedDbTransaction(transaction)
    })
  }

  return {
    saveRemoteControllerBindings,
    loadRemoteControllerBindings,
    clearRemoteControllerBindings
  }
}

export function parseStoredRemoteControllerBindings(
  value: unknown
): RemoteControllerBindings | null {
  if (!isStoredRemoteControllerBindings(value)) {
    return null
  }

  return sanitizeRemoteControllerBindings(value.bindings)
}

export function sanitizeRemoteControllerBindings(
  bindings: Partial<RemoteControllerBindings>
): RemoteControllerBindings {
  const sanitizedBindings = createEmptyRemoteControllerBindings()

  for (const action of configurableKeyboardActions) {
    const value = bindings[action]

    sanitizedBindings[action] =
      typeof value === 'string' && normalizeKeyboardBindingKey(value) ? value : null
  }

  return sanitizedBindings
}

function isStoredRemoteControllerBindings(value: unknown): value is StoredRemoteControllerBindings {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredRemoteControllerBindings>

  if (!candidate.bindings || typeof candidate.bindings !== 'object') {
    return false
  }

  if (typeof candidate.updatedAt !== 'string') {
    return false
  }

  return configurableKeyboardActions.every((action) => {
    const binding = candidate.bindings?.[action]
    return binding === null || typeof binding === 'string'
  })
}

export const remoteControllerStorage = createRemoteControllerStorage()
export const saveRemoteControllerBindings = (bindings: RemoteControllerBindings) =>
  remoteControllerStorage.saveRemoteControllerBindings(bindings)
export const loadRemoteControllerBindings = () =>
  remoteControllerStorage.loadRemoteControllerBindings()
export const clearRemoteControllerBindings = () =>
  remoteControllerStorage.clearRemoteControllerBindings()
