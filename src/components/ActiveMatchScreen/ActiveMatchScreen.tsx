import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Layout } from '@/components/Layout/Layout';
import { useToast } from '@/components/ui/Toast/useToast';
import { RotateDeviceBlocker } from '@/components/ui/RotateDeviceBlocker/RotateDeviceBlocker';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import { Button } from '@/components/ui/Button/Button';
import { getActionFromKey } from '@/lib/input/keyboard-aliases';
import {
  createDefaultRemoteControllerConfig,
  loadRemoteControllerConfigWithFallback,
  type RemoteControllerConfig
} from '@/lib/input/remote-controller-storage';
import { useInputHandler } from '@/lib/input/use-input-handler';
import { useMediaButtonsRemote } from '@/lib/input/use-media-buttons-remote';
import { prepareCurrentMatchRouteNavigation } from '@/lib/router/current-match-route-flow';
import { useOrientationDetection } from '@/lib/orientation/useOrientationDetection';
import { loadCurrentMatch } from '@/lib/current-match/indexed-db';
import { saveMatchHistory } from '@/lib/match-history/indexed-db';
import { cn } from '@/lib/utils/cn';
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions';

import { useInactivityTimer } from '@/hooks/useInactivityTimer';

import { getMatchTeamName } from '@/core/match/team-name';
import type { MatchAction, MatchSetup, MatchTeamId } from '@/core/match/types';

