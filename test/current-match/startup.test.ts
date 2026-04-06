import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  currentMatchSchemaVersion,
  type CurrentMatchRecord,
  type CurrentMatchSaveInput
} from '@/lib/current-match/persistence';
import { hydrateCurrentMatchStartup } from '@/lib/current-match/startup';
import currentMatchResetNoticeStore from '@/lib/current-match/reset-notice-store';
import type { CurrentMatchPersistence } from '@/lib/current-match/indexed-db';

import { createTestSetup, winQuickSet } from '../core/match/test-helpers';

describe('current match startup', () => {
  const testMatchId = 'test-match';
  const testStartedAt = Date.now();

  afterEach(() => {
    currentMatchResetNoticeStore.reset();
  });

  test('returns ready with serializable completed match data', async () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    });
    const actions = winQuickSet('team-1');

    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: testMatchId,
            setup,
            actions,
            startedAt: testStartedAt
          }
        })
      })
    });

    expect(result.status).toBe('ready');

    if (result.status !== 'ready') {
      throw new Error('Expected startup hydration to enter the ready state.');
    }

    expect(result.match.snapshot.projection.derived.status).toBe('completed');
    expect(result.match.matchId).toBe(testMatchId);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  test('returns corrupt when the stored record cannot be decoded', async () => {
    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'corrupt',
          message: 'Current match payload is corrupt.'
        })
      })
    });

    expect(result).toEqual({
      status: 'corrupt',
      notice: null,
      message: 'Current match payload is corrupt.'
    });
  });

  test('consumes the one-time reset notice after a reset-required load', async () => {
    currentMatchResetNoticeStore.set({
      reason: 'schema-version'
    });

    const persistence = createPersistenceStub({
      loadCurrentMatch: async () => ({
        status: 'reset-required',
        reason: 'schema-version',
        storedSchemaVersion: currentMatchSchemaVersion + 1
      })
    });

    await expect(hydrateCurrentMatchStartup({ persistence })).resolves.toEqual({
      status: 'no-match',
      notice: {
        reason: 'schema-version'
      }
    });
    await expect(hydrateCurrentMatchStartup({ persistence })).resolves.toEqual({
      status: 'no-match',
      notice: null
    });
  });

  test('returns no-match when no persisted match exists', async () => {
    await expect(
      hydrateCurrentMatchStartup({
        persistence: createPersistenceStub({
          loadCurrentMatch: async () => ({
            status: 'empty'
          })
        })
      })
    ).resolves.toEqual({
      status: 'no-match',
      notice: null
    });
  });

  test('returns resume-required with serializable in-progress match data', async () => {
    const setup = createTestSetup({
      format: 'best-of-3'
    });
    const actions = [{ type: 'score-point', teamId: 'team-1' }] as const;

    const result = await hydrateCurrentMatchStartup({
      persistence: createPersistenceStub({
        loadCurrentMatch: async () => ({
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: testMatchId,
            setup,
            actions: [...actions],
            startedAt: testStartedAt
          }
        })
      })
    });

    expect(result.status).toBe('resume-required');

    if (result.status !== 'resume-required') {
      throw new Error('Expected startup hydration to require a resume decision.');
    }

    expect(result.match.matchId).toBe(testMatchId);
    expect(result.match.snapshot.actions).toEqual([...actions]);
    expect(result.match.snapshot.projection.derived.status).toBe('in-progress');
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });
});

function createPersistenceStub(overrides: {
  loadCurrentMatch: CurrentMatchPersistence['loadCurrentMatch'];
}): CurrentMatchPersistence {
  return {
    saveCurrentMatch: vi.fn<(input: CurrentMatchSaveInput) => Promise<CurrentMatchRecord>>(),
    loadCurrentMatch: overrides.loadCurrentMatch,
    clearCurrentMatch: vi.fn<() => Promise<void>>(async () => undefined)
  };
}
