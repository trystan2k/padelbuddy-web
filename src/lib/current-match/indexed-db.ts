import {
  createCurrentMatchRecord,
  decodeCurrentMatchRecord,
  type CurrentMatchDecodeCorruptResult,
  type CurrentMatchDecodeOkResult,
  type CurrentMatchRecord,
  type CurrentMatchSaveInput
} from './persistence'
import { queueCurrentMatchResetNotice } from './reset-notice'

const defaultDatabaseName = 'padel-buddy-web'
const defaultDatabaseVersion = 1
const defaultObjectStoreName = 'current-match'
const currentMatchRecordKey = 'current-match'

export interface CurrentMatchPersistenceOptions {
  databaseName?: string
  databaseVersion?: number
  objectStoreName?: string
}

export interface CurrentMatchPersistence {
  saveCurrentMatch(input: CurrentMatchSaveInput): Promise<CurrentMatchRecord>
  loadCurrentMatch(): Promise<CurrentMatchLoadResult>
  clearCurrentMatch(): Promise<void>
}

export interface CurrentMatchLoadEmptyResult {
  status: 'empty'
}

export interface CurrentMatchLoadResetRequiredResult {
  status: 'reset-required'
  reason: 'schema-version'
  storedSchemaVersion: number
  // `loadCurrentMatch()` has already cleared the incompatible persisted record before returning.
}

export type CurrentMatchLoadResult =
  | CurrentMatchLoadEmptyResult
  | CurrentMatchDecodeOkResult
  | CurrentMatchDecodeCorruptResult
  | CurrentMatchLoadResetRequiredResult

export function createCurrentMatchPersistence(
  options: CurrentMatchPersistenceOptions = {}
): CurrentMatchPersistence {
  const config = {
    databaseName: options.databaseName ?? defaultDatabaseName,
    databaseVersion: options.databaseVersion ?? defaultDatabaseVersion,
    objectStoreName: options.objectStoreName ?? defaultObjectStoreName
  }

  const saveCurrentMatch = async (input: CurrentMatchSaveInput): Promise<CurrentMatchRecord> => {
    const record = createCurrentMatchRecord(input)

    await withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).put(record, currentMatchRecordKey)
      await waitForTransaction(transaction)
    })

    return record
  }

  const loadCurrentMatch = async (): Promise<CurrentMatchLoadResult> => {
    return withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly')
      const request = transaction.objectStore(config.objectStoreName).get(currentMatchRecordKey)
      const storedRecord = await waitForRequest(request)

      await waitForTransaction(transaction)

      if (typeof storedRecord === 'undefined') {
        return {
          status: 'empty'
        }
      }

      const decodedRecord = decodeCurrentMatchRecord(storedRecord)

      if (decodedRecord.status === 'reset-required') {
        const resetTransaction = database.transaction(config.objectStoreName, 'readwrite')

        resetTransaction.objectStore(config.objectStoreName).delete(currentMatchRecordKey)
        await waitForTransaction(resetTransaction)
        queueCurrentMatchResetNotice({
          reason: 'schema-version'
        })

        return {
          ...decodedRecord
        }
      }

      return decodedRecord
    })
  }

  const clearCurrentMatch = async (): Promise<void> => {
    await withDatabase(config, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).delete(currentMatchRecordKey)
      await waitForTransaction(transaction)
    })
  }

  return {
    saveCurrentMatch,
    loadCurrentMatch,
    clearCurrentMatch
  }
}

export const currentMatchPersistence = createCurrentMatchPersistence()
export const saveCurrentMatch = (input: CurrentMatchSaveInput) =>
  currentMatchPersistence.saveCurrentMatch(input)
export const loadCurrentMatch = () => currentMatchPersistence.loadCurrentMatch()
export const clearCurrentMatch = () => currentMatchPersistence.clearCurrentMatch()

function getIndexedDb(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this environment.')
  }

  return indexedDB
}

function openDatabase(config: Required<CurrentMatchPersistenceOptions>): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = getIndexedDb().open(config.databaseName, config.databaseVersion)

    request.addEventListener('upgradeneeded', () => {
      const database = request.result

      if (!database.objectStoreNames.contains(config.objectStoreName)) {
        database.createObjectStore(config.objectStoreName)
      }
    })

    request.addEventListener('success', () => {
      resolve(request.result)
    })

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to open the current match database.'))
    })

    request.addEventListener('blocked', () => {
      reject(new Error('Opening the current match database was blocked.'))
    })
  })
}

async function withDatabase<T>(
  config: Required<CurrentMatchPersistenceOptions>,
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