import { SetsCard } from './SetsCard/SetsCard';
import { SetsHistoryModal } from './SetsHistoryModal/SetsHistoryModal';
import { SideSwitchPrompt } from './SideSwitchPrompt/SideSwitchPrompt';
import { TeamPanel } from './TeamPanel/TeamPanel';
import { getSetsHistoryAutoOpenSignature } from './sets-history';
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
  const { addErrorToast } = useToast();
  const { isPortrait } = useOrientationDetection();
  const [sideSwitchDismissed, setSideSwitchDismissed] = useState(false);
  const [isNavigatingToFinish, setIsNavigatingToFinish] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<RemoteControllerConfig | null>(null);
  const [isCompactHeight, setIsCompactHeight] = useState(false);
  const [isSetsHistoryOpen, setIsSetsHistoryOpen] = useState(false);
  const [setsHistoryOpenToken, setSetsHistoryOpenToken] = useState(0);
  const previousSetsHistorySignatureRef = useRef<string | null>(null);
  const previousActionCountRef = useRef(initialActions.length);

  const retryHistorySave = useCallback(async () => {
    const currentMatch = await loadCurrentMatch();

    if (currentMatch.status !== 'ok' || typeof currentMatch.record.finishedAt !== 'number') {
      return;
    }

    const currentSnapshot = currentMatch.record;

    await saveMatchHistory({
      matchId: currentSnapshot.matchId,
      setup: currentSnapshot.setup,
      actions: currentSnapshot.actions,
      startedAt: currentSnapshot.startedAt,
      finishedAt: currentSnapshot.finishedAt!
    });
  }, []);

  const handleHistorySaveFailure = useCallback(
    (_err: unknown) => {
      addErrorToast(t('history.saveError'), {
        action: {
          label: t('history.saveRetry'),
          onClick: () => {
            return retryHistorySave();
          }
        }
      });
    },
    [addErrorToast, retryHistorySave, t]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (typeof window.matchMedia !== 'function') return undefined;

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
      onHistorySaveFailure: handleHistorySaveFailure,
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

  const {
    scoreDisplay,
    activeSetIndex,
    sideSwitch,
    servingTeam,
    servingPlayerNumber,
    isScoreboardMirrored
  } = derived;
  const showServingIndicator = setup.servingIndicatorEnabled;
  const visualTeamOrder = isScoreboardMirrored
    ? (['team-2', 'team-1'] as const)
    : (['team-1', 'team-2'] as const);

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
        const storedConfig = await loadRemoteControllerConfigWithFallback();

        if (!isMounted) {
          return;
        }

        setRemoteConfig(storedConfig);
      } catch (error) {
        console.error('Failed to load remote controller config.', error);

        if (!isMounted) {
          return;
        }

        setRemoteConfig(createDefaultRemoteControllerConfig());
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

  // Use keyboard input handler (always enabled - works alongside media buttons)
  useInputHandler(
    {
      actions: snapshot.actions,
      bindings: remoteConfig?.keyboardBindings ?? null,
      enabled: !isMatchCompleted,
      useWakeLock: true
    },
    {
      onAdd: handleRemoteAdd,
      onUndo: handleRevert,
      onUndoForTeam: handleRemoteUndoForTeam
    }
  );

  // Use media buttons remote handler (always enabled when match is active)
  useMediaButtonsRemote(
    {
      actions: snapshot.actions,
      enabled: !isMatchCompleted,
      useWakeLock: true
    },
    {
      onAdd: handleRemoteAdd,
      onUndoForTeam: handleRemoteUndoForTeam
    }
  );

  const shouldIgnoreRemoteKey = useCallback(
    (event: KeyboardEvent): boolean => {
      const action = getActionFromKey(event.key, remoteConfig?.keyboardBindings ?? null);
      return (
        action === 'add-team-1' ||
        action === 'add-team-2' ||
        action === 'revert-team-1' ||
        action === 'revert-team-2'
      );
    },
    [remoteConfig?.keyboardBindings]
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

  const handleOpenSetsHistory = useCallback(() => {
    setIsSetsHistoryOpen(true);
    setSetsHistoryOpenToken((currentToken) => currentToken + 1);
  }, []);

  const handleCloseSetsHistory = useCallback(() => {
    setIsSetsHistoryOpen(false);
  }, []);

  useEffect(() => {
    if (isMatchCompleted) {
      setIsSetsHistoryOpen(false);
    }
  }, [isMatchCompleted]);

  useEffect(() => {
    const nextSignature = getSetsHistoryAutoOpenSignature(state.sets);
    const previousSignature = previousSetsHistorySignatureRef.current;
    const hasNewScoringAction = snapshot.actions.length > previousActionCountRef.current;

    if (
      previousSignature !== null &&
      hasNewScoringAction &&
      previousSignature !== nextSignature &&
      setup.autoOpenSetsHistoryModal &&
      !isMatchCompleted &&
      !isNavigatingToFinish
    ) {
      setIsSetsHistoryOpen(true);
      setSetsHistoryOpenToken((currentToken) => currentToken + 1);
    }

    previousSetsHistorySignatureRef.current = nextSignature;
    previousActionCountRef.current = snapshot.actions.length;
  }, [
    isMatchCompleted,
    isNavigatingToFinish,
    setup.autoOpenSetsHistoryModal,
    snapshot.actions.length,
    state.sets
  ]);

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
  const teamColumns = visualTeamOrder.map((teamId) => {
    const isTeam1 = teamId === 'team-1';

    return {
      teamId,
      teamName: isTeam1 ? team1Name : team2Name,
      score: getTeamScore(teamId),
      isServing: servingTeam === teamId,
      servingPlayerNumber: servingTeam === teamId ? servingPlayerNumber : null,
      onClick: isTeam1 ? handleScoreTeam1 : handleScoreTeam2,
      onRevert: isTeam1 ? handleRevertTeam1 : handleRevertTeam2,
      isUndoDisabled: isTeam1 ? isUndoTeam1Disabled : isUndoTeam2Disabled,
      revertButtonClass: isTeam1 ? styles.revertButtonTeam1 : styles.revertButtonTeam2
    };
  });

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
      <Button
        type="button"
        className={styles.finishButton}
        onClick={handleFinish}
        disabled={isLoading || isMatchCompleted}
        data-testid="finish-button"
        accent="primary"
        variant="soft"
      >
        {t('match.actions.finishMatch')}
      </Button>
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
          {teamColumns.map((teamColumn) => (
            <div key={teamColumn.teamId} className={styles.teamColumn}>
              <TeamPanel
                teamId={teamColumn.teamId}
                teamName={teamColumn.teamName}
                score={teamColumn.score}
                isServing={teamColumn.isServing}
                servingPlayerNumber={teamColumn.servingPlayerNumber}
                showServingIndicator={showServingIndicator}
                onClick={teamColumn.onClick}
                disabled={isLoading || isMatchCompleted}
              />
              <button
                type="button"
                className={cn(styles.revertButton, teamColumn.revertButtonClass)}
                onClick={teamColumn.onRevert}
                disabled={teamColumn.isUndoDisabled}
                data-testid={`revert-button-${teamColumn.teamId}`}
                data-inactivity-ignore=""
              >
                {t('match.actions.revertPoint')}
              </button>
            </div>
          ))}

          <div className={styles.setsOverlay}>
            <SetsCard
              sets={state.sets}
              currentSetIndex={activeSetIndex}
              onOpenHistory={handleOpenSetsHistory}
              visualTeamOrder={visualTeamOrder}
            />
          </div>
        </div>

        <SetsHistoryModal
          isOpen={isSetsHistoryOpen}
          openToken={setsHistoryOpenToken}
          sets={state.sets}
          onClose={handleCloseSetsHistory}
          visualTeamOrder={visualTeamOrder}
        />

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
