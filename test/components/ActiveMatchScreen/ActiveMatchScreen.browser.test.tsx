/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for test data */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen'
import teamPanelStyles from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css'
import { createTestSetup, winQuickSet } from '../../core/match/test-helpers'

function formatTimeOfDay(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

function resolveCssColor(property: 'backgroundColor' | 'color', value: string): string {
  const probe = document.createElement('div')

  probe.style.setProperty(property === 'backgroundColor' ? 'background-color' : 'color', value)
  document.body.append(probe)

  const resolvedColor = getComputedStyle(probe)[property]

  probe.remove()

  return resolvedColor
}

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/lib/i18n', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/i18n')>()

  return {
    ...original,
    getCurrentLocale: () => 'en',
    changeLocale: vi.fn()
  }
})

describe('ActiveMatchScreen', () => {
  const defaultStartedAt = Date.now() - 5 * 60 * 1000

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('renders with initial state', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('layout-body')).toBeInTheDocument()
  })

  test('renders team names', async () => {
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: ['Alice', 'Bob'] },
        { id: 'team-2', playerNames: ['Charlie', 'Diana'] }
      ]
    })

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByText('Alice & Bob')).toBeInTheDocument()
    await expect.element(screen.getByText('Charlie & Diana')).toBeInTheDocument()
  })

  test('renders team panels', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument()
  })

  test('renders sets card without the info card overlay', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('sets-card')).toBeInTheDocument()
    expect(screen.container.querySelector('[data-testid="info-card"]')).toBeNull()
  })

  test('renders time chip', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-21T12:00:00.000Z'))

    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('time-chip')).toBeInTheDocument()
    await expect
      .element(screen.getByTestId('time-chip'))
      .toHaveTextContent(formatTimeOfDay(new Date(Date.now())))
    expect(screen.container.querySelector('[aria-haspopup="true"]')).toBeNull()
  })

  test('renders the timer in the top bar instead of the score panel body', async () => {
    const setup = createTestSetup({
      countdownTimerEnabled: true,
      countdownTimerDuration: 60
    })
    const startedAt = Date.now() - (46 * 60 + 48) * 1000

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={startedAt}
      />
    )

    const timeChip = screen.getByTestId('time-chip').element()
    const layoutBody = screen.getByTestId('layout-body').element()

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent(/^\d{2}:\d{2}:\d{2}$/)
    expect(timeChip.closest('header')).toBeTruthy()
    expect(layoutBody.contains(timeChip)).toBe(false)
  })

  test('highlights the serving team panel when the serving indicator is enabled', async () => {
    const setup = createTestSetup({
      servingIndicatorEnabled: true
    })

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    const team1Panel = screen.getByTestId('team-panel-team-1')
    const team1Score = team1Panel.element().querySelector('[aria-live="polite"]')

    expect(team1Score).toBeTruthy()
    await expect.element(team1Panel).toHaveClass(teamPanelStyles.serving!)
    expect(getComputedStyle(team1Panel.element()).backgroundColor).toBe(
      resolveCssColor('backgroundColor', 'var(--semantic-color-items-primary-background)')
    )
    expect(getComputedStyle(team1Score as Element).color).toBe(
      resolveCssColor('color', 'var(--semantic-color-items-primary-content)')
    )
    await expect
      .element(screen.getByTestId('team-panel-team-2'))
      .not.toHaveClass(teamPanelStyles.serving!)
    expect(screen.container.querySelector('[data-testid^="serve-indicator-"]')).toBeNull()
    expect(screen.container.querySelector('[data-testid^="serve-status-"]')).toBeNull()
  })

  test('does not highlight team panels when the serving indicator is disabled', async () => {
    const setup = createTestSetup({
      servingIndicatorEnabled: false
    })

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect
      .element(screen.getByTestId('team-panel-team-1'))
      .not.toHaveClass(teamPanelStyles.serving!)
    await expect
      .element(screen.getByTestId('team-panel-team-2'))
      .not.toHaveClass(teamPanelStyles.serving!)
  })

  test('uses the countdown timer aria-label when countdown mode is enabled', async () => {
    const setup = createTestSetup({
      countdownTimerEnabled: true,
      countdownTimerDuration: 60
    })
    const startedAt = Date.now() - 5 * 60 * 1000

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={startedAt}
      />
    )

    expect(screen.getByTestId('time-chip').element().getAttribute('aria-label')).toMatch(
      /^Remaining match time: 00:5[45]:\d{2}$/
    )
  })

  test('renders revert buttons', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('revert-button-team-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('revert-button-team-2')).toBeInTheDocument()
  })

  test('renders finish button', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('finish-button')).toBeInTheDocument()
  })

  test('finish button stays enabled when match is not completed', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('finish-button')).toBeEnabled()
  })

  test('scoring updates team score', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    const team1Panel = screen.getByTestId('team-panel-team-1')
    const scoreElement = team1Panel.element().querySelector('[aria-live="polite"]')
    expect(scoreElement?.textContent).toBe('0')

    ;(team1Panel.element() as HTMLButtonElement).click()

    await vi.waitFor(() => {
      const newScoreElement = screen
        .getByTestId('team-panel-team-1')
        .element()
        .querySelector('[aria-live="polite"]')
      return expect(newScoreElement?.textContent).toBe('15')
    })
  })

  test('revert button is disabled when no actions', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('revert-button-team-1')).toBeDisabled()
  })

  test('revert button removes the last point for both team controls', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      const scoreElement = screen
        .getByTestId('team-panel-team-1')
        .element()
        .querySelector('[aria-live="polite"]')
      return expect(scoreElement?.textContent).toBe('15')
    })

    await screen.getByTestId('revert-button-team-2').click()

    await vi.waitFor(() => {
      const scoreElement = screen
        .getByTestId('team-panel-team-1')
        .element()
        .querySelector('[aria-live="polite"]')
      return expect(scoreElement?.textContent).toBe('0')
    })
  })

  test('navigates to the finish route when the match is completed', async () => {
    const setup = createTestSetup()
    const actions = [...winQuickSet('team-1'), ...winQuickSet('team-1')]

    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={actions}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/match/finish/$id',
          params: { id: 'test-match' },
          replace: true
        })
      )
    })
  })

  test('clicking finish marks the match finished and navigates to the finish route', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('finish-button').click()

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/match/finish/$id',
          params: { id: 'test-match' },
          replace: true
        })
      )
    })
  })

  test('team panels are disabled when match is completed', async () => {
    const setup = createTestSetup()
    const actions = [...winQuickSet('team-1'), ...winQuickSet('team-1')]

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={actions}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeDisabled()
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeDisabled()
  })

  test('finish button is disabled when match is already completed', async () => {
    const setup = createTestSetup()
    const actions = [...winQuickSet('team-1'), ...winQuickSet('team-1')]

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={actions}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('finish-button')).toBeDisabled()
  })
})
