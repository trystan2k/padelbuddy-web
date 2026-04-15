import { describe, expect, test, vi } from 'vitest';

import { Route } from '@/routes/history';

const { mockListMatchHistory } = vi.hoisted(() => ({
  mockListMatchHistory: vi.fn<() => Promise<unknown[]>>(async () => [{ matchId: 'history-1' }])
}));

vi.mock('@/lib/match-history/indexed-db', () => ({
  listMatchHistory: mockListMatchHistory
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({ options })
  };
});

describe('history route', () => {
  test('uses staleTime zero and exposes a component', () => {
    expect(Route.options.staleTime).toBe(0);
    expect(Route.options.component).toBeTypeOf('function');
  });

  test('loads history records from persistence', async () => {
    const loader = Route.options.loader;

    if (typeof loader !== 'function') {
      throw new Error('Expected the history route to expose a loader.');
    }

    await expect(loader({} as never)).resolves.toEqual([{ matchId: 'history-1' }]);
    expect(mockListMatchHistory).toHaveBeenCalledTimes(1);
  });
});
