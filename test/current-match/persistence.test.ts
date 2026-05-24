import { describe, expect, test } from 'vitest';

import { continueMatch, projectMatch } from '@/core/match/replay';
import { defaultSuperTiebreakTargetPoints } from '@/core/match/types';
import {
  createCurrentMatchRecord,
  currentMatchSchemaVersion,
  decodeCurrentMatchRecord,
  parseCurrentMatchRecord,
  replayCurrentMatchRecord
} from '@/lib/current-match/persistence';

import { createTestSetup, scorePoints, winQuickGame } from '../core/match/test-helpers';

describe('current match persistence helpers', () => {
  const legacySuperTiebreakTargetPoints = 10;
  const testMatchId = 'test-match';
  const testStartedAt = Date.now();
  const testFinishedAt = testStartedAt + 5 * 60 * 1000;

  test('creates a versioned record from canonical setup and actions', () => {
    const setup = createTestSetup({
      decidingSetSuperTiebreak: true,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120
    });
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2', 'team-2')];

    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup,
      actions,
      startedAt: testStartedAt
    });

    expect(record).toEqual({
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup,
      actions,
      startedAt: testStartedAt
    });
  });

  test('normalizes best-of-1 setup input when building a persisted record', () => {
    const setup = createTestSetup({
      format: 'best-of-1',
      decidingSetSuperTiebreak: true,
      bestOfOneDecidingBehavior: 'super-tiebreak',
      countdownTimerEnabled: true,
      countdownTimerDuration: 60
    });

    expect(
      createCurrentMatchRecord({
        matchId: testMatchId,
        setup,
        actions: [],
        startedAt: testStartedAt
      })
    ).toEqual({
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt
    });
  });

  test('trims match ids when creating and decoding persisted records', () => {
    const setup = createTestSetup();
    const record = createCurrentMatchRecord({
      matchId: `  ${testMatchId}  `,
      setup,
      actions: [],
      startedAt: testStartedAt
    });

    expect(record.matchId).toBe(testMatchId);
    expect(
      parseCurrentMatchRecord({
        ...record,
        matchId: `  ${testMatchId}  `
      }).matchId
    ).toBe(testMatchId);
  });

  test('persists and restores finishedAt for completed matches', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    });
    const actions = Array.from({ length: 6 }, () => winQuickGame('team-1')).flat();

    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup,
      actions,
      startedAt: testStartedAt,
      finishedAt: testFinishedAt
    });

    expect(record.finishedAt).toBe(testFinishedAt);
    expect(parseCurrentMatchRecord(record).finishedAt).toBe(testFinishedAt);
  });

  test('round-trips countdown timer fields in persisted setup', () => {
    const setup = createTestSetup({
      countdownTimerEnabled: true,
      countdownTimerDuration: 120
    });

    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt
    });

    const decodedRecord = parseCurrentMatchRecord(record);

    expect(decodedRecord.setup.countdownTimerEnabled).toBe(true);
    expect(decodedRecord.setup.countdownTimerDuration).toBe(120);
  });

  test('round-trips serving indicator enabled in persisted setup', () => {
    const setup = createTestSetup({
      servingIndicatorEnabled: false
    });

    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt
    });

    const decodedRecord = parseCurrentMatchRecord(record);

    expect(decodedRecord.setup.servingIndicatorEnabled).toBe(false);
  });

  test('defaults legacy in-progress persisted setups to historical super tiebreak target', () => {
    const legacyRecord = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt
    };

    const decodedRecord = parseCurrentMatchRecord(legacyRecord);

    expect(decodedRecord.setup.audioAnnouncementsEnabled).toBe(true);
    expect(decodedRecord.setup.servingIndicatorEnabled).toBe(true);
    expect(decodedRecord.setup.countdownTimerEnabled).toBe(false);
    expect(decodedRecord.setup.countdownTimerDuration).toBe(90);
    expect(decodedRecord.setup.superTiebreakTargetPoints).toBe(legacySuperTiebreakTargetPoints);
    expect(decodedRecord.legacyInProgressSuperTiebreakTargetPoints).toBe(
      legacySuperTiebreakTargetPoints
    );
  });

  test('preserves legacy in-progress side-switch prompts when persisted field is missing', () => {
    const legacyRecordMissingSideSwitchPrompts = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt
    };

    const decodedRecord = parseCurrentMatchRecord(legacyRecordMissingSideSwitchPrompts);

    expect(decodedRecord.setup.sideSwitchPrompts).toBe(true);
  });

  test('preserves legacy in-progress target across save/resume cycles with explicit metadata', () => {
    const legacyRecord = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt
    };

    const decodedRecord = parseCurrentMatchRecord(legacyRecord);
    const reSavedRecord = createCurrentMatchRecord({
      matchId: decodedRecord.matchId,
      setup: decodedRecord.setup,
      actions: decodedRecord.actions,
      startedAt: decodedRecord.startedAt,
      ...(decodedRecord.legacyInProgressSuperTiebreakTargetPoints === undefined
        ? {}
        : {
            legacyInProgressSuperTiebreakTargetPoints:
              decodedRecord.legacyInProgressSuperTiebreakTargetPoints
          })
    });

    expect(reSavedRecord.setup.superTiebreakTargetPoints).toBe(legacySuperTiebreakTargetPoints);
    expect(reSavedRecord.legacyInProgressSuperTiebreakTargetPoints).toBe(
      legacySuperTiebreakTargetPoints
    );
  });

  test('ignores invalid legacy in-progress metadata while preserving legacy fallback behavior', () => {
    const legacyRecordWithInvalidMetadata = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt,
      legacyInProgressSuperTiebreakTargetPoints: 'invalid'
    };

    const decodedRecord = decodeCurrentMatchRecord(legacyRecordWithInvalidMetadata);

    expect(decodedRecord.status).toBe('ok');
    if (decodedRecord.status !== 'ok') {
      throw new Error('Expected status ok.');
    }
    expect(decodedRecord.record.setup.superTiebreakTargetPoints).toBe(
      legacySuperTiebreakTargetPoints
    );
    expect(decodedRecord.record.legacyInProgressSuperTiebreakTargetPoints).toBe(
      legacySuperTiebreakTargetPoints
    );
  });

  test('defaults legacy finished persisted setups to the new default target', () => {
    const legacyFinishedRecord = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt,
      finishedAt: testFinishedAt
    };

    const decodedRecord = parseCurrentMatchRecord(legacyFinishedRecord);

    expect(decodedRecord.setup.superTiebreakTargetPoints).toBe(defaultSuperTiebreakTargetPoints);
  });

  test('defaults corrupted persisted serving indicator values', () => {
    const recordWithInvalidServingIndicator = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        audioAnnouncementsEnabled: 'false',
        servingIndicatorEnabled: 'false',
        countdownTimerEnabled: false,
        countdownTimerDuration: 90,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt
    };

    const decodedRecord = parseCurrentMatchRecord(recordWithInvalidServingIndicator);

    expect(decodedRecord.setup.audioAnnouncementsEnabled).toBe(true);
    expect(decodedRecord.setup.servingIndicatorEnabled).toBe(true);
  });

  test('defaults corrupted persisted countdown duration values', () => {
    const recordWithInvalidDuration = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: false,
        audioAnnouncementsEnabled: true,
        countdownTimerEnabled: true,
        countdownTimerDuration: 75,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt
    };

    const decodedRecord = parseCurrentMatchRecord(recordWithInvalidDuration);

    expect(decodedRecord.setup.countdownTimerDuration).toBe(90);
  });

  test('defaults corrupted persisted super tiebreak target points values', () => {
    const recordWithInvalidTarget = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup: {
        format: 'best-of-3',
        gameMode: 'advantage',
        initialServer: 'team-1',
        decidingSetSuperTiebreak: true,
        audioAnnouncementsEnabled: true,
        countdownTimerEnabled: false,
        countdownTimerDuration: 90,
        superTiebreakTargetPoints: 10,
        sideSwitchPrompts: false,
        sides: [
          { id: 'team-1', playerNames: ['Ana', 'Bea'] },
          { id: 'team-2', playerNames: ['Carla', 'Dani'] }
        ]
      },
      actions: [],
      startedAt: testStartedAt
    };

    const decodedRecord = parseCurrentMatchRecord(recordWithInvalidTarget);

    expect(decodedRecord.setup.superTiebreakTargetPoints).toBe(defaultSuperTiebreakTargetPoints);
    expect(decodedRecord.legacyInProgressSuperTiebreakTargetPoints).toBeUndefined();
  });

  test('round-trips audio announcements enabled in persisted setup', () => {
    const setup = createTestSetup({
      audioAnnouncementsEnabled: false
    });

    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt
    });

    const decodedRecord = parseCurrentMatchRecord(record);

    expect(decodedRecord.setup.audioAnnouncementsEnabled).toBe(false);
  });

  test('classifies same-version data as ok and replays through the pure match domain', () => {
    const setup = createTestSetup();
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2')];
    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup,
      actions,
      startedAt: testStartedAt
    });
    const decodedRecord = decodeCurrentMatchRecord(record);

    expect(decodedRecord).toEqual({
      status: 'ok',
      record
    });
    expect(replayCurrentMatchRecord(record)).toEqual(projectMatch(setup, actions));
  });

  test('preserves setCap null when an endless continued match is persisted and restored', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    });
    const actions = Array.from({ length: 6 }, () => winQuickGame('team-1')).flat();
    const continuedSetup = continueMatch(setup, projectMatch(setup, actions).state);
    const record = createCurrentMatchRecord({
      matchId: testMatchId,
      setup: continuedSetup,
      actions,
      startedAt: testStartedAt
    });
    const decodedRecord = parseCurrentMatchRecord(record);

    expect(record.setup.setCap).toBeNull();
    expect(decodedRecord.setup.setCap).toBeNull();
    expect(replayCurrentMatchRecord(decodedRecord).setup.setCap).toBeNull();
  });

  test('classifies incompatible schema versions as reset-required', () => {
    const setup = createTestSetup();

    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion + 1,
        setup,
        actions: []
      })
    ).toEqual({
      status: 'reset-required',
      reason: 'schema-version',
      storedSchemaVersion: currentMatchSchemaVersion + 1
    });
    expect(() =>
      parseCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion + 1,
        setup,
        actions: []
      })
    ).toThrowError(`Unsupported current match schema version: ${currentMatchSchemaVersion + 1}`);
  });

  test('classifies malformed current-version payloads as corrupt', () => {
    const setup = createTestSetup();

    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        matchId: testMatchId,
        setup,
        actions: [{ type: 'score-point', teamId: 'team-3' }],
        startedAt: testStartedAt
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Invalid current match action team: team-3'
    });
  });

  test('rejects blank match ids after trimming whitespace', () => {
    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        matchId: '   ',
        setup: createTestSetup(),
        actions: [],
        startedAt: testStartedAt
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Current match matchId must be a non-empty string.'
    });
  });

  test('classifies invalid schema metadata as corrupt', () => {
    expect(
      decodeCurrentMatchRecord({
        schemaVersion: '1',
        setup: createTestSetup(),
        actions: []
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Invalid current match schema version: 1'
    });
  });

  test('throws the corruption message when parsing invalid current-version data', () => {
    expect(() =>
      parseCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        matchId: testMatchId,
        setup: createTestSetup(),
        actions: {
          type: 'score-point'
        },
        startedAt: testStartedAt
      })
    ).toThrowError('Current match actions must be an array.');
  });

  test('classifies non-object payloads as corrupt', () => {
    expect(decodeCurrentMatchRecord('invalid payload')).toEqual({
      status: 'corrupt',
      message: 'Current match record must be an object.'
    });
  });

  test('rejects unsupported action types in current-version payloads', () => {
    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        matchId: testMatchId,
        setup: createTestSetup(),
        actions: [{ type: 'pause-match', teamId: 'team-1' }],
        startedAt: testStartedAt
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Unsupported current match action type: pause-match'
    });
  });

  test('rejects finishedAt values earlier than startedAt', () => {
    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        matchId: testMatchId,
        setup: createTestSetup(),
        actions: [],
        startedAt: testStartedAt,
        finishedAt: testStartedAt - 1
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Current match finishedAt must be a number greater than or equal to startedAt.'
    });
  });
});
