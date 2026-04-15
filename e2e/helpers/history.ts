import type { Page } from '@playwright/test';

import { createMatchSetup } from '../../src/core/match/validation';
import type { MatchAction, MatchSetupInput, MatchTeamId } from '../../src/core/match/types';

import {
  createMatchHistoryRecord,
  type MatchHistoryRecord
} from '../../src/lib/match-history/persistence';

import {
  sharedIndexedDbObjectStoreNames,
  matchHistoryObjectStoreName,
  persistenceDatabaseName,
  persistenceDatabaseVersion
} from '../../src/lib/persistence/indexed-db';

const defaultStartedAt = 1_700_000_000_000;
const defaultFinishedAt = defaultStartedAt + 5 * 60 * 1000;

const defaultDatabaseName = persistenceDatabaseName;
const defaultDatabaseVersion = persistenceDatabaseVersion;
const defaultObjectStoreName = matchHistoryObjectStoreName;

interface BuildHistoryRecordOptions {
  matchId?: string;
  team1Name?: string;
  team2Name?: string;
  startedAt?: number;
  finishedAt?: number;
}

const defaultSides: MatchSetupInput['sides'] = [
  { id: 'team-1', playerNames: ['Team A'] },
  { id: 'team-2', playerNames: ['Team B'] }
];

function createHistorySetup(overrides: Partial<MatchSetupInput> = {}) {
  return createMatchSetup({
    format: 'best-of-1',
    gameMode: 'advantage',
    initialServer: 'team-1',
    decidingSetSuperTiebreak: false,
    audioAnnouncementsEnabled: false,
    servingIndicatorEnabled: true,
    countdownTimerEnabled: false,
    countdownTimerDuration: 90,
    sideSwitchPrompts: false,
    sides: defaultSides,
    ...overrides
  });
}

function createScoreActions(teamId: MatchTeamId, count: number): MatchAction[] {
  return Array.from({ length: count }, () => ({
    type: 'score-point',
    teamId
  }));
}

async function putHistoryRecord(page: Page, record: MatchHistoryRecord): Promise<void> {
  await page.evaluate(
    async ({ databaseName, databaseVersion, objectStoreName, objectStoreNames, key, value }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);

        request.addEventListener('upgradeneeded', () => {
          const nextDatabase = request.result;

          for (const registeredObjectStoreName of objectStoreNames) {
            if (!nextDatabase.objectStoreNames.contains(registeredObjectStoreName)) {
              nextDatabase.createObjectStore(registeredObjectStoreName);
            }
          }

          if (!nextDatabase.objectStoreNames.contains(objectStoreName)) {
            nextDatabase.createObjectStore(objectStoreName);
          }
        });

        request.addEventListener('success', () => resolve(request.result));
        request.addEventListener('error', () => {
          reject(request.error ?? new Error('Failed to open IndexedDB.'));
        });
      });

      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(objectStoreName, 'readwrite');

          transaction.objectStore(objectStoreName).put(value, key);
          transaction.addEventListener('complete', () => resolve());
          transaction.addEventListener('error', () => {
            reject(transaction.error ?? new Error('IndexedDB write failed.'));
          });
          transaction.addEventListener('abort', () => {
            reject(transaction.error ?? new Error('IndexedDB write was aborted.'));
          });
        });
      } finally {
        database.close();
      }
    },
    {
      databaseName: defaultDatabaseName,
      databaseVersion: defaultDatabaseVersion,
      objectStoreName: defaultObjectStoreName,
      objectStoreNames: [...sharedIndexedDbObjectStoreNames],
      key: record.matchId,
      value: record
    }
  );
}

function buildMatchHistoryRecord(options: BuildHistoryRecordOptions = {}): MatchHistoryRecord {
  const {
    matchId = 'history-match',
    team1Name = 'Team A',
    team2Name = 'Team B',
    startedAt = defaultStartedAt,
    finishedAt = defaultFinishedAt
  } = options;

  return createMatchHistoryRecord({
    matchId,
    startedAt,
    finishedAt,
    setup: createHistorySetup({
      sides: [
        { id: 'team-1', playerNames: [team1Name] },
        { id: 'team-2', playerNames: [team2Name] }
      ]
    }),
    actions: createScoreActions('team-1', 24)
  });
}

export async function seedHistoryRecord(
  page: Page,
  options: BuildHistoryRecordOptions = {}
): Promise<MatchHistoryRecord> {
  const record = buildMatchHistoryRecord(options);
  await putHistoryRecord(page, record);
  return record;
}

export async function clearHistoryRecords(page: Page): Promise<void> {
  await page.evaluate(
    async ({ databaseName, databaseVersion, objectStoreName, objectStoreNames }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);

        request.addEventListener('upgradeneeded', () => {
          const nextDatabase = request.result;

          for (const registeredObjectStoreName of objectStoreNames) {
            if (!nextDatabase.objectStoreNames.contains(registeredObjectStoreName)) {
              nextDatabase.createObjectStore(registeredObjectStoreName);
            }
          }
        });

        request.addEventListener('success', () => resolve(request.result));
        request.addEventListener('error', () => {
          reject(request.error ?? new Error('Failed to open IndexedDB.'));
        });
      });

      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = database.transaction(objectStoreName, 'readwrite');
          const objectStore = transaction.objectStore(objectStoreName);
          const clearRequest = objectStore.clear();

          clearRequest.addEventListener('success', () => resolve());
          clearRequest.addEventListener('error', () => {
            reject(clearRequest.error ?? new Error('Failed to clear history object store.'));
          });
          transaction.addEventListener('error', () => {
            reject(transaction.error ?? new Error('IndexedDB clear transaction failed.'));
          });
        });
      } finally {
        database.close();
      }
    },
    {
      databaseName: defaultDatabaseName,
      databaseVersion: defaultDatabaseVersion,
      objectStoreName: defaultObjectStoreName,
      objectStoreNames: [...sharedIndexedDbObjectStoreNames]
    }
  );
}
