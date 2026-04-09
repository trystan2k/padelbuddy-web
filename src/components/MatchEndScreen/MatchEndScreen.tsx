import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Layout } from '@/components/Layout/Layout';
import { ShareScreen } from '@/components/ShareScreen/ShareScreen';
import { useToast } from '@/components/ui/Toast/useToast';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import type { MatchAction, MatchFormat, MatchProjection, MatchSetup } from '@/core/match/types';
import { clearCurrentMatch } from '@/lib/current-match/indexed-db';
import { createCurrentMatchSession } from '@/lib/current-match/session';
import { defaultLocale, isSupportedLocale } from '@/lib/i18n/types';
import { useSpeechService } from '@/lib/speech/speech-service';
import { prepareCurrentMatchRouteNavigation } from '@/lib/router/current-match-route-flow';
import { logRuntimeError } from '@/lib/utils/error';
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions';

import { createMatchEndScreenSummary, getMatchDurationParts } from './view-model';
import { MatchStatsCard } from './MatchStatsCard';
import { MatchSummaryCard } from './MatchSummaryCard';
import { WinnerCard } from './WinnerCard';
import { useMatchEndShare } from './useMatchEndShare';

import styles from './MatchEndScreen.module.css';

interface MatchEndScreenProps {
  matchId: string;
  setup: MatchSetup;
  actions: MatchAction[];
  projection: MatchProjection;
  startedAt: number;
  finishedAt?: number;
}

const formatTranslationKeys: Record<MatchFormat, 'bestOf1' | 'bestOf3' | 'bestOf5'> = {
  'best-of-1': 'bestOf1',
  'best-of-3': 'bestOf3',
  'best-of-5': 'bestOf5'
};

