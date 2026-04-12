import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Layout } from '@/components/Layout/Layout';
import { RotateDeviceBlocker } from '@/components/ui/RotateDeviceBlocker/RotateDeviceBlocker';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import {
  createEmptyRemoteControllerBindings,
  getActionFromKey
} from '@/lib/input/keyboard-aliases';
import { loadRemoteControllerBindingsWithFallback } from '@/lib/input/remote-controller-storage';
import { useInputHandler } from '@/lib/input/use-input-handler';
import { prepareCurrentMatchRouteNavigation } from '@/lib/router/current-match-route-flow';
import { useOrientationDetection } from '@/lib/orientation/useOrientationDetection';
import { cn } from '@/lib/utils/cn';
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions';

import { useInactivityTimer } from '@/hooks/useInactivityTimer';

import { getMatchTeamName } from '@/core/match/team-name';
import type { MatchAction, MatchSetup, MatchTeamId } from '@/core/match/types';

import { SetsCard } from './SetsCard/SetsCard';
import { SideSwitchPrompt } from './SideSwitchPrompt/SideSwitchPrompt';
import { TeamPanel } from './TeamPanel/TeamPanel';
import { useMatchAnnouncements } from './useMatchAnnouncements';
import { useMatchSession } from './useMatchSession';
import { useMatchTimer } from './useMatchTimer';

import styles from './ActiveMatchScreen.module.css';

// Selectors for score control elements - used by inactivity timer to ignore interactions
const SCORE_CONTROL_SELECTORS: string[] = ['[data-inactivity-ignore]'];

interface ActiveMatchScreenProps {
  matchId: string;
  initialSetup: MatchSetup;
  initialActions: MatchAction[];
  startedAt: number;
  finishedAt?: number;
}

