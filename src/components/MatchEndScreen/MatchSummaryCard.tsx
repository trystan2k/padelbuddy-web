import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/Card/Card'
import type { TeamScore } from '@/core/match/types'
import { cn } from '@/lib/utils/cn'

import type { MatchEndScreenSetRow } from './view-model'
import styles from './MatchSummaryCard.module.css'

export interface MatchSummaryCardProps {
  formatLabel: string
  teamNames: TeamScore<string>
  setRows: MatchEndScreenSetRow[]
}

export function MatchSummaryCard({ formatLabel, teamNames, setRows }: MatchSummaryCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles.card} data-testid="match-end-summary-card">
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('match.end.summary.title')}</h2>
          <span className={styles.formatChip}>{formatLabel}</span>
        </div>

        <div className={styles.teamHeader} aria-hidden="true">
          <span />
          <span className={cn(styles.teamName, styles.teamPrimary)}>{teamNames['team-1']}</span>
          <span />
          <span className={cn(styles.teamName, styles.teamSecondary)}>{teamNames['team-2']}</span>
        </div>

        <ol className={styles.setRows}>
          {setRows.map((setRow) => (
            <li
              className={styles.setRow}
              data-testid={`match-end-set-row-${setRow.setNumber}`}
              key={setRow.setNumber}
            >
              <span className={styles.srOnly}>
                {t('match.end.summary.setScoreRow', {
                  setNumber: setRow.setNumber,
                  teamOneName: teamNames['team-1'],
                  teamOneScore: setRow.scores['team-1'],
                  teamTwoName: teamNames['team-2'],
                  teamTwoScore: setRow.scores['team-2']
                })}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  styles.setLabel,
                  setRow.isSuperTiebreak && styles.setLabelSuperTiebreak
                )}
              >
                {t('match.end.summary.setLabel', { number: setRow.setNumber })}
                {setRow.isSuperTiebreak && (
                  <span className={styles.superTiebreakBadge}>
                    {t('match.sets.superTiebreakBadge')}
                  </span>
                )}
              </span>
              <span aria-hidden="true" className={cn(styles.setScore, styles.teamPrimary)}>
                {setRow.scores['team-1']}
              </span>
              <span aria-hidden="true" className={styles.setSeparator}>
                -
              </span>
              <span aria-hidden="true" className={cn(styles.setScore, styles.teamSecondary)}>
                {setRow.scores['team-2']}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
