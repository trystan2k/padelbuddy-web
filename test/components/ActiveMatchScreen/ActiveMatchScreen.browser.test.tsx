/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for test data */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen'
import {
  createTestSetup,
  scorePoints,
  winQuickGame,
  winQuickSet
} from '../../core/match/test-helpers'

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
  const defaultStartedAt = Date.now() - 5 * 60 * 1000 // 5 minutes ago

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
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

    // Should render layout structure
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

  test('renders sets card', async () => {
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
  })

  test('renders info card', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('info-card')).toBeInTheDocument()
  })

  test('renders time chip', async () => {
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
    expect(screen.container.querySelector('[aria-haspopup="true"]')).toBeNull()
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

    // Check the initial score is in the aria-live element (which should be "0" for initial state)
    const team1Panel = screen.getByTestId('team-panel-team-1')
    const scoreElement = team1Panel.element().querySelector('[aria-live="polite"]')
    expect(scoreElement?.textContent).toBe('0')

    // Score for team 1 - use fireEvent to bypass actionability checks
    const button = team1Panel.element() as HTMLButtonElement
    button.click()

    // Wait for the score to update
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

    const revertButton = screen.getByTestId('revert-button-team-1')
    await expect.element(revertButton).toBeDisabled()
  })

  test('team panels are disabled when match is completed', async () => {
    const setup = createTestSetup()
    // Win two sets to complete the match (best of 3)
    const actions = [...winQuickSet('team-1'), ...winQuickSet('team-1')]

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={actions}
        startedAt={defaultStartedAt}
      />
    )

    const team1Panel = screen.getByTestId('team-panel-team-1')
    await expect.element(team1Panel).toBeDisabled()

    const team2Panel = screen.getByTestId('team-panel-team-2')
    await expect.element(team2Panel).toBeDisabled()
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

  test('navigates to the finish route when the match is completed', async () => {
    const setup = createTestSetup()
    const actions = [
      ...winQuickSet('team-1'),
      ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
      ...scorePoints('team-1', 'team-1', 'team-1')
    ]

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={actions}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/finish/$id',
        params: { id: 'test-match' },
        replace: true,
        viewTransition: true
      })
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
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/finish/$id',
        params: { id: 'test-match' },
        replace: true,
        viewTransition: true
      })
    })
  })

  test('info card reflects setup options', async () => {
    const setup = createTestSetup({
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true,
      sideSwitchPrompts: true
    })

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByText('Golden point on')).toBeInTheDocument()
    await expect.element(screen.getByText('Super tiebreak on')).toBeInTheDocument()
    await expect.element(screen.getByText('Side-switch prompts: on')).toBeInTheDocument()
  })

  test('shows serving indicator for initial server', async () => {
    const setup = createTestSetup({ initialServer: 'team-1' })

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    // Team 1 should be serving
    const team1Panel = screen.getByTestId('team-panel-team-1')
    const servingIndicator = team1Panel
      .element()
      .querySelector('[data-testid="serve-indicator-team-1"]')
    expect(servingIndicator).toBeTruthy()

    const servingStatus = team1Panel.element().querySelector('[data-testid="serve-status-team-1"]')
    expect(servingStatus?.textContent).toBe('Serving')
  })

  test('renders set and info overlays without locale selector actions', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    expect(screen.container.querySelector('[aria-haspopup="true"]')).toBeNull()

    const overlayNodes = Array.from(
      screen.container.querySelectorAll(
        '[data-testid="sets-card"], [data-testid="time-chip"], [data-testid="info-card"]'
      )
    ).map((node) => node.getAttribute('data-testid'))

    expect(overlayNodes).toEqual(['sets-card', 'time-chip', 'info-card'])
  })
})
