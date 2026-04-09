import { useTranslation } from 'react-i18next';

import { TrophyIcon } from '@/components/ui/Icon/TrophyIcon';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import type { MatchTeamId } from '@/core/match/types';
import { cn } from '@/lib/utils/cn';

import styles from './WinnerCard.module.css';

interface WinnerCardProps {
  winnerLabel: string;
  winnerName: string;
  winnerTeamId?: MatchTeamId;
  isStartingNewMatch: boolean;
  isContinuingMatch: boolean;
  onNewMatch: () => void;
  onContinue: () => void;
}

export function WinnerCard({
  winnerLabel,
  winnerName,
  winnerTeamId,
  isStartingNewMatch,
  isContinuingMatch,
  onNewMatch,
  onContinue
}: WinnerCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={styles.card} data-testid="match-end-winner-card">
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.trophyBadge} aria-hidden="true">
            <TrophyIcon size={24} className={styles.trophyIcon} />
          </div>
          <p className={styles.label}>{winnerLabel}</p>
          <h2
            className={cn(
              styles.winnerName,
              winnerTeamId === 'team-1'
                ? styles.teamPrimary
                : winnerTeamId === 'team-2'
                  ? styles.teamSecondary
                  : styles.teamNeutral
            )}
          >
            {winnerName}
          </h2>
        </div>

        <div className={styles.actionGroup}>
          <Button
            className={cn(styles.actionButton, styles.newMatchButton)}
            accent="success"
            disabled={isStartingNewMatch}
            onClick={onNewMatch}
            size="sm"
            data-testid="new-match-button"
          >
            {t('match.end.actions.newMatch')}
          </Button>
          <Button
            className={cn(styles.actionButton, styles.continueButton)}
            disabled={isContinuingMatch}
            onClick={onContinue}
            size="sm"
            data-testid="continue-match-button"
            variant="outline"
          >
            {t('match.end.actions.continue')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
