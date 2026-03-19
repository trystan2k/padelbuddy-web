import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils/cn'

import type { MatchTeamId } from '@/core/match'

import styles from './TeamPanel.module.css'

export interface TeamPanelProps {
  teamId: MatchTeamId
  teamName: string
  score: string
  games: number
  isServing: boolean
  isGoldenPointActive: boolean
  onClick: () => void
  disabled?: boolean
}

/**
 * TeamPanel component - Displays team score, name, serve indicator, and games count.
 * Click on the panel scores a point for that team.
 * Follows Pencil design node IDs: ilG6v (team1), Lwif8 (team2)
 */
export function TeamPanel({
  teamId,
  teamName,
  score,
  games,
  isServing,
  isGoldenPointActive,
  onClick,
  disabled = false
}: TeamPanelProps) {
  const { t } = useTranslation()
  const servingStatusId = useId()

  const isTeam1 = teamId === 'team-1'
  const panelClass = isTeam1 ? styles.team1Panel : styles.team2Panel

  return (
    <button
      type="button"
      className={cn(styles.panel, panelClass)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={t('match.scorePointFor', { teamName })}
      {...(isServing ? { 'aria-describedby': servingStatusId } : {})}
      data-testid={`team-panel-${teamId}`}
    >
      {/* Team name */}
      <div className={styles.teamNameSection}>
        <span className={cn(styles.teamName, isTeam1 ? styles.team1Text : styles.team2Text)}>
          {teamName}
        </span>
      </div>

      {/* Score display */}
      <div className={styles.scoreStack}>
        <span className={styles.score} aria-live="polite">
          {score}
        </span>
        {isServing && (
          <>
            <div
              className={styles.serveBar}
              aria-hidden="true"
              data-testid={`serve-indicator-${teamId}`}
            />
            <span
              id={servingStatusId}
              className={styles.srOnly}
              data-testid={`serve-status-${teamId}`}
            >
              {t('match.serving')}
            </span>
          </>
        )}
      </div>

      {/* Games label */}
      <div className={styles.bottomSection}>
        {isGoldenPointActive && (
          <span className={styles.goldenPointIndicator} aria-label={t('match.info.goldenPointOn')}>
            {t('match.info.goldenPoint')}
          </span>
        )}
        <span className={styles.gamesLabel}>
          {t('match.score.games')} {games}
        </span>
      </div>
    </button>
  )
}
