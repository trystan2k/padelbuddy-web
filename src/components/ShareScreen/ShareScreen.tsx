import { useTranslation } from 'react-i18next';

import type { SetSummaryRow } from '@/core/match/set-summary';
import type { MatchTeamId } from '@/core/match/types';
import { SetScoreValue } from '@/components/SetScoreValue/SetScoreValue';
import { TrophyIcon } from '@/components/ui/Icon/TrophyIcon';
import { TopBar } from '@/components/ui/TopBar/TopBar';

import styles from './ShareScreen.module.css';
import { cn } from '@/lib/utils/cn';

export interface ShareScreenProps {
  ref?: import('react').Ref<HTMLDivElement>;
  winnerName: string;
  winnerTeamId?: MatchTeamId;
  team1Name: string;
  team2Name: string;
  formatLabel: string;
  setRows: SetSummaryRow[];
  durationValue: string;
  dateValue: string;
}

export function ShareScreen({
  ref,
  winnerName,
  winnerTeamId,
  team1Name,
  team2Name,
  formatLabel,
  setRows,
  durationValue,
  dateValue
}: ShareScreenProps) {
  const { t } = useTranslation();

  const matchCompleteBadge = t('share.topbar.badge');

  // Determine winner name color based on which team won
  // Team A (purple), Team B (orange), or neutral (black) for ties
  const winnerNameClass =
    winnerTeamId === 'team-1'
      ? styles.winnerNameTeamA
      : winnerTeamId === 'team-2'
        ? styles.winnerNameTeamB
        : styles.winnerNameNeutral;

  return (
    <div
      ref={ref}
      className={cn('screen', styles.shareScreen)}
      aria-hidden="true"
      data-share-screen
    >
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('share.topbar.appName')}
        subtitle={matchCompleteBadge}
        showHelpTrigger={false}
      />

      <div className={styles.content}>
        {/* Result Card */}
        <div className={styles.resultCard}>
          <div className={styles.trophyWrap}>
            <TrophyIcon size={44} className={styles.trophyIcon} />
          </div>
          <span className={styles.winnersLabel}>{t('share.result.winners')}</span>
          <span className={winnerNameClass}>{winnerName}</span>
        </div>

        {/* Score Card */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreHeader}>
            <span className={styles.scoreTitle}>{t('share.score.title')}</span>
            <span className={styles.bestOfBadge}>{formatLabel}</span>
          </div>

          <div className={styles.teamHeaders}>
            <span />
            <span className={styles.teamAHeader}>{team1Name}</span>
            <span />
            <span className={styles.teamBHeader}>{team2Name}</span>
          </div>

          <div className={styles.scoreRows}>
            {setRows.map((row) => (
              <div key={row.setNumber} className={styles.setRow}>
                <span className={styles.setLabel}>
                  {t('share.score.set', { number: row.setNumber })}
                </span>
                <span className={styles.winnerScore}>
                  <SetScoreValue score={row.team1Games} tiebreakClassName={styles.tiebreakPoints} />
                </span>
                <span className={styles.setDash}>-</span>
                <span className={styles.loserScore}>
                  <SetScoreValue score={row.team2Games} tiebreakClassName={styles.tiebreakPoints} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>{t('share.stats.duration')}</span>
            <span className={styles.statValue}>{durationValue}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>{t('share.stats.date')}</span>
            <span className={styles.statValue}>{dateValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
