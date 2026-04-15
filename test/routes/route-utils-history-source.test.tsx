import { describe, expect, test, vi } from 'vitest';

import { currentMatchSchemaVersion } from '@/lib/current-match/persistence';
import { loadMappedReadyMatchRouteState } from '@/routes/-route-utils';

import { createTestSetup, winQuickSet } from '../core/match/test-helpers';

const { mockLoadMatchHistoryById } = vi.hoisted(() => ({
  mockLoadMatchHistoryById: vi.fn<(matchId: string) => Promise<unknown>>()
}));

vi.mock('@/lib/match-history/indexed-db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/match-history/indexed-db')>();

  return {
    ...actual,
    loadMatchHistoryById: mockLoadMatchHistoryById
  };
});

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    redirect: (options: unknown) => options
  };
});

describe('loadMappedReadyMatchRouteState with history source', () => {
  test('redirects home when history record is not found', async () => {
    mockLoadMatchHistoryById.mockResolvedValue(undefined);

    await expect(
      loadMappedReadyMatchRouteState('missing-id', 'finish', (state) => state, 'history')
    ).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'no-match' }
    });
  });

  test('returns mapped ready state for a completed history match in finish mode', async () => {
    const setup = createTestSetup();
    const record = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: 'history-1',
      setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: 1000,
      finishedAt: 2000
    };

    mockLoadMatchHistoryById.mockResolvedValue(record);

    const result = await loadMappedReadyMatchRouteState(
      'history-1',
      'finish',
      (routeState) => ({
        mappedId: routeState.record.matchId,
        projectionStatus: routeState.projection.derived.status
      }),
      'history'
    );

    expect(result).toEqual({
      mappedId: 'history-1',
      projectionStatus: 'completed'
    });
  });
});
