import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import type { ComponentType } from 'react';

import { SetupScreen } from '@/components/SetupScreen/SetupScreen';
import { ToastProvider } from '@/components/ui/Toast/useToast';
import {
  clearCurrentMatch,
  loadCurrentMatch,
  saveCurrentMatch
} from '@/lib/current-match/indexed-db';
import { helpSpotlightSeenStorageKey } from '@/lib/user/help_spotlight_storage';
import {
  hydrateCurrentMatchStartup,
  type CurrentMatchStartupResult
} from '@/lib/current-match/startup';
import { HomeScreen } from '@/components/HomeScreen/HomeScreen';
import { Route as HomeIndexRoute } from '@/routes/index';
import { Route as MatchRoute } from '@/routes/match.$id';
import { Route as MatchFinishRoute } from '@/routes/match.finish.$id';

import { createTestSetup, scorePoints, winQuickSet } from '../core/match/test-helpers';

const { mockInvalidate, mockNavigate, mockPreloadRoute, mockRouteSearch } = vi.hoisted(() => ({
  mockInvalidate: vi.fn<() => Promise<void>>(),
  mockNavigate: vi.fn<() => void>(),
  mockPreloadRoute: vi.fn<() => Promise<void>>(),
  mockRouteSearch: {
    current: {} as { error?: string }
  }
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({
      options,
      useLoaderData: vi.fn<() => unknown>(),
      useSearch: () => mockRouteSearch.current,
      isPending: false,
      error: false
    }),
    useNavigate: () => mockNavigate,
    useRouter: () => ({
      invalidate: mockInvalidate,
      preloadRoute: mockPreloadRoute
    }),
    redirect: (options: unknown) => options
  };
});

