/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for test data */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen'
import teamPanelStyles from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css'
import { createRemoteControllerBindings } from '@/lib/input'

import {
  createTestSetup,
  scorePoints,
  winQuickGame,
  winQuickSet
} from '../../core/match/test-helpers'
import { resolveCssColor } from '../../utils/css'

function formatTimeOfDay(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

const {
  mockInvalidate,
  mockNavigate,
  mockPreloadRoute,
  mockLoadRemoteControllerBindings,
  mockSpeechAnnounce,
  mockSpeechDestroy
} = vi.hoisted(() => ({
  mockInvalidate: vi.fn(async () => undefined),
  mockNavigate: vi.fn(),
  mockPreloadRoute: vi.fn(async () => undefined),
  mockLoadRemoteControllerBindings: vi.fn(),
  mockSpeechAnnounce: vi.fn(),
  mockSpeechDestroy: vi.fn()
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouter: () => ({
      invalidate: mockInvalidate,
      preloadRoute: mockPreloadRoute
    })
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

vi.mock('@/lib/input', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/input')>()

  return {
    ...actual,
    loadRemoteControllerBindingsWithFallback: mockLoadRemoteControllerBindings
  }
})

vi.mock('@/lib/speech', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/speech')>()

  return {
    ...actual,
    useSpeechService: () => ({
      announce: mockSpeechAnnounce,
      destroy: mockSpeechDestroy,
      cancel: vi.fn(),
      getMuted: vi.fn(() => false),
      setMuted: vi.fn(),
      getVerbosity: vi.fn(() => 'standard'),
      setVerbosity: vi.fn(),
      getVoice: vi.fn(() => null),
      isSupported: vi.fn(() => true),
      speak: vi.fn()
    })
  }
})

describe('ActiveMatchScreen', () => {
  const defaultStartedAt = Date.now() - 5 * 60 * 1000

  beforeEach(() => {
    vi.clearAllMocks()
    mockInvalidate.mockResolvedValue(undefined)
    mockPreloadRoute.mockResolvedValue(undefined)
    mockLoadRemoteControllerBindings.mockResolvedValue(null)
    mockSpeechAnnounce.mockReset()
    mockSpeechDestroy.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('renders with initial state', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('layout-body')).toBeInTheDocument()
    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument()
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
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument()
  })

  test('renders sets card without the info card overlay', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
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

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
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
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ servingIndicatorEnabled: true })}
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
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ servingIndicatorEnabled: false })}
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
    const startedAt = Date.now() - 5 * 60 * 1000

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({
          countdownTimerEnabled: true,
          countdownTimerDuration: 60
        })}
        initialActions={[]}
        startedAt={startedAt}
      />
    )

    expect(screen.getByTestId('time-chip').element().getAttribute('aria-label')).toMatch(
      /^Remaining match time: 00:5[45]:\d{2}$/
    )
  })

  test('renders revert buttons', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('revert-button-team-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('revert-button-team-2')).toBeInTheDocument()
  })

  test('renders finish button', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('finish-button')).toBeInTheDocument()
  })

  test('finish button stays enabled when match is not completed', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('finish-button')).toBeEnabled()
  })

  test('touch scoring updates the team score immediately', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15')
    })
  })

  test('does not announce anything on initial render', async () => {
    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    expect(mockSpeechAnnounce).not.toHaveBeenCalled()
  })

  test('announces updated score after a point when audio announcements are enabled', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '0',
          gameMode: 'advantage'
        })
      )
    })
  })

  test('stays silent when audio announcements are disabled', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ audioAnnouncementsEnabled: false })}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15')
    })

    expect(mockSpeechAnnounce).not.toHaveBeenCalled()
  })

  test('marks undo announcements as corrections', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-1')}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('revert-button-team-1').click()

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          isCorrection: true,
          team1Score: '15',
          team2Score: '0'
        })
      )
    })
  })

  test('announces winning points as game events instead of reset scores', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-1', 'team-1')}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'game-won',
          winningTeam: 'team-1'
        })
      )
    })
    expect(mockSpeechAnnounce).not.toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'point-scored',
        team1Score: '0',
        team2Score: '0'
      })
    )
  })

  test('announces set point when a team can win the set on the next point', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          pointPressure: 'set-point',
          pointPressureTeam: 'team-1',
          team1Score: '40',
          team2Score: '0'
        })
      )
    })
  })

  test('announces match point when a team can win the match on the next point', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[
          ...winQuickSet('team-1'),
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('team-panel-team-1').click()

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          pointPressure: 'match-point',
          pointPressureTeam: 'team-1',
          team1Score: '40',
          team2Score: '0'
        })
      )
    })
  })

  test('team-specific revert buttons are disabled independently', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1')}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('revert-button-team-1')).toBeEnabled()
    await expect.element(screen.getByTestId('revert-button-team-2')).toBeDisabled()
  })

  test('revert button removes the last point for its own team only', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-2')}
        startedAt={defaultStartedAt}
      />
    )

    await screen.getByTestId('revert-button-team-1').click()

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0')
      expect(readDisplayedScore(screen, 'team-2')).toBe('15')
    })
  })

  test('loads saved remote bindings on mount', async () => {
    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1)
    })
  })

  test('legacy Backspace continues to undo when no remote is configured', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1')}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0')
    })
  })

  test('legacy Delete continues to undo when no remote is configured', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-2')}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }))

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-2')).toBe('0')
    })
  })

  test('mapped remote add waits for the buffered window before scoring', async () => {
    vi.useFakeTimers()
    mockLoadRemoteControllerBindings.mockResolvedValue(
      createRemoteControllerBindings({
        'add-team-1': 'q',
        'revert-team-1': 'z',
        'add-team-2': 'w',
        'revert-team-2': 'x'
      })
    )

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }))
    expect(readDisplayedScore(screen, 'team-1')).toBe('0')

    await vi.advanceTimersByTimeAsync(380)

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15')
    })
  })

  test('remote team-specific revert removes the last score for that team', async () => {
    mockLoadRemoteControllerBindings.mockResolvedValue(
      createRemoteControllerBindings({
        'add-team-1': 'q',
        'revert-team-1': 'z',
        'add-team-2': 'w',
        'revert-team-2': 'x'
      })
    )

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-2')}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0')
      expect(readDisplayedScore(screen, 'team-2')).toBe('15')
    })
  })

  test('remote team-specific revert leaves the score unchanged when that team has no actions', async () => {
    mockLoadRemoteControllerBindings.mockResolvedValue(
      createRemoteControllerBindings({
        'add-team-1': 'q',
        'revert-team-1': 'z',
        'add-team-2': 'w',
        'revert-team-2': 'x'
      })
    )

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-2')}
        startedAt={defaultStartedAt}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1)
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0')
      expect(readDisplayedScore(screen, 'team-2')).toBe('15')
    })
  })

  test('navigates to the finish route when the match is completed', async () => {
    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[...winQuickSet('team-1'), ...winQuickSet('team-1')]}
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
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
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
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[...winQuickSet('team-1'), ...winQuickSet('team-1')]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeDisabled()
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeDisabled()
  })

  test('finish button is disabled when match is already completed', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[...winQuickSet('team-1'), ...winQuickSet('team-1')]}
        startedAt={defaultStartedAt}
      />
    )

    await expect.element(screen.getByTestId('finish-button')).toBeDisabled()
  })
})

function readDisplayedScore(
  screen: Awaited<ReturnType<typeof render>>,
  teamId: 'team-1' | 'team-2'
): string {
  return (
    screen.getByTestId(`team-panel-${teamId}`).element().querySelector('[aria-live="polite"]')
      ?.textContent ?? ''
  )
}
