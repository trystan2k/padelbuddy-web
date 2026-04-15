import { describe, expect, test } from 'vitest';

import { createMatchHistoryRecord, parseMatchHistoryRecord } from '@/lib/match-history/persistence';
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence';

import { createTestSetup, winQuickSet } from '../../core/match/test-helpers';

describe('match history persistence parsing', () => {
  test('creates a valid finished history record', () => {
    const finishedAt = Date.now();

    const record = createMatchHistoryRecord({
      matchId: 'history-1',
      setup: createTestSetup(),
      actions: winQuickSet('team-1'),
      startedAt: finishedAt - 1000,
      finishedAt
    });

    expect(record.finishedAt).toBe(finishedAt);
    expect(record.matchId).toBe('history-1');
  });

  test('rejects records without finishedAt', () => {
    expect(() =>
      parseMatchHistoryRecord({
        schemaVersion: currentMatchSchemaVersion,
        matchId: 'missing-finished-at',
        setup: createTestSetup(),
        actions: [],
        startedAt: Date.now()
      })
    ).toThrow('Corrupt match history record: finishedAt must be present.');
  });

  test('rejects unsupported schema versions with a reset-required error', () => {
    expect(() =>
      parseMatchHistoryRecord({
        schemaVersion: currentMatchSchemaVersion + 1,
        matchId: 'schema-mismatch',
        setup: createTestSetup(),
        actions: [],
        startedAt: Date.now(),
        finishedAt: Date.now()
      })
    ).toThrow('Unsupported match history schema version');
  });
});