describe('app flow integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockInvalidate.mockResolvedValue(undefined);
    mockPreloadRoute.mockResolvedValue(undefined);
    mockRouteSearch.current = {};
    localStorage.setItem(helpSpotlightSeenStorageKey, 'true');
    await clearCurrentMatch();
    await setHomeStartupState({ status: 'no-match', notice: null });
  });

  afterEach(async () => {
    mockRouteSearch.current = {};
    await clearCurrentMatch();
  });

  test('completes the setup to match to end to setup flow', async () => {
    const setupScreen = await render(<SetupScreen />);

    await setupScreen.getByRole('button', { name: 'Start Match' }).click();

    const startNavigation = await waitForNavigationCall('/match/$id');
    const matchId = getNavigationMatchId(startNavigation);
    const startedMatch = await loadCurrentMatch();

    expect(mockInvalidate).not.toHaveBeenCalled();
    expect(mockPreloadRoute).toHaveBeenCalledWith({
      to: '/match/$id',
      params: { id: matchId }
    });

    expect(startedMatch.status).toBe('ok');
    if (startedMatch.status !== 'ok') {
      throw new Error('Expected the started match to be persisted.');
    }

    await setupScreen.unmount();
    mockNavigate.mockClear();

    const activeLoaderData = await runMatchRouteLoader(matchId);
    setRouteLoaderData(MatchRoute, activeLoaderData);
    const MatchRouteComponent = getRouteComponent(MatchRoute, 'active match');

    const activeMatchScreen = await render(<MatchRouteComponent />);

    await expect.element(activeMatchScreen.getByTestId('layout-body')).toBeInTheDocument();

    await activeMatchScreen.unmount();

    await saveCurrentMatch({
      matchId,
      setup: startedMatch.record.setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: startedMatch.record.startedAt
    });

    await expect(runMatchRouteLoader(matchId)).rejects.toMatchObject({
      to: '/match/finish/$id',
      params: { id: matchId },
      replace: true
    });

    const finishLoaderData = await runMatchFinishRouteLoader(matchId);
    setRouteLoaderData(MatchFinishRoute, finishLoaderData);
    const MatchFinishRouteComponent = getRouteComponent(MatchFinishRoute, 'finish match');

    const matchEndScreen = await render(<MatchFinishRouteComponent />);

    await expect.element(matchEndScreen.getByTestId('match-end-screen')).toBeInTheDocument();
    await matchEndScreen.getByRole('button', { name: 'New Match' }).click();

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/', viewTransition: true });
    });
    expect(mockPreloadRoute).toHaveBeenCalledWith({ to: '/' });

    await matchEndScreen.unmount();
    mockNavigate.mockClear();

    const startupState = await hydrateCurrentMatchStartup();
    const homeScreen = await render(<HomeScreen startupState={startupState} />);

    await expect.element(homeScreen.getByRole('button', { name: 'Start Match' })).toBeVisible();
    expect(document.body.textContent).not.toContain('Resume saved match?');
  });

  test('resumes an active match after a page refresh flow', async () => {
    const setup = createTestSetup();
    const matchId = 'resume-match';

    await saveCurrentMatch({
      matchId,
      setup,
      actions: scorePoints('team-1', 'team-2', 'team-1'),
      startedAt: Date.now()
    });

    const startupState = await hydrateCurrentMatchStartup();
    const homeScreen = await render(<HomeScreen startupState={startupState} />);

    await expect
      .element(homeScreen.getByRole('heading', { level: 2, name: 'Resume saved match?' }))
      .toBeVisible();

    await homeScreen.getByRole('button', { name: 'Resume match' }).click();

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: matchId },
        viewTransition: true
      });
    });
    expect(mockInvalidate).not.toHaveBeenCalled();
    expect(mockPreloadRoute).toHaveBeenCalledWith({
      to: '/match/$id',
      params: { id: matchId }
    });

    const activeLoaderData = await runMatchRouteLoader(matchId);
    setRouteLoaderData(MatchRoute, activeLoaderData);
    const MatchRouteComponent = getRouteComponent(MatchRoute, 'active match');

    await homeScreen.unmount();

    const activeMatchScreen = await render(<MatchRouteComponent />);

    await expect.element(activeMatchScreen.getByTestId('layout-body')).toBeInTheDocument();
  });

  test('redirects invalid active deep links home through the loader and preserves the home notice flow', async () => {
    const setup = createTestSetup();
    const persistedMatchId = 'real-match';

    await saveCurrentMatch({
      matchId: persistedMatchId,
      setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: Date.now()
    });

    await expect(runMatchRouteLoader('invalid-id')).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'invalid-match' }
    });

    mockRouteSearch.current = { error: 'invalid-match' };
    const startupState = await hydrateCurrentMatchStartup();

    const homeScreen = await render(
      <ToastProvider>
        <HomeScreen startupState={startupState} error="invalid-match" />
      </ToastProvider>
    );

    await expect.element(homeScreen.getByTestId('layout-body')).toBeInTheDocument();
    await homeScreen.unmount();
  });

  test('redirects in-progress finish deep links back to the active route through the loader', async () => {
    const setup = createTestSetup();
    const matchId = 'finish-loader-redirect';

    await saveCurrentMatch({
      matchId,
      setup,
      actions: scorePoints('team-1', 'team-2'),
      startedAt: Date.now()
    });

    await expect(runMatchFinishRouteLoader(matchId)).rejects.toMatchObject({
      to: '/match/$id',
      params: { id: matchId },
      replace: true
    });
  });

  test('continues a finished match with fresh active-route data', async () => {
    const setup = createTestSetup();
    const matchId = 'continued-match';

    await saveCurrentMatch({
      matchId,
      setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: Date.now() - 5 * 60 * 1000,
      finishedAt: Date.now() - 60 * 1000
    });

    const finishLoaderData = await runMatchFinishRouteLoader(matchId);
    setRouteLoaderData(MatchFinishRoute, finishLoaderData);
    const MatchFinishRouteComponent = getRouteComponent(MatchFinishRoute, 'finish match');

    const matchEndScreen = await render(<MatchFinishRouteComponent />);

    await matchEndScreen.getByTestId('continue-match-button').click();

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: matchId },
        replace: true,
        viewTransition: true
      });
    });

    const resumedMatch = await loadCurrentMatch();

    expect(resumedMatch.status).toBe('ok');
    if (resumedMatch.status !== 'ok') {
      throw new Error('Expected the continued match to be persisted.');
    }

    expect(resumedMatch.record.finishedAt).toBeUndefined();

    const activeLoaderData = await runMatchRouteLoader(matchId);

    expect(activeLoaderData).toMatchObject({
      matchId,
      record: expect.objectContaining({
        matchId
      })
    });
    expect(activeLoaderData.record.finishedAt).toBeUndefined();
  });

  test('renders setup screen on home route', async () => {
    const startupState = await hydrateCurrentMatchStartup();
    const homeScreen = await render(<HomeScreen startupState={startupState} />);

    await expect.element(homeScreen.getByRole('button', { name: 'Start Match' })).toBeVisible();
  });

  test('home route wrapper forwards validated error search to HomeScreen', async () => {
    mockRouteSearch.current = { error: 'corrupt' };

    const HomeRouteComponent = getRouteComponent(HomeIndexRoute, 'home index');
    const homeRouteScreen = await render(
      <ToastProvider>
        <HomeRouteComponent />
      </ToastProvider>
    );

    await expect.element(homeRouteScreen.getByTestId('layout-body')).toBeInTheDocument();
  });
});

