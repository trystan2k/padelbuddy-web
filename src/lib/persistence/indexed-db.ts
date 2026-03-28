export const persistenceDatabaseName = 'padel-buddy-web'
export const persistenceDatabaseVersion = 4

export const currentMatchObjectStoreName = 'current-match'
export const localePreferenceObjectStoreName = 'locale-preference'
export const speechPreferenceObjectStoreName = 'speech-preference'

export const sharedIndexedDbObjectStoreNames = [
  currentMatchObjectStoreName,
  localePreferenceObjectStoreName,
  speechPreferenceObjectStoreName
] as const

export interface IndexedDbStorageOptions {
  databaseName?: string
  databaseVersion?: number
  objectStoreName?: string
}

export interface IndexedDbStorageConfig {
  databaseName: string
  databaseVersion: number
  objectStoreName: string
}

export interface IndexedDbOpenMessages {
  blocked: string
  openFailed: string
}

export function resolveIndexedDbStorageConfig(
  options: IndexedDbStorageOptions,
  defaultObjectStoreName: string
): IndexedDbStorageConfig {
  return {
    databaseName: options.databaseName ?? persistenceDatabaseName,
    databaseVersion: options.databaseVersion ?? persistenceDatabaseVersion,
    objectStoreName: options.objectStoreName ?? defaultObjectStoreName
  }
}

export function openIndexedDbDatabase(
  config: IndexedDbStorageConfig,
  messages: IndexedDbOpenMessages
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = getIndexedDb().open(config.databaseName, config.databaseVersion)

    request.addEventListener('upgradeneeded', () => {
      const database = request.result

      for (const objectStoreName of getRegisteredObjectStoreNames(config.objectStoreName)) {
        if (!database.objectStoreNames.contains(objectStoreName)) {
          database.createObjectStore(objectStoreName)
        }
      }
    })

    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error(messages.openFailed))
    })

    request.addEventListener('blocked', () => {
      reject(new Error(messages.blocked))
    })
  })
}

export async function withIndexedDbDatabase<T>(
  config: IndexedDbStorageConfig,
  messages: IndexedDbOpenMessages,
  operation: (database: IDBDatabase) => Promise<T>
): Promise<T> {
  const database = await openIndexedDbDatabase(config, messages)

  try {
    return await operation(database)
  } finally {
    database.close()
  }
}

export function waitForIndexedDbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    })
  })
}

export function waitForIndexedDbTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => {
      resolve()
    })

    transaction.addEventListener('error', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    })

    transaction.addEventListener('abort', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'))
    })
  })
}

function getIndexedDb(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this environment.')
  }

  return indexedDB
}

function getRegisteredObjectStoreNames(objectStoreName: string): string[] {
  return [...new Set([...sharedIndexedDbObjectStoreNames, objectStoreName])]
}
