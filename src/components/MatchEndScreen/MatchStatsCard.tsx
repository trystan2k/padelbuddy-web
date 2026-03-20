import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

import styles from './MatchStatsCard.module.css'

export interface MatchStatsCardProps {
  durationValue: string
  totalGames: number
}

export function MatchStatsCard({ durationValue, totalGames }: MatchStatsCardProps) {
  const { t } = useTranslation()

  return (
    <section aria-label={t('match.end.aria.statisticsRegion')} className={styles.region}>
      <Card className={styles.card} data-testid="match-end-stats-card">
        <div className={styles.inner}>
          <div className={styles.statBlock}>
            <p className={styles.statLabel}>{t('match.end.stats.matchLength')}</p>
            <p className={styles.statValue} data-testid="match-end-duration">
              {durationValue}
            </p>
          </div>
          <div className={cn(styles.statBlock, styles.statBlockAlignEnd)}>
            <p className={styles.statLabel}>{t('match.end.stats.totalGames')}</p>
            <p className={styles.statValue} data-testid="match-end-total-games">
              {totalGames}
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
