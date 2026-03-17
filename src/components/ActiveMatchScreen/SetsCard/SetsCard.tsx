import { useTranslation } from 'react-i18next'

import type { MatchSetState, TeamScore } from '@/core/match'

import styles from './SetsCard.module.css'

export interface SetsCardProps {
  sets: MatchSetState[]
  currentSetIndex: number | null
  setsWon: TeamScore<number>
}

/**
 * SetsCard component - Displays completed and in-progress set scores.
 * Follows Pencil design node ID: pGBiU
 * Container: 180px width, corner radius 20px
 */
export function SetsCard({ sets, currentSetIndex, setsWon: _setsWon }: SetsCardProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.container} data-testid="sets-card">
      <span className={styles.label}>{t('match.sets.label')}</span>
      <div className={styles.setsGrid}>
        {sets.map((set, index) => {
          const isCompleted = set.completed
          const isCurrent = index === currentSetIndex

          return (
            <div key={set.index} className={styles.setRow} data-testid={`set-row-${index}`}>
              <span className={styles.setNumber} aria-current={isCurrent ? 'true' : undefined}>
                {index + 1}
              </span>
              <span className={styles.setScore}>
                <span className={styles.team1Games}>{set.games['team-1']}</span>
                <span className={styles.divider}>-</span>
                <span className={styles.team2Games}>{set.games['team-2']}</span>
              </span>
              {isCompleted && set.winner && (
                <span className={styles.winnerIndicator} aria-label={t('match.sets.winner')}>
                  ✓
                </span>
              )}
              {isCurrent && !isCompleted && (
                <span className={styles.currentIndicator} aria-label={t('match.sets.current')}>
                  ●
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
