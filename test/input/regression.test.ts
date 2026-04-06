import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { projectMatch } from '@/core/match/replay';
import type { MatchTeamId } from '@/core/match/types';
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence';
import { createCurrentMatchSession } from '@/lib/current-match/session';
import type {
  CurrentMatchLoadResult,
  CurrentMatchPersistence
} from '@/lib/current-match/indexed-db';
import { createRemoteControllerBindings, getActionFromKey } from '@/lib/input/keyboard-aliases';

import { createTestSetup, scorePoints } from '../core/match/test-helpers';

describe('input regression', () => {
  const testMatchId = 'test-match';
  const testStartedAt = Date.now();
  let persistence: CurrentMatchPersistence;

  beforeEach(() => {
    persistence = {
      saveCurrentMatch: vi
        .fn<CurrentMatchPersistence['saveCurrentMatch']>()
        .mockImplementation(async ({ matchId = testMatchId, setup, actions, startedAt }) => ({
          schemaVersion: currentMatchSchemaVersion,
          matchId,
          setup,
          actions,
          startedAt: startedAt ?? testStartedAt
        })),
      loadCurrentMatch: vi.fn<() => Promise<CurrentMatchLoadResult>>(),
      clearCurrentMatch: vi.fn<() => Promise<void>>()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('session scoring still matches the direct domain projection', async () => {
    const setup = createTestSetup();
    const scoreSequence: MatchTeamId[] = ['team-1', 'team-1', 'team-2', 'team-2', 'team-1'];

    const session = createCurrentMatchSession({
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: testStartedAt,
      persistence
    });

    for (const teamId of scoreSequence) {
      await session.scorePoint(teamId); // eslint-disable-line no-await-in-loop
    }

    expect(session.getSnapshot().projection).toEqual(
      projectMatch(setup, scorePoints(...scoreSequence))
    );
  });

  test('custom remote bindings resolve before the legacy shortcuts', () => {
    const bindings = createRemoteControllerBindings({
      'add-team-1': 'ArrowRight',
      'add-team-2': 'ArrowLeft',
      'revert-team-1': 'z',
      'revert-team-2': 'x'
    });

    expect(getActionFromKey('ArrowRight', bindings)).toBe('add-team-1');
    expect(getActionFromKey('ArrowLeft', bindings)).toBe('add-team-2');
    expect(getActionFromKey('z', bindings)).toBe('revert-team-1');
    expect(getActionFromKey('x', bindings)).toBe('revert-team-2');
    expect(getActionFromKey('Escape', bindings)).toBe('undo');
  });
});