export function MatchEndScreen({
  matchId,
  setup,
  actions,
  projection,
  startedAt,
  finishedAt
}: MatchEndScreenProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isStartingNewMatch, setIsStartingNewMatch] = useState(false);
  const [isContinuingMatch, setIsContinuingMatch] = useState(false);
  const [shareScreenReady, setShareScreenReady] = useState(false);
  const [debugShareOpen, setDebugShareOpen] = useState(false);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const hasAnnouncedResultRef = useRef(false);
  const speechService = useSpeechService();
  const destroyRef = useRef(() => speechService.destroy());

  destroyRef.current = () => speechService.destroy();

  const summary = useMemo(
    () =>
      createMatchEndScreenSummary({
        projection,
        startedAt,
        ...(typeof finishedAt === 'number' ? { finishedAt } : {})
      }),
    [finishedAt, projection, startedAt]
  );
  const winnerLabel = summary.isFinishedEarly
    ? t('match.end.winner.finishedEarlyLabel')
    : t('match.end.winner.label');
  const winnerName = summary.isFinishedEarly
    ? t('match.end.winner.finishedEarlyName')
    : (summary.winnerName ?? '');

  const formatLabel = t(`setup.format.${formatTranslationKeys[summary.format]}`);
  const durationParts = getMatchDurationParts(summary.elapsedSeconds);
  const durationValue =
    durationParts.hours > 0
      ? t('match.end.stats.durationHoursMinutes', {
          hours: durationParts.hours,
          minutes: durationParts.minutes
        })
      : t('match.end.stats.durationMinutes', {
          minutes: durationParts.minutes
        });

  // Formats date using locale-aware Intl.DateTimeFormat
  const dateValue = useMemo(() => {
    if (typeof finishedAt !== 'number') {
      return '';
    }
    return new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(new Date(finishedAt));
  }, [finishedAt, i18n.language]);

  // Compute ShareScreen props
  const shareScreenProps = useMemo(() => {
    const winnerNameValue = summary.isFinishedEarly
      ? t('match.end.winner.finishedEarlyName')
      : (summary.winnerName ?? '');

    return {
      winnerName: winnerNameValue,
      team1Name: summary.teamNames['team-1'],
      team2Name: summary.teamNames['team-2'],
      formatLabel,
      setRows: summary.setRows.map((row) => ({
        setNumber: row.setNumber,
        team1Games: row.scores['team-1'],
        team2Games: row.scores['team-2']
      })),
      durationValue,
      dateValue
    };
  }, [
    durationValue,
    dateValue,
    formatLabel,
    summary.isFinishedEarly,
    summary.setRows,
    summary.teamNames,
    summary.winnerName,
    t
  ]);

  const shareText = summary.isFinishedEarly
    ? ''
    : t('match.end.share.text', {
        winnerName: summary.winnerName,
        formatLabel,
        durationValue,
        totalGames: summary.totalGames,
        teamOneName: summary.teamNames['team-1'],
        teamTwoName: summary.teamNames['team-2']
      });
  const finishedEarlyShareText = t('match.end.share.textFinishedEarly', {
    formatLabel,
    durationValue,
    totalGames: summary.totalGames,
    teamOneName: summary.teamNames['team-1'],
    teamTwoName: summary.teamNames['team-2']
  });
  const shareActionLabel = t('match.end.actions.share');
  const sharingActionLabel = t('match.end.actions.sharing');
  const handleCaptureComplete = useCallback(() => {
    setShareScreenReady(false);
  }, []);

  // Close debug modal on Escape
  useEffect(() => {
    if (!debugShareOpen) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDebugShareOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [debugShareOpen]);

  const handleDebugShareClose = useCallback(() => {
    setDebugShareOpen(false);
  }, []);

  const handleDebugShareOpen = useCallback(() => {
    setDebugShareOpen(true);
  }, []);

  const labels = useMemo(
    () => ({
      shareText,
      finishedEarlyShareText,
      errorMessage: t('match.end.share.error'),
      downloadMessage: t('match.end.share.download')
    }),
    [finishedEarlyShareText, shareText, t]
  );
  const { downloadMessage, errorMessage, handleShareClick, isSharing } = useMatchEndShare({
    captureRef,
    finishedAt: finishedAt ?? Date.now(),
    summary,
    labels,
    shareScreenReady,
    onCaptureComplete: handleCaptureComplete
  });

  const { addErrorToast, addInfoToast } = useToast();

  useEffect(() => {
    if (hasAnnouncedResultRef.current || !setup.audioAnnouncementsEnabled) {
      return;
    }

    hasAnnouncedResultRef.current = true;

    const currentLocale = isSupportedLocale(i18n.language) ? i18n.language : defaultLocale;
    const message = summary.winnerName
      ? t('match.end.speech.victory', { teamName: summary.winnerName })
      : t('match.end.speech.tiedMatch');

    speechService.speak(message, {
      immediate: true,
      lang: currentLocale
    });
  }, [i18n.language, setup.audioAnnouncementsEnabled, speechService, summary.winnerName, t]);

  useEffect(
    () => () => {
      destroyRef.current();
    },
    []
  );

  // Trigger toasts when error/download messages appear
  useEffect(() => {
    if (errorMessage) {
      addErrorToast(errorMessage, { timeout: 5000 });
    }
  }, [addErrorToast, errorMessage]);

  useEffect(() => {
    if (downloadMessage) {
      addInfoToast(downloadMessage, { timeout: 4000 });
    }
  }, [addInfoToast, downloadMessage]);

  const handleNewMatch = useCallback(async () => {
    if (isStartingNewMatch) {
      return;
    }

    setIsStartingNewMatch(true);

    try {
      await clearCurrentMatch();
      await prepareCurrentMatchRouteNavigation(router, { to: '/' });
      await navigate({ to: '/', ...getViewTransitionNavigationOptions() });
    } catch (error) {
      logRuntimeError('Failed to clear the current match before starting a new one.', error);
      setIsStartingNewMatch(false);
    }
  }, [isStartingNewMatch, navigate, router]);

  const handleContinue = useCallback(async () => {
    if (isContinuingMatch) {
      return;
    }

    setIsContinuingMatch(true);

    try {
      const session = createCurrentMatchSession({
        matchId,
        setup,
        actions,
        startedAt,
        ...(typeof finishedAt === 'number' ? { finishedAt } : {})
      });

      await session.continuePlaying();
      await navigate({
        to: '/match/$id',
        params: { id: matchId },
        replace: true,
        ...getViewTransitionNavigationOptions()
      });
    } catch (error) {
      logRuntimeError('Failed to continue the current match.', error);
      setIsContinuingMatch(false);
    }
  }, [actions, finishedAt, isContinuingMatch, matchId, navigate, setup, startedAt]);

  const handleShareButtonClick = useCallback(() => {
    handleShareClick();
    setShareScreenReady(true);
  }, [handleShareClick]);

  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('match.end.header.appName')}
        subtitle={t('match.end.header.subtitle')}
      >
        <button
          type="button"
          className={styles.shareButton}
          disabled={isSharing}
          aria-busy={isSharing || undefined}
          data-share-button="true"
          data-share-loading={isSharing ? 'true' : 'false'}
          onClick={handleShareButtonClick}
        >
          <ShareIcon />
          <span data-share-label="true">{isSharing ? sharingActionLabel : shareActionLabel}</span>
        </button>
      </TopBar>
    ),
    [handleShareButtonClick, isSharing, shareActionLabel, sharingActionLabel, t]
  );

  const footerContent = useMemo(
    () => <MatchStatsCard durationValue={durationValue} totalGames={summary.totalGames} />,
    [durationValue, summary.totalGames]
  );

  return (
    <>
      {/* ShareScreen is rendered off-screen when share button is clicked, then unmounted after capture */}
      {shareScreenReady && (
        <div aria-hidden="true" className={styles.hiddenCaptureRegion}>
          <ShareScreen ref={captureRef} {...shareScreenProps} />
        </div>
      )}

      <div data-testid="match-end-screen">
        <Layout bodyClassName={styles.body ?? ''} header={headerContent} footer={footerContent}>
          <div className={styles.content}>
            <section className={styles.hero} aria-label={t('match.end.aria.summaryRegion')}>
              <WinnerCard
                winnerLabel={winnerLabel}
                winnerName={winnerName}
                {...(summary.winnerTeamId ? { winnerTeamId: summary.winnerTeamId } : {})}
                isStartingNewMatch={isStartingNewMatch}
                isContinuingMatch={isContinuingMatch}
                onNewMatch={handleNewMatch}
                onContinue={handleContinue}
              />

              <MatchSummaryCard
                formatLabel={formatLabel}
                teamNames={summary.teamNames}
                setRows={summary.setRows}
              />
            </section>
          </div>
        </Layout>
      </div>
      {/* Debug share preview — hidden by default, revealed by inspecting and removing display:none */}
      <button
        type="button"
        className={styles.debugShareButton}
        data-debug-share-button
        onClick={handleDebugShareOpen}
        aria-hidden="true"
        tabIndex={-1}
      >
        S
      </button>

      {/* Debug modal */}
      {debugShareOpen && (
        <div
          className={styles.debugModalOverlay}
          onClick={handleDebugShareClose}
          onKeyDown={handleDebugShareClose}
          role="presentation"
          tabIndex={-1}
        >
          <div
            className={styles.debugModalContent}
            role="dialog"
            aria-modal="true"
            aria-label={t('match.end.debug.previewLabel')}
          >
            <div className={styles.debugModalHeader}>
              <span>{t('match.end.debug.previewTitle')}</span>
              <button
                type="button"
                className={styles.debugModalClose}
                onClick={handleDebugShareClose}
                aria-label={t('match.end.debug.closeModal')}
              >
                ✕
              </button>
            </div>
            <ShareScreen {...shareScreenProps} />
          </div>
        </div>
      )}
    </>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.shareIcon}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  );
}
