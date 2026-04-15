import {
  matchHistoryObjectStoreName,
  resolveIndexedDbStorageConfig,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '@/lib/persistence/indexed-db';

import {
  createMatchHistoryRecord,
  parseMatchHistoryRecord,
  type MatchHistoryRecord,
  type MatchHistorySaveInput
} from './persistence';

const defaultObjectStoreName = matchHistoryObjectStoreName;
const maxMatchHistoryRecords = 100;

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the match history database was blocked.',
  openFailed: 'Unable to open the match history database.'
};

interface MatchHistoryPersistenceOptions {
  databaseName?: string;
  databaseVersion?: number;
  objectStoreName?: string;
}

interface MatchHistoryPersistence {
  saveMatchHistory(input: MatchHistorySaveInput): Promise<MatchHistoryRecord>;
  listMatchHistory(): Promise<MatchHistoryRecord[]>;
  loadMatchHistoryById(matchId: string): Promise<MatchHistoryRecord | undefined>;
  deleteMatchHistory(matchId: string): Promise<void>;
}

function createMatchHistoryPersistence(
  options: MatchHistoryPersistenceOptions = {}
): MatchHistoryPersistence {
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName);

  const saveMatchHistory = async (input: MatchHistorySaveInput): Promise<MatchHistoryRecord> => {
    const record = createMatchHistoryRecord(input);

    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');
      const objectStore = transaction.objectStore(config.objectStoreName);

      objectStore.put(record, record.matchId);

      const allKeys = await waitForIndexedDbRequest(objectStore.getAllKeys());
      const overflowCount = allKeys.length - maxMatchHistoryRecords;

      if (overflowCount > 0) {
        const storedRecords = await waitForIndexedDbRequest(objectStore.getAll());
        const parsedRecords = parseHistoryRecords(storedRecords);
        const parsedMatchIds = new Set(parsedRecords.map((parsedRecord) => parsedRecord.matchId));
        const malformedStringKeys = allKeys.filter(
          (key): key is string => typeof key === 'string' && !parsedMatchIds.has(key)
        );
        const malformedNonStringKeys = allKeys.filter(
          (key): key is IDBValidKey => typeof key !== 'string'
        );
        const overflowParsedMatchIds = sortMatchHistoryByNewest(parsedRecords)
          .slice(maxMatchHistoryRecords)
          .map((parsedRecord) => parsedRecord.matchId);
        const keysToDelete = [
          ...malformedNonStringKeys,
          ...malformedStringKeys,
          ...overflowParsedMatchIds
        ].slice(0, overflowCount);

        for (const keyToDelete of keysToDelete) {
          objectStore.delete(keyToDelete);
        }
      }

      await waitForIndexedDbTransaction(transaction);
    });

    return record;
  };

  const listMatchHistory = async (): Promise<MatchHistoryRecord[]> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly');
      const request = transaction.objectStore(config.objectStoreName).getAll();
      const storedRecords = await waitForIndexedDbRequest(request);

      await waitForIndexedDbTransaction(transaction);

      return sortMatchHistoryByNewest(parseHistoryRecords(storedRecords));
    });
  };

  const loadMatchHistoryById = async (matchId: string): Promise<MatchHistoryRecord | undefined> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly');
      const request = transaction.objectStore(config.objectStoreName).get(matchId);
      const storedRecord = await waitForIndexedDbRequest(request);

      await waitForIndexedDbTransaction(transaction);

      if (typeof storedRecord === 'undefined') {
        return undefined;
      }

      try {
        return parseMatchHistoryRecord(storedRecord);
      } catch (error) {
        console.warn('[match-history] Ignoring corrupt history record for matchId', matchId, error);
        return undefined;
      }
    });
  };

  const deleteMatchHistory = async (matchId: string): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).delete(matchId);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  return {
    saveMatchHistory,
    listMatchHistory,
    loadMatchHistoryById,
    deleteMatchHistory
  };
}

function parseHistoryRecords(storedRecords: unknown[]): MatchHistoryRecord[] {
  const records: MatchHistoryRecord[] = [];

  for (const storedRecord of storedRecords) {
    try {
      records.push(parseMatchHistoryRecord(storedRecord));
    } catch (error) {
      console.warn('[match-history] Ignoring corrupt history record in collection.', error);
    }
  }

  return records;
}

function sortMatchHistoryByNewest(records: MatchHistoryRecord[]): MatchHistoryRecord[] {
  const copy = [...records];
  copy.sort((left, right) => right.finishedAt - left.finishedAt);
  return copy;
}

const matchHistoryPersistence = createMatchHistoryPersistence();
export const saveMatchHistory = (input: MatchHistorySaveInput) =>
  matchHistoryPersistence.saveMatchHistory(input);
export const listMatchHistory = () => matchHistoryPersistence.listMatchHistory();
export const loadMatchHistoryById = (matchId: string) =>
  matchHistoryPersistence.loadMatchHistoryById(matchId);
export const deleteMatchHistory = (matchId: string) =>
  matchHistoryPersistence.deleteMatchHistory(matchId);
