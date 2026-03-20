/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for readability */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { ReactElement } from 'react'

import { MatchEndScreen } from '@/components/MatchEndScreen'
import { projectMatch } from '@/core/match'
import { createTestSetup, winQuickSet } from '../../core/match/test-helpers'

const {
  mockNavigate,
  mockClearCache,
  mockClearCurrentMatch,
  mockContinuePlaying,
  mockCreateCurrentMatchSession
} = vi.hoisted(() => {
  const mockNavigateFn = vi.fn()
  const mockClearCacheFn = vi.fn()
  const mockClearCurrentMatchFn = vi.fn(async () => undefined)
  const mockContinuePlayingFn = vi.fn(async () => undefined)
  const mockCreateCurrentMatchSessionFn = vi.fn(() => ({
    continuePlaying: mockContinuePlayingFn
  }))

  return {
    mockNavigate: mockNavigateFn,
    mockClearCache: mockClearCacheFn,
    mockClearCurrentMatch: mockClearCurrentMatchFn,
    mockContinuePlaying: mockContinuePlayingFn,
    mockCreateCurrentMatchSession: mockCreateCurrentMatchSessionFn
  }
})

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouter: () => ({
    clearCache: mockClearCache
  })
}))

vi.mock('@/lib/current-match', () => ({
  clearCurrentMatch: () => mockClearCurrentMatch(),
  createCurrentMatchSession: mockCreateCurrentMatchSession
}))

vi.mock('@/lib/i18n', async (importOriginal) => {
  const original = await importOriginal<object>()
  return {
    ...original,
    getCurrentLocale: () => 'en',
    changeLocale: vi.fn()
  }
})

vi.mock('@/components/Layout/Layout', () => ({
  Layout: ({
    header,
    children,
    footer
  }: {
    header: ReactElement
    children: ReactElement
    footer?: ReactElement
  }) => (
    <div data-testid="layout">
      <div data-testid="header">{header}</div>
      <div data-testid="content">{children}</div>
      <div data-testid="footer">{footer}</div>
    </div>
  )
}))

describe('MatchEndScreen', () => {
  const currentTime = new Date('2026-03-19T13:24:00.000Z')
  const startedAt = currentTime.getTime() - 20 * 60 * 1000
  const finishedAt = startedAt + 5 * 60 * 1000

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(currentTime)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  test('renders the winner, set summary, statistics, and actions', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await expect.element(screen.getByTestId('match-end-screen')).toBeInTheDocument()
    await expect.element(screen.getByText('Match Complete')).toBeInTheDocument()
    await expect.element(screen.getByText('Winners')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'Alvaro & Enrique' }))
      .toBeInTheDocument()
    await expect.element(screen.getByText('Set Summary')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-winner-card')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-summary-card')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-set-row-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-set-row-2')).toBeInTheDocument()
    await expect.element(screen.getByTestId('match-end-stats-card')).toBeInTheDocument()
    await expect
      .element(screen.getByRole('region', { name: 'Match statistics' }))
      .toBeInTheDocument()
    await expect.element(screen.getByTestId('footer')).toHaveTextContent('Match length')
    await expect.element(screen.getByTestId('footer')).toHaveTextContent('Total games')
    await expect.element(screen.getByTestId('match-end-total-games')).toHaveTextContent('12')
    await expect.element(screen.getByTestId('match-end-duration')).toHaveTextContent('5m')
    await expect
      .element(screen.getByText('Set 1: Alvaro & Enrique 6, Pablo & Thiago 0'))
      .toBeInTheDocument()
    await expect.element(screen.getByTestId('new-match-button')).toBeInTheDocument()
    await expect.element(screen.getByTestId('continue-match-button')).toBeInTheDocument()
  })

  test('starts a new match by clearing persistence and navigating home', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await screen.getByTestId('new-match-button').click()

    await vi.waitFor(() => {
      expect(mockClearCurrentMatch).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  test('continues the current match and returns to the active route', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await screen.getByTestId('continue-match-button').click()

    await vi.waitFor(() => {
      expect(mockCreateCurrentMatchSession).toHaveBeenCalledWith({
        matchId: 'test-match',
        setup,
        actions,
        startedAt,
        finishedAt
      })
      expect(mockContinuePlaying).toHaveBeenCalledTimes(1)
      expect(mockClearCache).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: 'test-match' },
        replace: true
      })
    })

    const [clearCacheArgs] = mockClearCache.mock.calls[0] ?? []
    expect(clearCacheArgs?.filter({ routeId: '/match/$id', params: { id: 'test-match' } })).toBe(
      true
    )
    expect(clearCacheArgs?.filter({ routeId: '/match/$id', params: { id: 'other-match' } })).toBe(
      false
    )
    expect(
      clearCacheArgs?.filter({ routeId: '/match/finish/$id', params: { id: 'test-match' } })
    ).toBe(false)
  })

  test('re-enables continue when continuation fails', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    mockContinuePlaying.mockRejectedValueOnce(new Error('continue failed'))

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    const continueButton = screen.getByTestId('continue-match-button')

    await continueButton.click()

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to continue the current match.',
        expect.any(Error)
      )
    })
    await vi.waitFor(() => {
      expect((continueButton.element() as HTMLButtonElement).disabled).toBe(false)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('keeps the displayed duration frozen after the match is complete', async () => {
    const projection = createCompletedProjection()
    const setup = createCompletedSetup()
    const actions = createCompletedActions()

    const screen = await render(
      <MatchEndScreen
        matchId="test-match"
        setup={setup}
        actions={actions}
        projection={projection}
        startedAt={startedAt}
        finishedAt={finishedAt}
      />
    )

    await expect.element(screen.getByTestId('match-end-duration')).toHaveTextContent('5m')

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    await expect.element(screen.getByTestId('match-end-duration')).toHaveTextContent('5m')
  })
})

function createCompletedProjection() {
  const setup = createCompletedSetup()

  return projectMatch(setup, createCompletedActions())
}

function createCompletedActions() {
  return [...winQuickSet('team-1'), ...winQuickSet('team-1')]
}

function createCompletedSetup() {
  return createTestSetup({
    sides: [
      { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
      { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
    ]
  })
}
