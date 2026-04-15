import { describe, expect, test, vi } from 'vitest';

import { Route } from '@/routes/match.finish.$id';

const { mockLoadMappedReadyMatchRouteState } = vi.hoisted(() => ({
  mockLoadMappedReadyMatchRouteState: vi.fn<
    (
      matchId: string,
      mode: string,
      mapReadyState: (routeState: {
        record: { matchId: string };
        projection: { id: string };
      }) => unknown,
      source: 'current' | 'history'
    ) => Promise<unknown>
  >(async (matchId, _mode, mapReadyState, source) =>
    mapReadyState({
      record: { matchId },
      projection: { id: `${source}-${matchId}` }
    })
  )
}));

vi.mock('@/routes/-route-utils', () => ({
  getOptionalFinishedAt: (finishedAt: number | undefined) =>
    typeof finishedAt === 'number' ? { finishedAt } : {},
  RouteErrorState: () => null,
  loadMappedReadyMatchRouteState: mockLoadMappedReadyMatchRouteState
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({ options })
  };
});

describe('match.finish route search + loader source', () => {
  test('accepts only from=history search values', () => {
    const validateSearch = Route.options.validateSearch;

    if (typeof validateSearch !== 'function') {
      throw new Error('Expected the finish route to expose validateSearch.');
    }

    expect(validateSearch({ from: 'history' })).toEqual({ from: 'history' });
    expect(validateSearch({ from: 'other' })).toEqual({});
    expect(validateSearch({})).toEqual({});
  });

  test('loads history source when deps.from is history', async () => {
    const loader = Route.options.loader;

    if (typeof loader !== 'function') {
      throw new Error('Expected the finish route to expose a loader.');
    }

    await expect(
      loader({
        params: { id: 'history-match' },
        deps: { from: 'history' }
      } as never)
    ).resolves.toEqual({
      matchId: 'history-match',
      record: { matchId: 'history-match' },
      projection: { id: 'history-history-match' },
      source: 'history'
    });

    expect(mockLoadMappedReadyMatchRouteState).toHaveBeenCalledWith(
      'history-match',
      'finish',
      expect.any(Function),
      'history'
    );
  });

  test('falls back to current source when deps are missing', async () => {
    const loader = Route.options.loader;

    if (typeof loader !== 'function') {
      throw new Error('Expected the finish route to expose a loader.');
    }

    await expect(
      loader({
        params: { id: 'current-match' }
      } as never)
    ).resolves.toMatchObject({
      source: 'current'
    });
  });

  test('extracts the from search parameter through loaderDeps', () => {
    const loaderDeps = Route.options.loaderDeps;

    if (typeof loaderDeps !== 'function') {
      throw new Error('Expected the finish route to expose loaderDeps.');
    }

    expect(loaderDeps({ search: { from: 'history' } })).toEqual({ from: 'history' });
    expect(loaderDeps({ search: {} })).toEqual({ from: undefined });
  });
});
