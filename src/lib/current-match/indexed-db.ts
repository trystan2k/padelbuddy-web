import {
  createCurrentMatchRecord,
  decodeCurrentMatchRecord,
  type CurrentMatchDecodeCorruptResult,
  type CurrentMatchDecodeOkResult,
  type CurrentMatchRecord,
  type CurrentMatchSaveInput
} from './persistence';
import currentMatchResetNoticeStore from './reset-notice-store';
import {
  currentMatchObjectStoreName,
  resolveIndexedDbStorageConfig,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '@/lib/persistence/indexed-db';

const defaultObjectStoreName = currentMatchObjectStoreName;
const currentMatchRecordKey = 'current-match';

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the current match database was blocked.',
  openFailed: 'Unable to open the current match database.'
};

interface CurrentMatchPersistenceOptions {
  databaseName?: string;
  databaseVersion?: number;
  objectStoreName?: string;
}

export interface CurrentMatchPersistence {
  saveCurrentMatch(input: CurrentMatchSaveInput): Promise<CurrentMatchRecord>;
  loadCurrentMatch(): Promise<CurrentMatchLoadResult>;
  clearCurrentMatch(): Promise<void>;
}

export interface CurrentMatchLoadEmptyResult {
  status: 'empty';
}

export interface CurrentMatchLoadResetRequiredResult {
  status: 'reset-required';
  reason: 'schema-version';
  storedSchemaVersion: number;
}

export type CurrentMatchLoadResult =
  | CurrentMatchLoadEmptyResult
  | CurrentMatchDecodeOkResult
  | CurrentMatchDecodeCorruptResult
  | CurrentMatchLoadResetRequiredResult;

export function createCurrentMatchPersistence(
  options: CurrentMatchPersistenceOptions = {}
): CurrentMatchPersistence {
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName);

  const saveCurrentMatch = async (input: CurrentMatchSaveInput): Promise<CurrentMatchRecord> => {
    const record = createCurrentMatchRecord(input);

    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).put(record, currentMatchRecordKey);
      await waitForIndexedDbTransaction(transaction);
    });

    return record;
  };

  const loadCurrentMatch = async (): Promise<CurrentMatchLoadResult> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly');
      const request = transaction.objectStore(config.objectStoreName).get(currentMatchRecordKey);
      const storedRecord = await waitForIndexedDbRequest(request);

      await waitForIndexedDbTransaction(transaction);

      if (typeof storedRecord === 'undefined') {
        return {
          status: 'empty'
        };
      }

      const decodedRecord = decodeCurrentMatchRecord(storedRecord);

      if (decodedRecord.status === 'reset-required') {
        const resetTransaction = database.transaction(config.objectStoreName, 'readwrite');

        resetTransaction.objectStore(config.objectStoreName).delete(currentMatchRecordKey);
        await waitForIndexedDbTransaction(resetTransaction);
        currentMatchResetNoticeStore.set({
          reason: 'schema-version'
        });

        return {
          ...decodedRecord
        };
      }

      return decodedRecord;
    });
  };

  const clearCurrentMatch = async (): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).delete(currentMatchRecordKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  return {
    saveCurrentMatch,
    loadCurrentMatch,
    clearCurrentMatch
  };
}

export const currentMatchPersistence = createCurrentMatchPersistence();
export const saveCurrentMatch = (input: CurrentMatchSaveInput) =>
  currentMatchPersistence.saveCurrentMatch(input);
export const loadCurrentMatch = () => currentMatchPersistence.loadCurrentMatch();
export const clearCurrentMatch = () => currentMatchPersistence.clearCurrentMatch();
