import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  deleteMatchHistory,
  listMatchHistory,
  loadMatchHistoryById,
  saveMatchHistory
} from '@/lib/match-history/indexed-db';
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence';
import { persistenceDatabaseVersion } from '@/lib/persistence/indexed-db';

import { createTestSetup, winQuickSet } from '../core/match/test-helpers';

describe('match history IndexedDB persistence', () => {
  const databaseName = 'padel-buddy-web';
  const objectStoreName = 'match-history';
  let runId = '';

  beforeEach(() => {
    runId = crypto.randomUUID();
  });

  afterEach(async () => {
    const records = await listMatchHistory();

    await Promise.all(
      records
        .filter((record) => record.matchId.startsWith(runId))
        .map((record) => deleteMatchHistory(record.matchId))
    );
  });

  test('saves, lists, loads, and deletes history records', async () => {
    const baseTimestamp = Date.now();
    const setup = createTestSetup();
    const actions = winQuickSet('team-1');

    await saveMatchHistory({
      matchId: `${runId}-match-1`,
      setup,
      actions,
      startedAt: baseTimestamp - 10_000,
      finishedAt: baseTimestamp - 1_000
    });
    await saveMatchHistory({
      matchId: `${runId}-match-2`,
      setup,
      actions,
      startedAt: baseTimestamp - 5_000,
      finishedAt: baseTimestamp
    });

    const records = await listMatchHistory();
    const scopedRecords = records.filter((record) => record.matchId.startsWith(runId));

    expect(scopedRecords).toMatchObject([
      { matchId: `${runId}-match-2` },
      { matchId: `${runId}-match-1` }
    ]);
    await expect(loadMatchHistoryById(`${runId}-match-2`)).resolves.toMatchObject({
      schemaVersion: currentMatchSchemaVersion,
      matchId: `${runId}-match-2`
    });

    await deleteMatchHistory(`${runId}-match-2`);

    await expect(loadMatchHistoryById(`${runId}-match-2`)).resolves.toBeUndefined();
    await expect(loadMatchHistoryById(`${runId}-match-1`)).resolves.toMatchObject({
      matchId: `${runId}-match-1`
    });
  });

  test('keeps only the latest 100 finished records', async () => {
    const setup = createTestSetup();
    const actions = winQuickSet('team-1');
    const baseTimestamp = Date.now();

    await Promise.all(
      Array.from({ length: 101 }, (_, index) =>
        saveMatchHistory({
          matchId: `${runId}-match-${index + 1}`,
          setup,
          actions,
          startedAt: baseTimestamp + index + 1,
          finishedAt: baseTimestamp + index + 1
        })
      )
    );

    const records = (await listMatchHistory()).filter((record) => record.matchId.startsWith(runId));

    expect(records).toHaveLength(100);
    expect(records[0]?.matchId).toBe(`${runId}-match-101`);
    expect(records.at(-1)?.matchId).toBe(`${runId}-match-2`);
    await expect(loadMatchHistoryById(`${runId}-match-1`)).resolves.toBeUndefined();
  });

  test('ignores malformed stored entries during list/load', async () => {
    const setup = createTestSetup();

    await writeRawHistoryRecord({
      databaseName,
      objectStoreName,
      key: `${runId}-broken-match`,
      value: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: `${runId}-broken-match`,
        setup,
        actions: []
      }
    });

    const records = await listMatchHistory();
    const scopedRecords = records.filter((record) => record.matchId.startsWith(runId));

    expect(scopedRecords).toEqual([]);
    await expect(loadMatchHistoryById(`${runId}-broken-match`)).resolves.toBeUndefined();
  });
});

async function writeRawHistoryRecord(input: {
  databaseName: string;
  objectStoreName: string;
  key: string;
  value: unknown;
}): Promise<void> {
  const database = await openDatabase(input.databaseName, input.objectStoreName);

  try {
    const transaction = database.transaction(input.objectStoreName, 'readwrite');

    transaction.objectStore(input.objectStoreName).put(input.value, input.key);
    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}

function openDatabase(databaseName: string, objectStoreName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, persistenceDatabaseVersion);

    request.addEventListener('upgradeneeded', () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(objectStoreName)) {
        database.createObjectStore(objectStoreName);
      }
    });

    request.addEventListener('success', () => {
      resolve(request.result);
    });

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to open test IndexedDB database.'));
    });
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => {
      resolve();
    });

    transaction.addEventListener('error', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    });

    transaction.addEventListener('abort', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'));
    });
  });
}
