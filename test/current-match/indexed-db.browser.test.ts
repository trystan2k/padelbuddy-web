import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import currentMatchResetNoticeStore from '@/lib/current-match/reset-notice-store';
import {
  createCurrentMatchPersistence,
  type CurrentMatchPersistence
} from '@/lib/current-match/indexed-db';
import {
  currentMatchSchemaVersion,
  replayCurrentMatchRecord
} from '@/lib/current-match/persistence';
import { createLocaleStorage } from '@/lib/i18n/locale-storage';
import type { SupportedLocale } from '@/lib/i18n/types';
import { createRemoteControllerBindings } from '@/lib/input/keyboard-aliases';
import type { RemoteControllerConfig } from '@/lib/input/remote-controller-config';
import { createRemoteControllerStorage } from '@/lib/input/remote-controller-storage';
import { createSetupStorage, type SetupPreferences } from '@/lib/setup/setup-storage';

import { createTestSetup, scorePoints, winQuickGame } from '../core/match/test-helpers';

describe('current match IndexedDB persistence', () => {
  const testMatchId = 'test-match';
  let databaseName = '';
  let objectStoreName = '';
  let persistence: CurrentMatchPersistence;

  beforeEach(() => {
    databaseName = `padel-buddy-current-match-${crypto.randomUUID()}`;
    objectStoreName = 'current-match';
    persistence = createCurrentMatchPersistence({
      databaseName,
      objectStoreName
    });
  });

  afterEach(async () => {
    currentMatchResetNoticeStore.reset();
    await deleteDatabase(databaseName);
  });

  test('saves and loads a single current-match action log', async () => {
    const setup = createTestSetup({
      decidingSetSuperTiebreak: true
    });
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2', 'team-2')];
    const startedAt = Date.now();

    const savedRecord = await persistence.saveCurrentMatch({
      matchId: testMatchId,
      setup,
      actions,
      startedAt
    });
    const loadedRecord = await persistence.loadCurrentMatch();

    expect(savedRecord).toEqual({
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup,
      actions,
      startedAt
    });
    expect(loadedRecord).toEqual({
      status: 'ok',
      record: savedRecord
    });

    if (loadedRecord.status !== 'ok') {
      throw new Error('Expected the stored current match to decode successfully.');
    }

    expect(replayCurrentMatchRecord(loadedRecord.record).state.actionCount).toBe(6);
  });

  test('shares the same IndexedDB bootstrap across persistence modules', async () => {
    const localeStorage = createLocaleStorage({ databaseName });
    const remoteControllerStorage = createRemoteControllerStorage({ databaseName });
    const setupStorage = createSetupStorage({ databaseName });
    const remoteConfig: RemoteControllerConfig = {
      mode: 'keyboard-mapping',
      keyboardBindings: createRemoteControllerBindings({
        'add-team-1': 'q',
        'revert-team-1': 'z',
        'add-team-2': 'w',
        'revert-team-2': 'x'
      }),
      updatedAt: new Date().toISOString()
    };
    const setupPreferences: SetupPreferences = {
      muted: false,
      verbosity: 'standard',
      voiceName: null,
      team1Name: null,
      team2Name: null,
      audioAnnouncementsEnabled: true,
      servingIndicatorEnabled: true,
      countdownTimerEnabled: false,
      countdownTimerDuration: 90,
      sideSwitchPrompts: true,
      format: 'best-of-3',
      gameMode: 'advantage',
      decidingSetSuperTiebreak: false,
      superTiebreakTargetPoints: 11
    };

    await localeStorage.saveLocalePreference('es' as SupportedLocale);
    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'empty'
    });

    const currentMatchRecord = await persistence.saveCurrentMatch({
      matchId: testMatchId,
      setup: createTestSetup(),
      actions: winQuickGame('team-1'),
      startedAt: Date.now()
    });

    await remoteControllerStorage.saveRemoteControllerConfig(remoteConfig);
    await setupStorage.saveSetupPreferences(setupPreferences);

    await expect(localeStorage.loadLocalePreference()).resolves.toBe('es');
    const loadedRemoteConfig = await remoteControllerStorage.loadRemoteControllerConfig();
    expect(loadedRemoteConfig).not.toBeNull();
    expect(loadedRemoteConfig!.mode).toBe('keyboard-mapping');
    expect(loadedRemoteConfig!.keyboardBindings).toEqual(remoteConfig.keyboardBindings);
    await expect(setupStorage.loadSetupPreferences()).resolves.toEqual(setupPreferences);
    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'ok',
      record: currentMatchRecord
    });
  });

  test('clears the stored current match record', async () => {
    await persistence.saveCurrentMatch({
      matchId: testMatchId,
      setup: createTestSetup(),
      actions: winQuickGame('team-1'),
      startedAt: Date.now()
    });

    await persistence.clearCurrentMatch();

    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'empty'
    });
  });

  test('classifies incompatible schema versions as reset-required and queues a one-time notice', async () => {
    const setup = createTestSetup();

    await writeRawRecord({
      databaseName,
      objectStoreName,
      value: {
        schemaVersion: currentMatchSchemaVersion + 1,
        setup,
        actions: []
      }
    });

    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'reset-required',
      reason: 'schema-version',
      storedSchemaVersion: currentMatchSchemaVersion + 1
    });
    expect(currentMatchResetNoticeStore.clear()).toEqual({
      reason: 'schema-version'
    });
    expect(currentMatchResetNoticeStore.clear()).toBeNull();
    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'empty'
    });
  });

  test('classifies malformed stored actions as corrupt without clearing the record', async () => {
    const setup = createTestSetup();

    await writeRawRecord({
      databaseName,
      objectStoreName,
      value: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: testMatchId,
        setup,
        actions: [{ type: 'score-point', teamId: 'team-3' }],
        startedAt: Date.now()
      }
    });

    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'corrupt',
      message: 'Invalid current match action team: team-3'
    });
    expect(currentMatchResetNoticeStore.clear()).toBeNull();
    await expect(persistence.loadCurrentMatch()).resolves.toEqual({
      status: 'corrupt',
      message: 'Invalid current match action team: team-3'
    });
  });
});

async function writeRawRecord(input: {
  databaseName: string;
  objectStoreName: string;
  value: unknown;
}): Promise<void> {
  const database = await openDatabase(input.databaseName, input.objectStoreName);

  try {
    const transaction = database.transaction(input.objectStoreName, 'readwrite');

    transaction.objectStore(input.objectStoreName).put(input.value, 'current-match');
    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}

function openDatabase(databaseName: string, objectStoreName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);

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

function deleteDatabase(databaseName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);

    request.addEventListener('success', () => {
      resolve();
    });

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Unable to delete test IndexedDB database.'));
    });

    request.addEventListener('blocked', () => {
      reject(new Error('Deleting the test IndexedDB database was blocked.'));
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
