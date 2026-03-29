import { type SpeechPreferences, verbosityLevels } from './types'
import {
  resolveIndexedDbStorageConfig,
  speechPreferenceObjectStoreName,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '../persistence/indexed-db'

const defaultObjectStoreName = speechPreferenceObjectStoreName
const speechPreferenceKey = 'speech-preference'

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the speech preference database was blocked.',
  openFailed: 'Unable to open the speech preference database.'
}

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
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName)

  const saveSpeechPreferences = async (prefs: SpeechPreferences): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).put(prefs, speechPreferenceKey)
      await waitForIndexedDbTransaction(transaction)
    })
  }

  const loadSpeechPreferences = async (): Promise<SpeechPreferences | null> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly')
      const request = transaction.objectStore(config.objectStoreName).get(speechPreferenceKey)
      const storedPrefs = await waitForIndexedDbRequest<SpeechPreferences | undefined>(request)

      await waitForIndexedDbTransaction(transaction)

      if (!storedPrefs) {
        return null
      }

      if (!verbosityLevels.includes(storedPrefs.verbosity)) {
        return null
      }

      if (typeof storedPrefs.voiceName !== 'string' && storedPrefs.voiceName !== null) {
        return null
      }

      return storedPrefs
    })
  }

  const clearSpeechPreferences = async (): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite')

      transaction.objectStore(config.objectStoreName).delete(speechPreferenceKey)
      await waitForIndexedDbTransaction(transaction)
    })
  }

  return {
    saveSpeechPreferences,
    loadSpeechPreferences,
    clearSpeechPreferences
  }
}

export const speechStorage = createSpeechStorage()
export const saveSpeechPreferences = (prefs: SpeechPreferences) =>
  speechStorage.saveSpeechPreferences(prefs)
export const loadSpeechPreferences = () => speechStorage.loadSpeechPreferences()
export const clearSpeechPreferences = () => speechStorage.clearSpeechPreferences()