export function ActiveMatchScreen({
  matchId,
  initialSetup,
  initialActions,
  startedAt,
  finishedAt
}: ActiveMatchScreenProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const { t } = useTranslation();
  const { isPortrait } = useOrientationDetection();
  const [sideSwitchDismissed, setSideSwitchDismissed] = useState(false);
  const [isNavigatingToFinish, setIsNavigatingToFinish] = useState(false);
  const [remoteBindings, setRemoteBindings] = useState(createEmptyRemoteControllerBindings());
  const [isCompactHeight, setIsCompactHeight] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = window.matchMedia('(max-height: 480px)');
    setIsCompactHeight(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsCompactHeight(e.matches);
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
    } else {
      // Fallback for browsers that only support addListener/removeListener
      query.addListener(handler);
    }
    return () => {
      if (typeof query.removeEventListener === 'function') {
        query.removeEventListener('change', handler);
      } else {
        query.removeListener(handler);
      }
    };
  }, []);
  const { snapshot, scorePoint, undoScoreAction, undoScoreActionForTeam, finishMatch, isLoading } =
    useMatchSession({
      matchId,
      setup: initialSetup,
      initialActions,
      startedAt,
      ...(typeof finishedAt === 'number' ? { initialFinishedAt: finishedAt } : {})
    });

  const isMatchCompleted =
    snapshot.projection.derived.status === 'completed' || typeof snapshot.finishedAt === 'number';
  const countdownEnabled = snapshot.projection.setup.countdownTimerEnabled;
  const { formattedTime } = useMatchTimer({
    startedAt: snapshot.startedAt,
    ...(typeof snapshot.finishedAt === 'number' ? { finishedAt: snapshot.finishedAt } : {}),
    isMatchCompleted,
    countdownEnabled,
    countdownDuration: snapshot.projection.setup.countdownTimerDuration
  });

  const { setup, state, derived } = snapshot.projection;
  const resolvedTeam1Name = getMatchTeamName(setup, 'team-1');
  const resolvedTeam2Name = getMatchTeamName(setup, 'team-2');
  const team1Name =
    resolvedTeam1Name === 'team-1' ? t('setup.firstServer.team1') : resolvedTeam1Name;
  const team2Name =
    resolvedTeam2Name === 'team-2' ? t('setup.firstServer.team2') : resolvedTeam2Name;

  const { scoreDisplay, activeSetIndex, sideSwitch, servingTeam } = derived;
  const showServingIndicator = setup.servingIndicatorEnabled;

  useMatchAnnouncements({
    projection: snapshot.projection,
    actionCount: snapshot.actions.length,
    team1Name,
    team2Name
  });

  useEffect(() => {
    if (sideSwitch.shouldPrompt) {
      setSideSwitchDismissed(false);
    }
  }, [sideSwitch.shouldPrompt]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const storedBindings = await loadRemoteControllerBindingsWithFallback();

        if (!isMounted) {
          return;
        }

        setRemoteBindings(storedBindings);
      } catch (error) {
        console.error('Failed to load remote controller bindings.', error);

        if (!isMounted) {
          return;
        }

        setRemoteBindings(createEmptyRemoteControllerBindings());
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMatchCompleted || isNavigatingToFinish) {
      return;
    }

    setIsNavigatingToFinish(true);

    void (async () => {
      try {
        await prepareCurrentMatchRouteNavigation(
          router,
          {
            to: '/match/finish/$id',
            params: { id: matchId }
          },
          { invalidate: true }
        );
        await navigate({
          to: '/match/finish/$id',
          params: { id: matchId },
          replace: true,
          ...getViewTransitionNavigationOptions()
        });
      } catch (error) {
        console.error('Failed to navigate to the finished match route.', error);
        setIsNavigatingToFinish(false);
      }
    })();
  }, [isMatchCompleted, isNavigatingToFinish, matchId, navigate, router]);

  const getTeamScore = (teamId: MatchTeamId): string => {
    if (scoreDisplay.kind === 'standard') {
      return scoreDisplay.points[teamId];
    }
    if (scoreDisplay.kind === 'tiebreak') {
      return String(scoreDisplay.points[teamId]);
    }
    return '0';
  };

  const handleScoreTeam1 = useCallback(async () => {
    if (isLoading) {
      return;
    }

    await scorePoint('team-1');
  }, [isLoading, scorePoint]);

  const handleScoreTeam2 = useCallback(async () => {
    if (isLoading) {
      return;
    }

    await scorePoint('team-2');
  }, [isLoading, scorePoint]);

  const handleRevert = useCallback(async () => {
    if (isLoading) {
      return;
    }

    await undoScoreAction();
  }, [isLoading, undoScoreAction]);

  const handleRevertTeam1 = useCallback(async () => {
    if (isLoading) {
      return;
    }

    await undoScoreActionForTeam('team-1');
  }, [isLoading, undoScoreActionForTeam]);

  const handleRevertTeam2 = useCallback(async () => {
    if (isLoading) {
      return;
    }

    await undoScoreActionForTeam('team-2');
  }, [isLoading, undoScoreActionForTeam]);

  const handleRemoteAdd = useCallback(
    async (teamId: MatchTeamId) => {
      if (isLoading || isMatchCompleted) {
        return;
      }

      await scorePoint(teamId);
    },
    [isLoading, isMatchCompleted, scorePoint]
  );

  const handleRemoteUndoForTeam = useCallback(
    async (teamId: MatchTeamId) => {
      if (isLoading || isMatchCompleted) {
        return;
      }

      await undoScoreActionForTeam(teamId);
    },
    [isLoading, isMatchCompleted, undoScoreActionForTeam]
  );

  useInputHandler(
    {
      actions: snapshot.actions,
      bindings: remoteBindings,
      enabled: !isMatchCompleted,
      useWakeLock: true
    },
    {
      onAdd: handleRemoteAdd,
      onUndo: handleRevert,
      onUndoForTeam: handleRemoteUndoForTeam
    }
  );

  const shouldIgnoreRemoteKey = useCallback(
    (event: KeyboardEvent): boolean => {
      const action = getActionFromKey(event.key, remoteBindings);
      return (
        action === 'add-team-1' ||
        action === 'add-team-2' ||
        action === 'revert-team-1' ||
        action === 'revert-team-2'
      );
    },
    [remoteBindings]
  );

  const shouldEnableInactivityTimer = isCompactHeight && !isPortrait;

  const shouldIgnoreEvent = useCallback(
    (event: Event) => {
      if (event instanceof KeyboardEvent) {
        return shouldIgnoreRemoteKey(event);
      }
      return false;
    },
    [shouldIgnoreRemoteKey]
  );

  const { isActive: isInactivityTimerActive, reset: resetInactivityTimer } = useInactivityTimer({
    enabled: shouldEnableInactivityTimer,
    timeoutMs: 5000,
    ignoredTargetSelectors: SCORE_CONTROL_SELECTORS,
    shouldIgnoreEvent
  });

  const shouldHideControls = shouldEnableInactivityTimer && !isInactivityTimerActive;

  const handleExitFullscreenClick = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleFinish = useCallback(async () => {
    if (isLoading || isMatchCompleted) {
      return;
    }

    await finishMatch();
  }, [finishMatch, isLoading, isMatchCompleted]);

  const handleSideSwitchClose = useCallback(() => {
    setSideSwitchDismissed(true);
  }, []);

  const shouldShowSideSwitch =
    sideSwitch.shouldPrompt && setup.sideSwitchPrompts && !sideSwitchDismissed;
  const timerLabelKey = countdownEnabled ? 'match.timer.countdownLabel' : 'match.timer.label';
  const canUndoTeam1 = useMemo(
    () =>
      snapshot.actions.some(
        (action) => action.type === 'score-point' && action.teamId === 'team-1'
      ),
    [snapshot.actions]
  );
  const canUndoTeam2 = useMemo(
    () =>
      snapshot.actions.some(
        (action) => action.type === 'score-point' && action.teamId === 'team-2'
      ),
    [snapshot.actions]
  );
  const isUndoTeam1Disabled = isLoading || !canUndoTeam1;
  const isUndoTeam2Disabled = isLoading || !canUndoTeam2;

  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('match.header.appName')}
        subtitle={t('match.header.subtitle')}
      >
        {shouldHideControls && (
          <button
            type="button"
            className={styles.exitFullscreenButton}
            onClick={handleExitFullscreenClick}
            data-testid="exit-fullscreen-button"
          >
            {t('match.actions.exitFullscreen')}
          </button>
        )}
        <div
          role="timer"
          aria-label={t(timerLabelKey, { time: formattedTime })}
          className={styles.timerChip}
          data-testid="time-chip"
        >
          {formattedTime}
        </div>
      </TopBar>
    ),
    [formattedTime, handleExitFullscreenClick, shouldHideControls, t, timerLabelKey]
  );

  const footerContent = useMemo(
    () => (
      <button
        type="button"
        className={styles.finishButton}
        onClick={handleFinish}
        disabled={isLoading || isMatchCompleted}
        data-testid="finish-button"
      >
        {t('match.actions.finishMatch')}
      </button>
    ),
    [handleFinish, isLoading, isMatchCompleted, t]
  );

  return (
    <>
      <Layout
        header={headerContent}
        footer={footerContent}
        data-controls-hidden={shouldHideControls ? 'true' : undefined}
      >
        <div className={styles.scorePanel}>
          <div className={styles.teamColumn}>
            <TeamPanel
              teamId="team-1"
              teamName={team1Name}
              score={getTeamScore('team-1')}
              isServing={servingTeam === 'team-1'}
              showServingIndicator={showServingIndicator}
              onClick={handleScoreTeam1}
              disabled={isLoading || isMatchCompleted}
            />
            <button
              type="button"
              className={cn(styles.revertButton, styles.revertButtonTeam1)}
              onClick={handleRevertTeam1}
              disabled={isUndoTeam1Disabled}
              data-testid="revert-button-team-1"
              data-inactivity-ignore=""
            >
              {t('match.actions.revertPoint')}
            </button>
          </div>

          <div className={styles.teamColumn}>
            <TeamPanel
              teamId="team-2"
              teamName={team2Name}
              score={getTeamScore('team-2')}
              isServing={servingTeam === 'team-2'}
              showServingIndicator={showServingIndicator}
              onClick={handleScoreTeam2}
              disabled={isLoading || isMatchCompleted}
            />
            <button
              type="button"
              className={cn(styles.revertButton, styles.revertButtonTeam2)}
              onClick={handleRevertTeam2}
              disabled={isUndoTeam2Disabled}
              data-testid="revert-button-team-2"
              data-inactivity-ignore=""
            >
              {t('match.actions.revertPoint')}
            </button>
          </div>

          <div className={styles.setsOverlay}>
            <SetsCard sets={state.sets} currentSetIndex={activeSetIndex} />
          </div>
        </div>

        <SideSwitchPrompt
          isOpen={shouldShowSideSwitch}
          reason={sideSwitch.reason}
          onClose={handleSideSwitchClose}
        />
      </Layout>

      {isPortrait ? <RotateDeviceBlocker /> : null}
    </>
  );
}
