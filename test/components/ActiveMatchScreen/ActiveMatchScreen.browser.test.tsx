import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen/ActiveMatchScreen';
import teamPanelStyles from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css';
import {
  createEmptyRemoteControllerBindings,
  createRemoteControllerBindings
} from '@/lib/input/keyboard-aliases';
import {
  createDefaultRemoteControllerConfig,
  createKeyboardMappingConfig
} from '@/lib/input/remote-controller-config';

import {
  createTestSetup,
  reachSixAll,
  scorePoints,
  winQuickGame,
  winQuickSet
} from '../../core/match/test-helpers';
import { resolveCssColor } from '../../utils/css';

function formatTimeOfDay(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

const {
  mockInvalidate,
  mockNavigate,
  mockPreloadRoute,
  mockLoadRemoteControllerConfig,
  mockLoadCurrentMatch,
  mockAddErrorToast,
  mockSaveMatchHistory,
  mockSpeechAnnounce,
  mockSpeechDestroy,
  mockUseOrientationDetection
} = vi.hoisted(() => ({
  mockInvalidate: vi.fn<() => Promise<void>>(async () => undefined),
  mockNavigate: vi.fn<() => void>(),
  mockPreloadRoute: vi.fn<() => Promise<void>>(async () => undefined),
  mockLoadRemoteControllerConfig:
    vi.fn<() => Promise<ReturnType<typeof createDefaultRemoteControllerConfig>>>(),
  mockLoadCurrentMatch:
    vi.fn<() => Promise<{ status: string; record?: Record<string, unknown> }>>(),
  mockAddErrorToast: vi.fn<(title: string, options?: unknown) => void>(),
  mockSaveMatchHistory: vi.fn<(input: unknown) => Promise<unknown>>(),
  mockSpeechAnnounce: vi.fn<(args: unknown) => void>(),
  mockSpeechDestroy: vi.fn<() => void>(),
  mockUseOrientationDetection: vi.fn<() => { isPortrait: boolean; isLandscape: boolean }>(() => ({
    isPortrait: false,
    isLandscape: true
  }))
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouter: () => ({
      invalidate: mockInvalidate,
      preloadRoute: mockPreloadRoute
    })
  };
});

vi.mock('@/lib/i18n/i18n', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/i18n/i18n')>();

  return {
    ...original,
    getCurrentLocale: () => 'en',
    changeLocale: vi.fn<(locale: string) => void>()
  };
});

vi.mock('@/lib/input/remote-controller-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/input/remote-controller-storage')>();

  return {
    ...actual,
    loadRemoteControllerConfigWithFallback: mockLoadRemoteControllerConfig
  };
});

vi.mock('@/lib/speech/speech-service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/speech/speech-service')>();

  return {
    ...actual,
    useSpeechService: () => ({
      announce: mockSpeechAnnounce,
      destroy: mockSpeechDestroy,
      cancel: vi.fn<() => void>(),
      getMuted: vi.fn<() => boolean>(() => false),
      setMuted: vi.fn<() => void>(),
      getVerbosity: vi.fn<() => string>(() => 'standard'),
      setVerbosity: vi.fn<() => void>(),
      getVoice: vi.fn<() => null>(() => null),
      isSupported: vi.fn<() => boolean>(() => true),
      speak: vi.fn<() => void>()
    })
  };
});

vi.mock('@/components/ui/Toast/useToast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui/Toast/useToast')>();

  return {
    ...actual,
    useToast: () => ({
      addToast: vi.fn<(title: string, options?: unknown) => void>(),
      addErrorToast: mockAddErrorToast,
      addSuccessToast: vi.fn<(title: string, options?: unknown) => void>(),
      addInfoToast: vi.fn<(title: string, options?: unknown) => void>(),
      toastManager: { add: vi.fn<(toast: unknown) => void>() }
    })
  };
});

vi.mock('@/lib/match-history/indexed-db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/match-history/indexed-db')>();

  return {
    ...actual,
    saveMatchHistory: mockSaveMatchHistory
  };
});

