import { useTranslation } from 'react-i18next'

import type { MatchSetState } from '@/core/match'
import { Card } from '@/components/ui/Card'

import styles from './SetsCard.module.css'

export interface SetsCardProps {
  sets: MatchSetState[]
  currentSetIndex: number | null
}

/**
 * SetsCard component - Displays completed and in-progress set scores.
 * Follows Pencil design node ID: pGBiU
 * Container: 180px width, corner radius 20px
 */
export function SetsCard({ sets, currentSetIndex }: SetsCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles.container} data-testid="sets-card">
      <span className={styles.label}>{t('match.sets.label')}</span>
      <div className={styles.setsGrid}>
        {sets.map((set, index) => {
          const isCurrent = index === currentSetIndex
          const setLabel = isCurrent
            ? t('match.sets.currentShort')
            : t('match.sets.setLabel', { number: index + 1 })

          return (
            <div
              key={set.index}
              className={styles.setRow}
              aria-current={isCurrent ? 'true' : undefined}
              data-testid={`set-row-${index}`}
            >
              <span className={styles.setNumber} data-testid={`set-number-${index}`}>
                {setLabel}
              </span>
              <span className={styles.setScore}>
                <span className={styles.team1Games}>{set.games['team-1']}</span>
                <span className={styles.divider}>-</span>
                <span className={styles.team2Games}>{set.games['team-2']}</span>
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
