import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { createMatchSetup } from '../../src/core/match/validation';
import type { MatchAction, MatchSetupInput, MatchTeamId } from '../../src/core/match/types';
import {
  currentMatchSchemaVersion,
  createCurrentMatchRecord,
  type CurrentMatchRecord
} from '../../src/lib/current-match/persistence';

import {
  sharedIndexedDbObjectStoreNames,
  currentMatchObjectStoreName,
  persistenceDatabaseName,
  persistenceDatabaseVersion
} from '../../src/lib/persistence/indexed-db';

const defaultStartedAt = 1_700_000_000_000;
const defaultFinishedAt = defaultStartedAt + 5 * 60 * 1000;

const defaultDatabaseName = persistenceDatabaseName;
const defaultDatabaseVersion = persistenceDatabaseVersion;
const defaultObjectStoreName = currentMatchObjectStoreName;
const currentMatchRecordKey = 'current-match';

interface SeedMatchOptions {
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

function createSetup(overrides: Partial<MatchSetupInput> = {}) {
  return createMatchSetup({
    format: 'best-of-1',
    gameMode: 'advantage',
    initialServer: 'team-1',
    decidingSetSuperTiebreak: false,
    audioAnnouncementsEnabled: false,
    servingIndicatorEnabled: true,
    countdownTimerEnabled: false,
    countdownTimerDuration: 90,
    superTiebreakTargetPoints: 11,
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

async function ensureAppOrigin(page: Page): Promise<void> {
  if (page.url().startsWith('http://localhost:4000/')) {
    return;
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

async function putRecord(page: Page, record: unknown): Promise<void> {
  await ensureAppOrigin(page);

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
      key: currentMatchRecordKey,
      value: record
    }
  );
}

function buildCompletedMatchRecord(options: SeedMatchOptions = {}): CurrentMatchRecord {
  const {
    matchId = 'completed-match',
    team1Name = 'Team A',
    team2Name = 'Team B',
    startedAt = defaultStartedAt,
    finishedAt = defaultFinishedAt
  } = options;

  return createCurrentMatchRecord({
    matchId,
    startedAt,
    finishedAt,
    setup: createSetup({
      sides: [
        { id: 'team-1', playerNames: [team1Name] },
        { id: 'team-2', playerNames: [team2Name] }
      ]
    }),
    actions: createScoreActions('team-1', 24)
  });
}

function buildInProgressMatchRecord(options: SeedMatchOptions = {}): CurrentMatchRecord {
  const {
    matchId = 'in-progress-match',
    team1Name = 'Team A',
    team2Name = 'Team B',
    startedAt = defaultStartedAt
  } = options;

  return createCurrentMatchRecord({
    matchId,
    startedAt,
    setup: createSetup({
      format: 'best-of-3',
      sides: [
        { id: 'team-1', playerNames: [team1Name] },
        { id: 'team-2', playerNames: [team2Name] }
      ]
    }),
    actions: [...createScoreActions('team-1', 4), ...createScoreActions('team-2', 2)]
  });
}

function buildInvalidCurrentMatchRecord(): Record<string, unknown> {
  return {
    schemaVersion: currentMatchSchemaVersion,
    matchId: '',
    setup: null,
    actions: 'invalid-actions',
    startedAt: 'invalid-started-at'
  };
}

function buildSchemaMismatchRecord(options: SeedMatchOptions = {}): Record<string, unknown> {
  const record = buildInProgressMatchRecord(options);

  return {
    ...record,
    schemaVersion: currentMatchSchemaVersion - 1
  };
}

export async function seedCompletedMatchRecord(page: Page, options: SeedMatchOptions = {}) {
  const record = buildCompletedMatchRecord(options);
  await putRecord(page, record);
  return record;
}

export async function seedInProgressMatchRecord(page: Page, options: SeedMatchOptions = {}) {
  const record = buildInProgressMatchRecord(options);
  await putRecord(page, record);
  return record;
}

export async function seedInvalidCurrentMatchRecord(page: Page): Promise<void> {
  await putRecord(page, buildInvalidCurrentMatchRecord());
}

export async function seedSchemaMismatchRecord(
  page: Page,
  options: SeedMatchOptions = {}
): Promise<void> {
  await putRecord(page, buildSchemaMismatchRecord(options));
}

export async function expectCurrentMatchCleared(page: Page): Promise<void> {
  await ensureAppOrigin(page);

  const isCleared = await page.evaluate(
    async ({ databaseName, databaseVersion, objectStoreName, key }) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);

        request.addEventListener('upgradeneeded', () => {
          // Guard against first-open reads in a clean browser context.
        });

        request.addEventListener('success', () => resolve(request.result));
        request.addEventListener('error', () => {
          reject(request.error ?? new Error('Failed to open IndexedDB.'));
        });
      });

      try {
        return await new Promise<boolean>((resolve, reject) => {
          const transaction = database.transaction(objectStoreName, 'readonly');
          const request = transaction.objectStore(objectStoreName).get(key);

          request.addEventListener('success', () => resolve(typeof request.result === 'undefined'));
          request.addEventListener('error', () => {
            reject(request.error ?? new Error('IndexedDB read failed.'));
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
      key: currentMatchRecordKey
    }
  );

  expect(isCleared).toBe(true);
}
