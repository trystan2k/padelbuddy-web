import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ShareScreen, type ShareScreenProps } from '@/components/ShareScreen/ShareScreen';
import { getMatchTeamName } from '@/core/match/team-name';
import { projectMatch } from '@/core/match/replay';
import type { MatchFormat, MatchSetState, MatchTeamId } from '@/core/match/types';
import { deleteMatchHistory } from '@/lib/match-history/indexed-db';
import { saveSetupPreferenceSlice } from '@/lib/setup/setup-storage';
import type { MatchHistoryRecord } from '@/lib/match-history/persistence';

import { Layout } from '@/components/Layout/Layout';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import { useToast } from '@/components/ui/Toast/useToast';
import { Button } from '@/components/ui/Button/Button';
import { useMatchShare } from '@/hooks/useMatchShare';
import { determineWinnerFromCompletedSets, getMatchDurationParts } from '@/lib/share/match-share';

import styles from './HistoryScreen.module.css';

interface HistoryScreenProps {
  initialRecords: MatchHistoryRecord[];
}

interface HistoryRow {
  id: string;
  team1Name: string;
  team2Name: string;
  setsScore: string;
  setsScoreUnfinished: boolean;
  gamesScore: string;
  dateLabel: string;
  winnerTeamId: MatchTeamId | null;
  finishedAt: number;
  record: MatchHistoryRecord;
}

const requiredSetsToWinByFormat: Record<MatchFormat, number> = {
  'best-of-1': 1,
  'best-of-3': 2,
  'best-of-5': 3
};

const formatTranslationKeys: Record<MatchFormat, 'bestOf1' | 'bestOf3' | 'bestOf5'> = {
  'best-of-1': 'bestOf1',
  'best-of-3': 'bestOf3',
  'best-of-5': 'bestOf5'
};

