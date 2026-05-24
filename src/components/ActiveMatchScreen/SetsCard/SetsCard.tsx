import { useTranslation } from 'react-i18next';

import type { MatchSetState } from '@/core/match/types';

import { getCurrentSet, getSetDisplayScore } from '../sets-history';

import styles from './SetsCard.module.css';

interface SetsCardProps {
  sets: MatchSetState[];
  currentSetIndex: number | null;
  onOpenHistory?: () => void;
}

/**
 * SetsCard component - compact trigger showing current set score only.
 */
export function SetsCard({ sets, currentSetIndex, onOpenHistory }: SetsCardProps) {
  const { t } = useTranslation();

  const currentSet = getCurrentSet(sets, currentSetIndex);
  const currentScore = getSetDisplayScore(currentSet);

  const cardContent = (
    <>
      <span className={styles.label}>{t('match.sets.label')}</span>
      <span className={styles.setRow} data-testid="set-row-current">
        <span className={styles.setScore} data-testid="set-score-current">
          <span className={styles.team1Games}>{currentScore['team-1']}</span>
          <span className={styles.divider}>-</span>
          <span className={styles.team2Games}>{currentScore['team-2']}</span>
        </span>
      </span>
    </>
  );

  const historyTriggerLabel = t('match.sets.openHistoryLabel', {
    team1: currentScore['team-1'],
    team2: currentScore['team-2']
  });

  if (typeof onOpenHistory !== 'function') {
    return (
      <div className={styles.container} data-testid="sets-card">
        {cardContent}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.trigger}
      data-testid="sets-card"
      aria-label={historyTriggerLabel}
      onClick={onOpenHistory}
    >
      <span className={styles.container}>{cardContent}</span>
    </button>
  );
}