async function setHomeStartupState(startupState: CurrentMatchStartupResult): Promise<void> {
  const loader = HomeIndexRoute.useLoaderData;

  if (!vi.isMockFunction(loader)) {
    throw new Error('Expected the home route loader to be mocked in integration tests.');
  }

  loader.mockReturnValue({ startupState });
}

async function runMatchRouteLoader(matchId: string) {
  const loader = MatchRoute.options.loader;

  if (typeof loader !== 'function') {
    throw new Error('Expected the active match route to expose a loader.');
  }

  return loader({ params: { id: matchId } } as never);
}

async function runMatchFinishRouteLoader(matchId: string) {
  const loader = MatchFinishRoute.options.loader;

  if (typeof loader !== 'function') {
    throw new Error('Expected the finish match route to expose a loader.');
  }

  return loader({ params: { id: matchId } } as never);
}

function setRouteLoaderData(
  route: {
    useLoaderData: unknown;
  },
  loaderData: unknown
) {
  const useLoaderData = route.useLoaderData as ReturnType<typeof vi.fn>;

  if (!vi.isMockFunction(useLoaderData)) {
    throw new Error('Expected route loader data to be mocked in integration tests.');
  }

  useLoaderData.mockReturnValue(loaderData);
}

function getRouteComponent(
  route: {
    options: {
      component?: unknown;
    };
  },
  label: string
): ComponentType {
  const component = route.options.component;

  if (typeof component !== 'function') {
    throw new Error(`Expected the ${label} route to expose a component.`);
  }

  return component as ComponentType;
}

function getNavigationMatchId(navigation: unknown): string {
  if (
    typeof navigation !== 'object' ||
    navigation === null ||
    !('params' in navigation) ||
    typeof navigation.params !== 'object' ||
    navigation.params === null ||
    !('id' in navigation.params) ||
    typeof navigation.params.id !== 'string'
  ) {
    throw new Error('Expected navigation params to include a string match id.');
  }

  return navigation.params.id;
}

async function waitForNavigationCall(to: string): Promise<unknown> {
  await vi.waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to
      })
    );
  });

  const matchingCall = [...mockNavigate.mock.calls]
    .map((calls): unknown => (calls as unknown[])[0] ?? null)
    .find((navigation): navigation is Record<string, unknown> => {
      return (
        typeof navigation === 'object' &&
        navigation !== null &&
        'to' in navigation &&
        (navigation as Record<string, unknown>).to === to
      );
    });

  if (!matchingCall) {
    throw new Error(`Expected a navigation call to ${to}.`);
  }

  return matchingCall;
}