vi.mock('@/lib/current-match/indexed-db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/current-match/indexed-db')>();

  return {
    ...actual,
    loadCurrentMatch: mockLoadCurrentMatch
  };
});

vi.mock('@/lib/orientation/useOrientationDetection', () => ({
  useOrientationDetection: mockUseOrientationDetection
}));

describe('ActiveMatchScreen', () => {
  const defaultStartedAt = Date.now() - 5 * 60 * 1000;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvalidate.mockResolvedValue(undefined);
    mockPreloadRoute.mockResolvedValue(undefined);
    mockLoadRemoteControllerConfig.mockResolvedValue(createDefaultRemoteControllerConfig());
    mockLoadCurrentMatch.mockResolvedValue({ status: 'empty' });
    mockAddErrorToast.mockReset();
    mockSaveMatchHistory.mockResolvedValue({});
    mockSpeechAnnounce.mockReset();
    mockSpeechDestroy.mockReset();
    mockUseOrientationDetection.mockReturnValue({
      isPortrait: false,
      isLandscape: true
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('renders with initial state', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('layout-body')).toBeInTheDocument();
    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument();
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument();
  });

  test('renders team names', async () => {
    const setup = createTestSetup({
      sides: [
        { id: 'team-1', playerNames: ['Alice', 'Bob'] },
        { id: 'team-2', playerNames: ['Charlie', 'Diana'] }
      ]
    });

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByText('Alice & Bob')).toBeInTheDocument();
    await expect.element(screen.getByText('Charlie & Diana')).toBeInTheDocument();
  });

  test('renders team panels', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument();
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument();
  });

  test('renders sets card without the info card overlay', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('sets-card')).toBeInTheDocument();
    expect(screen.container.querySelector('[data-testid="info-card"]')).toBeNull();
  });

  test('opens sets history modal manually from sets card', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('sets-card').click();

    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();
    await expect.element(screen.getByRole('heading', { name: /0\s*-\s*0/ })).toBeInTheDocument();
  });

  test('auto-opens sets history modal when a set completes', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    );

    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).not.toBeNull();
    });

    await expect.element(screen.getByRole('heading', { name: /1\s*-\s*0/ })).toBeInTheDocument();
  });

  test('does not auto-open sets history modal when setup disables auto-open', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ autoOpenSetsHistoryModal: false })}
        initialActions={[
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0');
    });
    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
  });

  test('does not auto-open sets history modal on regular point updates', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15');
    });
    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
  });

  test('does not auto-open sets history modal when only a game completes', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-1', 'team-1')}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0');
    });
    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
  });

  test('does not auto-open sets history modal on intermediate tiebreak points', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={reachSixAll()}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('1');
    });
    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
  });

  test('auto-opens sets history modal again after undo/correction returns to set boundary', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).not.toBeNull();
    });

    await screen.getByTestId('sets-history-modal-close').click();
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
    });

    await screen.getByTestId('revert-button-team-1').click();
    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('40');
    });

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).not.toBeNull();
    });
  });

  test('auto-closes sets history modal after 30 seconds', async () => {
    vi.useFakeTimers();

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('sets-card').click();
    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(29999);
    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(1);
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
    });
  });

  test('close and reopen resets sets history auto-close countdown', async () => {
    vi.useFakeTimers();

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).not.toBeNull();
    });

    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(29000);
    await screen.getByTestId('sets-history-modal-close').click();
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
    });
    await screen.getByTestId('sets-card').click();

    await vi.advanceTimersByTimeAsync(1500);
    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(28500);
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
    });
  });

  test('keeps immediate finish navigation without waiting for sets history modal timeout', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[
          ...winQuickSet('team-1'),
          ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
          ...scorePoints('team-1', 'team-1', 'team-1')
        ]}
        startedAt={defaultStartedAt}
      />
    );

    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/match/finish/$id',
          params: { id: 'test-match' },
          replace: true
        })
      );
    });
    expect(screen.container.querySelector('[data-testid="sets-history-modal"]')).toBeNull();
  });

  test('renders time chip', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-21T12:00:00.000Z'));

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('time-chip')).toBeInTheDocument();
    await expect
      .element(screen.getByTestId('time-chip'))
      .toHaveTextContent(formatTimeOfDay(new Date(Date.now())));
    expect(screen.container.querySelector('[aria-haspopup="true"]')).toBeNull();
  });

  test('renders the timer in the top bar instead of the score panel body', async () => {
    const setup = createTestSetup({
      countdownTimerEnabled: true,
      countdownTimerDuration: 60
    });
    const startedAt = Date.now() - (46 * 60 + 48) * 1000;

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={startedAt}
      />
    );

    const timeChip = screen.getByTestId('time-chip').element();
    const layoutBody = screen.getByTestId('layout-body').element();

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent(/^\d{2}:\d{2}:\d{2}$/);
    expect(timeChip.closest('header')).toBeTruthy();
    expect(layoutBody.contains(timeChip)).toBe(false);
  });

  test('highlights the serving team panel when the serving indicator is enabled', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ servingIndicatorEnabled: true })}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    const team1Panel = screen.getByTestId('team-panel-team-1');
    const team1Score = team1Panel.element().querySelector('[aria-live="polite"]');

    expect(team1Score).toBeTruthy();
    await expect.element(team1Panel).toHaveClass(teamPanelStyles.serving!);
    expect(getComputedStyle(team1Panel.element()).backgroundColor).toBe(
      resolveCssColor('backgroundColor', 'var(--semantic-color-items-primary-background)')
    );
    expect(getComputedStyle(team1Score as Element).color).toBe(
      resolveCssColor('color', 'var(--semantic-color-items-primary-content)')
    );
    await expect
      .element(screen.getByTestId('team-panel-team-2'))
      .not.toHaveClass(teamPanelStyles.serving!);
    expect(screen.container.querySelector('[data-testid^="serve-indicator-"]')).toBeNull();
    expect(screen.container.querySelector('[data-testid^="serve-status-"]')).toBeNull();
  });

  test('does not highlight team panels when the serving indicator is disabled', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ servingIndicatorEnabled: false })}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect
      .element(screen.getByTestId('team-panel-team-1'))
      .not.toHaveClass(teamPanelStyles.serving!);
    await expect
      .element(screen.getByTestId('team-panel-team-2'))
      .not.toHaveClass(teamPanelStyles.serving!);
  });

  test('uses the countdown timer aria-label when countdown mode is enabled', async () => {
    const startedAt = Date.now() - 5 * 60 * 1000;

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
    );

    expect(screen.getByTestId('time-chip').element().getAttribute('aria-label')).toMatch(
      /^Remaining match time: 00:5[45]:\d{2}$/
    );
  });

  test('renders revert buttons', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('revert-button-team-1')).toBeInTheDocument();
    await expect.element(screen.getByTestId('revert-button-team-2')).toBeInTheDocument();
  });

  test('renders finish button', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('finish-button')).toBeInTheDocument();
  });

  test('finish button stays enabled when match is not completed', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('finish-button')).toBeEnabled();
  });

  test('shows a history save error toast and retries saving on demand', async () => {
    const setup = createTestSetup();

    mockSaveMatchHistory
      .mockRejectedValueOnce(new Error('history save failed'))
      .mockResolvedValueOnce({});
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record: {
        setup,
        actions: [],
        startedAt: defaultStartedAt,
        finishedAt: Date.now()
      }
    });

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('finish-button').click();

    await vi.waitFor(() => {
      expect(mockAddErrorToast).toHaveBeenCalledWith(
        'Could not save this match in history.',
        expect.objectContaining({
          action: expect.objectContaining({
            label: 'Retry',
            onClick: expect.any(Function)
          })
        })
      );
    });

    const retryAction = mockAddErrorToast.mock.calls.at(-1)?.[1] as
      | { action?: { onClick?: () => void | Promise<void> } }
      | undefined;

    await retryAction?.action?.onClick?.();

    await vi.waitFor(() => {
      expect(mockSaveMatchHistory).toHaveBeenCalledTimes(2);
    });
  });

  test('touch scoring updates the team score immediately', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15');
    });
  });

  test('does not announce anything on initial render', async () => {
    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    expect(mockSpeechAnnounce).not.toHaveBeenCalled();
  });

  test('announces updated score after a point when audio announcements are enabled', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '0',
          gameMode: 'advantage'
        })
      );
    });
  });

  test('stays silent when audio announcements are disabled', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup({ audioAnnouncementsEnabled: false })}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15');
    });

    expect(mockSpeechAnnounce).not.toHaveBeenCalled();
  });

  test('marks undo announcements as corrections', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-1')}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('revert-button-team-1').click();

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          isCorrection: true,
          team1Score: '15',
          team2Score: '0'
        })
      );
    });
  });

  test('announces winning points as game events instead of reset scores', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-1', 'team-1')}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'game-won',
          winningTeam: 'team-1'
        })
      );
    });
    expect(mockSpeechAnnounce).not.toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'point-scored',
        team1Score: '0',
        team2Score: '0'
      })
    );
  });

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
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          pointPressure: 'set-point',
          pointPressureTeam: 'team-1',
          team1Score: '40',
          team2Score: '0'
        })
      );
    });
  });

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
    );

    await screen.getByTestId('team-panel-team-1').click();

    await vi.waitFor(() => {
      expect(mockSpeechAnnounce).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'point-scored',
          pointPressure: 'match-point',
          pointPressureTeam: 'team-1',
          team1Score: '40',
          team2Score: '0'
        })
      );
    });
  });

  test('team-specific revert buttons are disabled independently', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1')}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('revert-button-team-1')).toBeEnabled();
    await expect.element(screen.getByTestId('revert-button-team-2')).toBeDisabled();
  });

  test('revert button removes the last point for its own team only', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-2')}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('revert-button-team-1').click();

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0');
      expect(readDisplayedScore(screen, 'team-2')).toBe('15');
    });
  });

  test('loads saved remote bindings on mount', async () => {
    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerConfig).toHaveBeenCalledTimes(1);
    });
  });

  test('legacy Backspace continues to undo in keyboard-mapping mode with no custom bindings', async () => {
    mockLoadRemoteControllerConfig.mockResolvedValue(
      createKeyboardMappingConfig(createEmptyRemoteControllerBindings())
    );

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1')}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerConfig).toHaveBeenCalledTimes(1);
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0');
    });
  });

  test('legacy Delete continues to undo in keyboard-mapping mode with no custom bindings', async () => {
    mockLoadRemoteControllerConfig.mockResolvedValue(
      createKeyboardMappingConfig(createEmptyRemoteControllerBindings())
    );

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-2')}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerConfig).toHaveBeenCalledTimes(1);
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-2')).toBe('0');
    });
  });

  test('mapped remote add waits for the buffered window before scoring', async () => {
    vi.useFakeTimers();
    mockLoadRemoteControllerConfig.mockResolvedValue(
      createKeyboardMappingConfig(
        createRemoteControllerBindings({
          'add-team-1': 'q',
          'revert-team-1': 'z',
          'add-team-2': 'w',
          'revert-team-2': 'x'
        })
      )
    );

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerConfig).toHaveBeenCalledTimes(1);
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    expect(readDisplayedScore(screen, 'team-1')).toBe('0');

    await vi.advanceTimersByTimeAsync(600);

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('15');
    });
  });

  test('remote team-specific revert removes the last score for that team', async () => {
    mockLoadRemoteControllerConfig.mockResolvedValue(
      createKeyboardMappingConfig(
        createRemoteControllerBindings({
          'add-team-1': 'q',
          'revert-team-1': 'z',
          'add-team-2': 'w',
          'revert-team-2': 'x'
        })
      )
    );

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-1', 'team-2')}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerConfig).toHaveBeenCalledTimes(1);
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0');
      expect(readDisplayedScore(screen, 'team-2')).toBe('15');
    });
  });

  test('remote team-specific revert leaves the score unchanged when that team has no actions', async () => {
    mockLoadRemoteControllerConfig.mockResolvedValue(
      createKeyboardMappingConfig(
        createRemoteControllerBindings({
          'add-team-1': 'q',
          'revert-team-1': 'z',
          'add-team-2': 'w',
          'revert-team-2': 'x'
        })
      )
    );

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={scorePoints('team-2')}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockLoadRemoteControllerConfig).toHaveBeenCalledTimes(1);
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));

    await vi.waitFor(() => {
      expect(readDisplayedScore(screen, 'team-1')).toBe('0');
      expect(readDisplayedScore(screen, 'team-2')).toBe('15');
    });
  });

  test('navigates to the finish route when the match is completed', async () => {
    await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[...winQuickSet('team-1'), ...winQuickSet('team-1')]}
        startedAt={defaultStartedAt}
      />
    );

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/match/finish/$id',
          params: { id: 'test-match' },
          replace: true
        })
      );
    });
  });

  test('clicking finish marks the match finished and navigates to the finish route', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await screen.getByTestId('finish-button').click();

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/match/finish/$id',
          params: { id: 'test-match' },
          replace: true
        })
      );
    });
  });

  test('team panels are disabled when match is completed', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[...winQuickSet('team-1'), ...winQuickSet('team-1')]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeDisabled();
    await expect.element(screen.getByTestId('team-panel-team-2')).toBeDisabled();
  });

  test('finish button is disabled when match is already completed', async () => {
    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[...winQuickSet('team-1'), ...winQuickSet('team-1')]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('finish-button')).toBeDisabled();
  });

  test('renders the rotate device blocker in portrait orientation', async () => {
    mockUseOrientationDetection.mockReturnValue({
      isPortrait: true,
      isLandscape: false
    });

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('rotate-device-blocker')).toBeInTheDocument();
  });

  test('does not set data-controls-hidden when not in compact height', async () => {
    // Mock matchMedia to return false for max-height: 480px
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
      media: '',
      onchange: null
    } as unknown as MediaQueryList);

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    await expect.element(screen.getByTestId('layout-body')).toBeInTheDocument();
    expect(screen.container.querySelector('[data-controls-hidden]')).toBeNull();
  });

  test('sets data-controls-hidden after inactivity timeout in compact height landscape', async () => {
    vi.useFakeTimers();

    // Mock matchMedia to return true for max-height: 480px
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
      media: '',
      onchange: null
    } as unknown as MediaQueryList);

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    // Flush useEffect microtasks so matchMedia and inactivity timer effects run
    await vi.advanceTimersByTimeAsync(0);

    // Initially, data-controls-hidden should not be set (timer just started)
    expect(screen.container.querySelector('[data-controls-hidden]')).toBeNull();

    // Advance timers past the 5 second inactivity timeout
    await vi.advanceTimersByTimeAsync(5000);

    // After timeout, data-controls-hidden should be 'true' on the Layout root <main>
    await expect
      .element(screen.container.querySelector('main'))
      .toHaveAttribute('data-controls-hidden', 'true');
  });

  test('removes data-controls-hidden on user interaction in compact height landscape', async () => {
    vi.useFakeTimers();

    // Mock matchMedia to return true for max-height: 480px
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
      media: '',
      onchange: null
    } as unknown as MediaQueryList);

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    // Flush useEffect microtasks so matchMedia and inactivity timer effects run
    await vi.advanceTimersByTimeAsync(0);

    // Advance timers partway (4 seconds)
    await vi.advanceTimersByTimeAsync(4000);

    // Simulate user interaction (click on body, not on score controls)
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    // Flush any state updates triggered by the interaction
    await vi.advanceTimersByTimeAsync(0);

    // Advance remaining time (another 4000ms to reach 5s timeout)
    await vi.advanceTimersByTimeAsync(4000);

    // Timer should have been reset by the click, so controls should not be hidden yet
    expect(screen.container.querySelector('[data-controls-hidden]')).toBeNull();

    // Advance past the new 5 second timeout
    await vi.advanceTimersByTimeAsync(5000);

    // Now controls should be hidden on the Layout root <main>
    await expect
      .element(screen.container.querySelector('main'))
      .toHaveAttribute('data-controls-hidden', 'true');
  });

  test('score control interactions do not reset inactivity timer', async () => {
    vi.useFakeTimers();

    // Mock matchMedia to return true for max-height: 480px
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
      media: '',
      onchange: null
    } as unknown as MediaQueryList);

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    // Flush useEffect microtasks so matchMedia and inactivity timer effects run
    await vi.advanceTimersByTimeAsync(0);

    // Advance timers partway (4 seconds)
    await vi.advanceTimersByTimeAsync(4000);

    // Click on team panel (score control) - should NOT reset the timer
    await screen.getByTestId('team-panel-team-1').click();

    // Flush any state updates triggered by the interaction
    await vi.advanceTimersByTimeAsync(0);

    // Advance just 2 more seconds (total 6s, past the original 5s timeout)
    await vi.advanceTimersByTimeAsync(2000);

    // Controls should be hidden because score control interactions don't reset the timer
    await expect
      .element(screen.container.querySelector('main'))
      .toHaveAttribute('data-controls-hidden', 'true');
  });

  test('shows exit fullscreen button when footer is hidden in compact landscape', async () => {
    vi.useFakeTimers();

    // Mock matchMedia to return true for max-height: 480px
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
      media: '',
      onchange: null
    } as unknown as MediaQueryList);

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    // Flush useEffect microtasks
    await vi.advanceTimersByTimeAsync(0);

    // Initially, exit fullscreen button should not be visible
    expect(screen.container.querySelector('[data-testid="exit-fullscreen-button"]')).toBeNull();

    // Advance past the 5 second inactivity timeout
    await vi.advanceTimersByTimeAsync(5000);

    // After timeout, exit fullscreen button should appear
    await expect.element(screen.getByTestId('exit-fullscreen-button')).toBeInTheDocument();
  });

  test('clicking exit fullscreen button reveals footer and hides button', async () => {
    vi.useFakeTimers();

    // Mock matchMedia to return true for max-height: 480px
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
      media: '',
      onchange: null
    } as unknown as MediaQueryList);

    const screen = await render(
      <ActiveMatchScreen
        matchId="test-match"
        initialSetup={createTestSetup()}
        initialActions={[]}
        startedAt={defaultStartedAt}
      />
    );

    // Flush useEffect microtasks
    await vi.advanceTimersByTimeAsync(0);

    // Advance past the 5 second inactivity timeout
    await vi.advanceTimersByTimeAsync(5000);

    // After timeout, exit fullscreen button should be visible
    await expect.element(screen.getByTestId('exit-fullscreen-button')).toBeInTheDocument();

    // Click the exit fullscreen button
    await screen.getByTestId('exit-fullscreen-button').click();

    // Flush state updates
    await vi.advanceTimersByTimeAsync(0);

    // Exit fullscreen button should be hidden again
    expect(screen.container.querySelector('[data-testid="exit-fullscreen-button"]')).toBeNull();

    // Footer should be revealed (data-controls-hidden should not be set)
    expect(screen.container.querySelector('[data-controls-hidden]')).toBeNull();
  });
});

function readDisplayedScore(
  screen: Awaited<ReturnType<typeof render>>,
  teamId: 'team-1' | 'team-2'
): string {
  return (
    screen.getByTestId(`team-panel-${teamId}`).element().querySelector('[aria-live="polite"]')
      ?.textContent ?? ''
  );
}