export function HistoryScreen({ initialRecords }: HistoryScreenProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState(initialRecords);
  const [sharingMatchId, setSharingMatchId] = useState<string | null>(null);
  const [shareScreenReady, setShareScreenReady] = useState(false);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const { addErrorToast, addSuccessToast } = useToast();

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const historyRows = useMemo<HistoryRow[]>(
    () =>
      records.map((record) => {
        const projection = projectMatch(record.setup, record.actions);
        const completedSetsCount = projection.state.sets.filter((set) => set.completed).length;
        const requiredSetsToWin = requiredSetsToWinByFormat[record.setup.format];
        const winner = determineWinnerFromCompletedSets(projection.state.sets);
        const isFinishedEarly = completedSetsCount < requiredSetsToWin || !winner;

        return {
          id: record.matchId,
          team1Name: getMatchTeamName(record.setup, 'team-1'),
          team2Name: getMatchTeamName(record.setup, 'team-2'),
          setsScore: toSetsScore(projection.state.sets),
          setsScoreUnfinished: isFinishedEarly,
          gamesScore: toGamesScore(projection.state.sets),
          dateLabel: formatHistoryDate(record.finishedAt, i18n.language),
          winnerTeamId: winner?.teamId ?? null,
          finishedAt: record.finishedAt,
          record
        };
      }),
    [i18n.language, records]
  );

  // Find the record being shared
  const sharingRecord = useMemo(
    () => historyRows.find((row) => row.id === sharingMatchId),
    [historyRows, sharingMatchId]
  );

  // Compute share screen props for the record being shared
  const shareScreenProps = useMemo<ShareScreenProps | null>(() => {
    if (!sharingRecord) {
      return null;
    }

    const { record } = sharingRecord;
    const projection = projectMatch(record.setup, record.actions);
    const winner = determineWinnerFromCompletedSets(projection.state.sets);
    const isFinishedEarly = !winner;

    const winnerNameValue = isFinishedEarly
      ? t('match.end.winner.finishedEarlyName')
      : winner
        ? winner.teamId === 'team-1'
          ? sharingRecord.team1Name
          : sharingRecord.team2Name
        : '';

    const formatLabel = t(`setup.format.${formatTranslationKeys[record.setup.format]}`);

    const elapsedSeconds = Math.max(0, Math.floor((record.finishedAt - record.startedAt) / 1000));
    const durationParts = getMatchDurationParts(elapsedSeconds);
    const durationValue =
      durationParts.hours > 0
        ? t('match.end.stats.durationHoursMinutes', {
            hours: durationParts.hours,
            minutes: durationParts.minutes
          })
        : t('match.end.stats.durationMinutes', {
            minutes: durationParts.minutes
          });

    const dateValue = new Intl.DateTimeFormat(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(new Date(record.finishedAt));

    const setRows = projection.state.sets.map((set) => ({
      setNumber: set.index,
      team1Games: set.games['team-1'],
      team2Games: set.games['team-2']
    }));

    return {
      winnerName: winnerNameValue,
      ...(sharingRecord.winnerTeamId ? { winnerTeamId: sharingRecord.winnerTeamId } : {}),
      team1Name: sharingRecord.team1Name,
      team2Name: sharingRecord.team2Name,
      formatLabel,
      setRows,
      durationValue,
      dateValue
    };
  }, [sharingRecord, t, i18n.language]);

  // Share labels
  const shareLabels = useMemo(
    () => ({
      shareText: t('history.shareMessage', {
        team1: sharingRecord?.team1Name ?? '',
        team2: sharingRecord?.team2Name ?? '',
        date: sharingRecord?.dateLabel ?? '',
        sets: sharingRecord?.setsScore ?? '',
        games: sharingRecord?.gamesScore ?? ''
      }),
      finishedEarlyShareText: t('history.shareMessage', {
        team1: sharingRecord?.team1Name ?? '',
        team2: sharingRecord?.team2Name ?? '',
        date: sharingRecord?.dateLabel ?? '',
        sets: sharingRecord?.setsScore ?? '',
        games: sharingRecord?.gamesScore ?? ''
      }),
      errorMessage: t('history.actions.shareError'),
      downloadMessage: t('history.actions.shareCopied')
    }),
    [sharingRecord, t]
  );

  const handleCaptureComplete = useCallback(() => {
    setShareScreenReady(false);
  }, []);

  const { downloadMessage, errorMessage, handleShareClick, isSharing } = useMatchShare({
    captureRef,
    finishedAt: sharingRecord?.finishedAt ?? Date.now(),
    summary: sharingRecord
      ? {
          ...(sharingRecord.winnerTeamId ? { winnerTeamId: sharingRecord.winnerTeamId } : {}),
          isFinishedEarly: sharingRecord.setsScoreUnfinished,
          teamNames: {
            'team-1': sharingRecord.team1Name,
            'team-2': sharingRecord.team2Name
          },
          setRows: shareScreenProps
            ? shareScreenProps.setRows.map((row) => ({
                setNumber: row.setNumber,
                scores: {
                  'team-1': row.team1Games,
                  'team-2': row.team2Games
                },
                isSuperTiebreak: false
              }))
            : [],
          totalGames: 0,
          elapsedSeconds: sharingRecord
            ? Math.max(
                0,
                Math.floor(
                  (sharingRecord.record.finishedAt - sharingRecord.record.startedAt) / 1000
                )
              )
            : 0
        }
      : {
          isFinishedEarly: false,
          teamNames: { 'team-1': '', 'team-2': '' },
          setRows: [],
          totalGames: 0,
          elapsedSeconds: 0
        },
    labels: shareLabels,
    shareScreenReady,
    onCaptureComplete: handleCaptureComplete
  });

  // Show error/success toasts
  useEffect(() => {
    if (errorMessage) {
      addErrorToast(errorMessage, { timeout: 5000 });
    }
  }, [addErrorToast, errorMessage]);

  useEffect(() => {
    if (downloadMessage) {
      addSuccessToast(downloadMessage, { timeout: 5000 });
    }
  }, [addSuccessToast, downloadMessage]);

  const handleBack = useCallback(() => {
    void navigate({ to: '/' });
  }, [navigate]);

  const handlePlayAgainClick = useCallback(
    async (team1Name: string, team2Name: string) => {
      await saveSetupPreferenceSlice({ team1Name, team2Name });
      void navigate({ to: '/' });
    },
    [navigate]
  );

  const handlePlayAgainButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const team1Name = event.currentTarget.dataset.teamOneName;
      const team2Name = event.currentTarget.dataset.teamTwoName;

      if (!team1Name || !team2Name) {
        return;
      }

      void handlePlayAgainClick(team1Name, team2Name);
    },
    [handlePlayAgainClick]
  );

  const handleDeleteClick = useCallback(
    async (matchId: string) => {
      // oxlint-disable-next-line eslint(no-alert) -- native confirmation requested for delete action
      const confirmed = window.confirm(t('history.actions.deleteConfirm'));

      if (!confirmed) {
        return;
      }

      await deleteMatchHistory(matchId);
      setRecords((prev) => prev.filter((record) => record.matchId !== matchId));
      addSuccessToast(t('history.deleteSuccess'));
    },
    [addSuccessToast, t]
  );

  const handleShareButtonClick = useCallback(
    (matchId: string) => {
      setSharingMatchId(matchId);
      handleShareClick();
      setShareScreenReady(true);
    },
    [handleShareClick]
  );

  const handleShareButtonClickCallback = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const matchId = event.currentTarget.dataset.matchId;

      if (!matchId) {
        return;
      }

      handleShareButtonClick(matchId);
    },
    [handleShareButtonClick]
  );

  const handleDeleteButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const matchId = event.currentTarget.dataset.matchId;

      if (!matchId) {
        return;
      }

      void handleDeleteClick(matchId);
    },
    [handleDeleteClick]
  );

  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('app.title')}
        subtitle={t('history.header.title')}
      >
        <p className={styles.matchCountChip}>
          {t('history.matchCount', { count: historyRows.length })}
        </p>
      </TopBar>
    ),
    [historyRows.length, t]
  );

  const footerContent = useMemo(
    () => (
      <Button
        type="button"
        className={styles.backButton}
        onClick={handleBack}
        accent="primary"
        variant="soft"
      >
        {t('history.actions.back')}
      </Button>
    ),
    [handleBack, t]
  );

  return (
    <Layout header={headerContent} footer={footerContent}>
      {/* ShareScreen is rendered off-screen when share button is clicked */}
      {shareScreenReady && shareScreenProps && (
        <div aria-hidden="true" className={styles.hiddenCaptureRegion}>
          <ShareScreen ref={captureRef} {...shareScreenProps} />
        </div>
      )}

      <section className={styles.content} aria-label={t('history.header.title')}>
        {historyRows.length === 0 ? (
          <p className={styles.emptyState}>{t('history.emptyState')}</p>
        ) : (
          <div className={styles.table}>
            <table className={styles.tableElement} aria-label={t('history.table.ariaLabel')}>
              <thead>
                <tr className={styles.headerRow}>
                  <th scope="col" className={styles.headerCell}>
                    {t('history.table.columns.teams')}
                  </th>
                  <th scope="col" className={styles.headerCell}>
                    {t('history.table.columns.date')}
                  </th>
                  <th scope="col" className={styles.headerCell}>
                    {t('history.table.columns.sets')}
                  </th>
                  <th scope="col" className={styles.headerCell}>
                    {t('history.table.columns.games')}
                  </th>
                  <th scope="col" className={`${styles.headerCell} ${styles.actionsColumn}`}>
                    {t('history.table.columns.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className={styles.rows}>
                {historyRows.map((row) => (
                  <tr key={row.id} className={styles.dataRow}>
                    <td className={styles.teamsCell}>
                      <div className={styles.teamsCellContent}>
                        <p
                          className={`${styles.teamPrimary} ${
                            row.winnerTeamId === 'team-1' ? styles.teamOneWinner : ''
                          }`}
                        >
                          {row.team1Name}
                        </p>
                        <p
                          className={`${styles.teamSecondary} ${
                            row.winnerTeamId === 'team-2' ? styles.teamTwoWinner : ''
                          }`}
                        >
                          {row.team2Name}
                        </p>
                      </div>
                    </td>
                    <td className={styles.dateCell}>{row.dateLabel}</td>
                    <td className={styles.setsCell}>
                      {row.setsScoreUnfinished ? (
                        <span title={t('history.setsScore.unfinishedTooltip')}>
                          {row.setsScore}*
                        </span>
                      ) : (
                        row.setsScore
                      )}
                    </td>
                    <td className={styles.gamesCell}>{row.gamesScore}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.iconActionsRow}>
                        <button
                          type="button"
                          className={styles.shareButton}
                          disabled={isSharing && sharingMatchId !== row.id}
                          data-testid={`history-share-${row.id}`}
                          data-match-id={row.id}
                          onClick={handleShareButtonClickCallback}
                          aria-label={t('history.actions.shareAriaLabel', {
                            team1: row.team1Name,
                            team2: row.team2Name
                          })}
                        >
                          <svg
                            className={styles.actionIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="m8.59 13.51 6.83 3.98" />
                            <path d="m15.41 6.51-6.82 3.98" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          data-testid={`history-delete-${row.id}`}
                          data-match-id={row.id}
                          onClick={handleDeleteButtonClick}
                          aria-label={t('history.actions.deleteAriaLabel', {
                            team1: row.team1Name,
                            team2: row.team2Name
                          })}
                        >
                          <svg
                            className={styles.actionIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.playAgainButton}
                        data-team-one-name={row.team1Name}
                        data-team-two-name={row.team2Name}
                        onClick={handlePlayAgainButtonClick}
                        aria-label={t('history.actions.playAgainAriaLabel', {
                          team1: row.team1Name,
                          team2: row.team2Name
                        })}
                      >
                        {t('history.actions.playAgain')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}

function toSetsScore(sets: MatchSetState[]): string {
  let teamOneSetsWon = 0;
  let teamTwoSetsWon = 0;

  for (const set of sets) {
    if (!set.completed) {
      continue;
    }

    if (set.winner === 'team-1') {
      teamOneSetsWon += 1;
      continue;
    }

    teamTwoSetsWon += 1;
  }

  return `${teamOneSetsWon}-${teamTwoSetsWon}`;
}

function toGamesScore(sets: MatchSetState[]): string {
  return sets.map((set) => `${set.games['team-1']}-${set.games['team-2']}`).join(', ');
}

function formatHistoryDate(timestamp: number, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).formatToParts(new Date(timestamp));

  const day = parts.find((part) => part.type === 'day')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const year = parts.find((part) => part.type === 'year')?.value;

  if (day && month && year) {
    return `${day} ${month} ${year}`;
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(timestamp));
}
