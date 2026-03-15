import { supportedLocales, type LocalePreference, type SupportedLocale } from './types'

const defaultDatabaseName = 'padel-buddy-web'
const defaultDatabaseVersion = 4
const defaultObjectStoreName = 'locale-preference'

// Shared object store names for coordinated upgrades
const speechStoreName = 'speech-preference'
const localePreferenceKey = 'locale-preference'

export interface LocaleStorageOptions {
  databaseName?: string
  databaseVersion?: number
  objectStoreName?: string
}

export interface LocaleStorage {
  saveLocalePreference(locale: SupportedLocale): Promise<void>
  loadLocalePreference(): Promise<SupportedLocale | null>
  clearLocalePreference(): Promise<void>
}

export function createLocaleStorage(options: LocaleStorageOptions = {}): LocaleStorage {
  const config = {
    databaseName: options.databaseName ?? defaultDatabaseName,
    databaseVersion: options.databaseVersion ?? defaultDatabaseVersion,
    objectStoreName: options.objectStoreName ?? defaultObjectStoreName
  }

  const saveLocalePreference = async (locale: SupportedLocale): Promise<void> => {
    const preference: LocalePreference = {
      locale,
      updatedAt: new Date().toISOString()
    }

    await withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).put(preference, localePreferenceKey)
      await waitForTransaction(transaction)
    })
  }

  const loadLocalePreference = async (): Promise<SupportedLocale | null> => {
    return withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly')
      const request = transaction.objectStore(config.objectStoreName).get(localePreferenceKey)
      const storedPreference = await waitForRequest<LocalePreference | undefined>(request)

      await waitForTransaction(transaction)

      if (!storedPreference) {
        return null
      }

      // Validate that the stored locale is still supported
      if (supportedLocales.includes(storedPreference.locale)) {
        return storedPreference.locale
      }

      return null
    })
  }

  const clearLocalePreference = async (): Promise<void> => {
    await withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).delete(localePreferenceKey)
      await waitForTransaction(transaction)
    })
  }

  return {
    saveLocalePreference,
    loadLocalePreference,
    clearLocalePreference
  }
}

// Default instance for convenience
export const localeStorage = createLocaleStorage()
export const saveLocalePreference = (locale: SupportedLocale) =>
  localeStorage.saveLocalePreference(locale)
export const loadLocalePreference = () => localeStorage.loadLocalePreference()
export const clearLocalePreference = () => localeStorage.clearLocalePreference()

function getIndexedDb(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this environment.')
  }

  return indexedDB
}

// Shared object store name for coordinated upgrades
const currentMatchStoreName = 'current-match'

function openDatabase(config: Required<LocaleStorageOptions>): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = getIndexedDb().open(config.databaseName, config.databaseVersion)

    request.addEventListener('upgradeneeded', () => {
      const database = request.result

      // Create all stores to prevent version collision with other modules
      // This ensures all object stores exist regardless of which module opens the DB first
      if (!database.objectStoreNames.contains(speechStoreName)) {
        database.createObjectStore(speechStoreName)
      }
      if (!database.objectStoreNames.contains(config.objectStoreName)) {
        database.createObjectStore(config.objectStoreName)
      }
      if (!database.objectStoreNames.contains(currentMatchStoreName)) {
        database.createObjectStore(currentMatchStoreName)
      }
    })

    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to open the locale preference database.'))
    })

    request.addEventListener('blocked', () => {
      reject(new Error('Opening the locale preference database was blocked.'))
    })
  })
}

async function withDatabase<T>(
  config: Required<LocaleStorageOptions>,
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
