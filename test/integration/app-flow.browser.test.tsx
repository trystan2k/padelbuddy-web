/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-object-as-prop -- Test files use inline objects for readability */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { SetupScreen } from '@/components/SetupScreen'
import { ToastProvider } from '@/components/ui/Toast'
import {
  clearCurrentMatch,
  hydrateCurrentMatchStartup,
  loadCurrentMatch,
  saveCurrentMatch,
  type CurrentMatchStartupResult
} from '@/lib/current-match'
import { HomeRoute, Route as HomeIndexRoute } from '@/routes/index'
import { MatchRouteContent } from '@/routes/match.$id'
import { MatchFinishRouteContent } from '@/routes/match.finish.$id'

import { createTestSetup, scorePoints, winQuickSet } from '../core/match/test-helpers'

const { mockNavigate, mockClearCache, mockRouteSearch } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockClearCache: vi.fn(),
  mockRouteSearch: {
    current: {} as { error?: string }
  }
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({
      options,
      useLoaderData: vi.fn(),
      useSearch: () => mockRouteSearch.current,
      isPending: false,
      error: false
    }),
    useNavigate: () => mockNavigate,
    useRouter: () => ({
      clearCache: mockClearCache
    })
  }
})

describe('app flow integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockRouteSearch.current = {}
    await clearCurrentMatch()
    await setHomeStartupState({ status: 'ready', notice: null, session: null })
  })

  afterEach(async () => {
    mockRouteSearch.current = {}
    await clearCurrentMatch()
  })

  test('completes the setup to match to end to setup flow', async () => {
    const setupScreen = await render(<SetupScreen />)

    await setupScreen.getByRole('button', { name: 'Start Match' }).click()

    const startNavigation = await waitForNavigationCall('/match/$id')
    const matchId = getNavigationMatchId(startNavigation)
    const startedMatch = await loadCurrentMatch()

    expect(startedMatch.status).toBe('ok')
    if (startedMatch.status !== 'ok') {
      throw new Error('Expected the started match to be persisted.')
    }

    await setupScreen.unmount()
    mockNavigate.mockClear()

    const activeMatchScreen = await render(
      <MatchRouteContent matchData={startedMatch} matchId={matchId} />
    )

    await expect.element(activeMatchScreen.getByTestId('layout-body')).toBeInTheDocument()

    await activeMatchScreen.unmount()

    const completedMatch = {
      status: 'ok' as const,
      record: {
        ...startedMatch.record,
        actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')]
      }
    }

    await saveCurrentMatch({
      matchId,
      setup: completedMatch.record.setup,
      actions: completedMatch.record.actions,
      startedAt: completedMatch.record.startedAt
    })

    mockNavigate.mockClear()

    const completedMatchRedirect = await render(
      <MatchRouteContent matchData={completedMatch} matchId={matchId} />
    )

    await waitForNavigationCall('/match/finish/$id')
    await completedMatchRedirect.unmount()

    mockNavigate.mockClear()

    const matchEndScreen = await render(
      <MatchFinishRouteContent matchData={completedMatch} matchId={matchId} />
    )

    await expect.element(matchEndScreen.getByTestId('match-end-screen')).toBeInTheDocument()
    await matchEndScreen.getByRole('button', { name: 'New Match' }).click()

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/', viewTransition: true })
    })

    await matchEndScreen.unmount()
    mockNavigate.mockClear()

    await setHomeStartupState(await hydrateCurrentMatchStartup())
    const homeScreen = await render(<HomeRoute />)

    await expect.element(homeScreen.getByRole('button', { name: 'Start Match' })).toBeVisible()
    expect(document.body.textContent).not.toContain('Resume saved match?')
  })

  test('resumes an active match after a page refresh flow', async () => {
    const setup = createTestSetup()
    const matchId = 'resume-match'

    await saveCurrentMatch({
      matchId,
      setup,
      actions: scorePoints('team-1', 'team-2', 'team-1'),
      startedAt: Date.now()
    })

    await setHomeStartupState(await hydrateCurrentMatchStartup())
    const homeScreen = await render(<HomeRoute />)

    await expect
      .element(homeScreen.getByRole('heading', { level: 2, name: 'Resume saved match?' }))
      .toBeVisible()

    await homeScreen.getByRole('button', { name: 'Resume match' }).click()

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: matchId },
        viewTransition: true
      })
    })

    const resumedMatch = await loadCurrentMatch()

    expect(resumedMatch.status).toBe('ok')
    if (resumedMatch.status !== 'ok') {
      throw new Error('Expected the resumed match to still be persisted.')
    }

    await homeScreen.unmount()

    const activeMatchScreen = await render(
      <MatchRouteContent matchData={resumedMatch} matchId={matchId} />
    )

    await expect.element(activeMatchScreen.getByTestId('layout-body')).toBeInTheDocument()
  })

  test('redirects invalid match routes home and shows a dismissible notice', async () => {
    const setup = createTestSetup()
    const persistedMatchId = 'real-match'

    await saveCurrentMatch({
      matchId: persistedMatchId,
      setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: Date.now()
    })

    const persistedMatch = await loadCurrentMatch()

    expect(persistedMatch.status).toBe('ok')
    if (persistedMatch.status !== 'ok') {
      throw new Error('Expected the persisted match to be available.')
    }

    await render(<MatchRouteContent matchData={persistedMatch} matchId="invalid-id" />)

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/',
        replace: true,
        search: { error: 'invalid-match' },
        viewTransition: true
      })
    })

    mockNavigate.mockClear()
    mockRouteSearch.current = { error: 'invalid-match' }
    await setHomeStartupState(await hydrateCurrentMatchStartup())

    const homeScreen = await render(
      <ToastProvider>
        <HomeRoute />
      </ToastProvider>
    )

    await expect.element(homeScreen.getByTestId('layout-body')).toBeInTheDocument()
    await homeScreen.unmount()
  })

  test('redirects corrupt finish routes home and shows a dismissible notice', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    try {
      await render(
        <MatchFinishRouteContent
          matchData={{
            status: 'corrupt',
            message: 'Current match payload is corrupt.'
          }}
          matchId="broken-match"
        />
      )

      await vi.waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/',
          replace: true,
          search: { error: 'corrupt' },
          viewTransition: true
        })
      })
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Corrupted match data:',
        'Current match payload is corrupt.'
      )

      mockNavigate.mockClear()
      mockRouteSearch.current = { error: 'corrupt' }
      await setHomeStartupState(await hydrateCurrentMatchStartup())

      const homeScreen = await render(
        <ToastProvider>
          <HomeRoute />
        </ToastProvider>
      )

      await expect.element(homeScreen.getByTestId('layout-body')).toBeInTheDocument()
      await homeScreen.unmount()
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })
})

async function setHomeStartupState(startupState: CurrentMatchStartupResult): Promise<void> {
  const loader = HomeIndexRoute.useLoaderData

  if (!vi.isMockFunction(loader)) {
    throw new Error('Expected the home route loader to be mocked in integration tests.')
  }

  loader.mockReturnValue(startupState)
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
    throw new Error('Expected navigation params to include a string match id.')
  }

  return navigation.params.id
}

async function waitForNavigationCall(to: string): Promise<unknown> {
  await vi.waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to
      })
    )
  })

  const matchingCall = [...mockNavigate.mock.calls]
    .map(([navigation]) => navigation)
    .find((navigation) => {
      return (
        typeof navigation === 'object' &&
        navigation !== null &&
        'to' in navigation &&
        navigation.to === to
      )
    })

  if (!matchingCall) {
    throw new Error(`Expected a navigation call to ${to}.`)
  }

  return matchingCall
}
