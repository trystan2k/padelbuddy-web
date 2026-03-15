import { type SpeechPreferences, verbosityLevels } from './types'

const defaultDatabaseName = 'padel-buddy-web'
const defaultDatabaseVersion = 4
const defaultObjectStoreName = 'speech-preference'

// Shared object store names for coordinated upgrades
const localeStoreName = 'locale-preference'
const speechPreferenceKey = 'speech-preference'

export interface SpeechStorageOptions {
  databaseName?: string
  databaseVersion?: number
  objectStoreName?: string
}

export interface SpeechStorage {
  saveSpeechPreferences(prefs: SpeechPreferences): Promise<void>
  loadSpeechPreferences(): Promise<SpeechPreferences | null>
  clearSpeechPreferences(): Promise<void>
}

export function createSpeechStorage(options: SpeechStorageOptions = {}): SpeechStorage {
  const config = {
    databaseName: options.databaseName ?? defaultDatabaseName,
    databaseVersion: options.databaseVersion ?? defaultDatabaseVersion,
    objectStoreName: options.objectStoreName ?? defaultObjectStoreName
  }

  const saveSpeechPreferences = async (prefs: SpeechPreferences): Promise<void> => {
    await withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).put(prefs, speechPreferenceKey)
      await waitForTransaction(transaction)
    })
  }

  const loadSpeechPreferences = async (): Promise<SpeechPreferences | null> => {
    return withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly')
      const request = transaction.objectStore(config.objectStoreName).get(speechPreferenceKey)
      const storedPrefs = await waitForRequest<SpeechPreferences | undefined>(request)

      await waitForTransaction(transaction)

      if (!storedPrefs) {
        return null
      }

      if (!verbosityLevels.includes(storedPrefs.verbosity)) {
        return null
      }

      return storedPrefs
    })
  }

  const clearSpeechPreferences = async (): Promise<void> => {
    await withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).delete(speechPreferenceKey)
      await waitForTransaction(transaction)
    })
  }

  return {
    saveSpeechPreferences,
    loadSpeechPreferences,
    clearSpeechPreferences
  }
}

// Default instance for convenience
export const speechStorage = createSpeechStorage()
export const saveSpeechPreferences = (prefs: SpeechPreferences) =>
  speechStorage.saveSpeechPreferences(prefs)
export const loadSpeechPreferences = () => speechStorage.loadSpeechPreferences()
export const clearSpeechPreferences = () => speechStorage.clearSpeechPreferences()

function getIndexedDb(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this environment.')
  }

  return indexedDB
}

// Shared object store name for coordinated upgrades
const currentMatchStoreName = 'current-match'

function openDatabase(config: Required<SpeechStorageOptions>): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = getIndexedDb().open(config.databaseName, config.databaseVersion)

    request.addEventListener('upgradeneeded', () => {
      const database = request.result

      // Create all stores to prevent version collision with other modules
      // This ensures all object stores exist regardless of which module opens the DB first
      if (!database.objectStoreNames.contains(config.objectStoreName)) {
        database.createObjectStore(config.objectStoreName)
      }
      if (!database.objectStoreNames.contains(localeStoreName)) {
        database.createObjectStore(localeStoreName)
      }
      if (!database.objectStoreNames.contains(currentMatchStoreName)) {
        database.createObjectStore(currentMatchStoreName)
      }
    })

    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to open the speech preference database.'))
    })

    request.addEventListener('blocked', () => {
      reject(new Error('Opening the speech preference database was blocked.'))
    })
  })
}

async function withDatabase<T>(
  config: Required<SpeechStorageOptions>,
  operation: (database: IDBDatabase) => Promise<T>
): Promise<T> {
  const database = await openDatabase(config)

  try {
    return await operation(database)
  } finally {
    database.close()
  }
}

function waitForRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    })
  })
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
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
