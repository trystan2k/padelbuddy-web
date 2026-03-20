import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { MatchTeamId } from '@/core/match'
import { cn } from '@/lib/utils/cn'

import styles from './WinnerCard.module.css'

export interface WinnerCardProps {
  winnerName: string
  winnerTeamId: MatchTeamId
  isStartingNewMatch: boolean
  isContinuingMatch: boolean
  onNewMatch: () => void
  onContinue: () => void
}

export function WinnerCard({
  winnerName,
  winnerTeamId,
  isStartingNewMatch,
  isContinuingMatch,
  onNewMatch,
  onContinue
}: WinnerCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles.card} data-testId="match-end-winner-card">
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.trophyBadge} aria-hidden="true">
            <TrophyIcon />
          </div>
          <p className={styles.label}>{t('match.end.winner.label')}</p>
          <h2
            className={cn(
              styles.winnerName,
              winnerTeamId === 'team-1' ? styles.teamPrimary : styles.teamSecondary
            )}
          >
            {winnerName}
          </h2>
        </div>

        <div className={styles.actionGroup}>
          <Button
            className={cn(styles.actionButton, styles.primaryAction)}
            accent="success"
            disabled={isStartingNewMatch}
            onClick={onNewMatch}
            size="sm"
            data-testId="new-match-button"
          >
            {t('match.end.actions.newMatch')}
          </Button>
          <Button
            className={cn(styles.actionButton, styles.secondaryAction)}
            disabled={isContinuingMatch}
            onClick={onContinue}
            size="sm"
            data-testId="continue-match-button"
            variant="outline"
          >
            {t('match.end.actions.continue')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function TrophyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.trophyIcon}
    >
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  )
}
