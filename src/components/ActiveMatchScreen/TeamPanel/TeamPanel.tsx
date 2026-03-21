import { useId, type ComponentPropsWithoutRef } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils/cn'

import type { MatchTeamId } from '@/core/match'

import styles from './TeamPanel.module.css'

export interface TeamPanelProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onClick'> {
  teamId: MatchTeamId
  teamName: string
  score: string
  games: number
  isServing: boolean
  isGoldenPointActive: boolean
  onClick: () => void
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
  disabled = false,
  className,
  ...props
}: TeamPanelProps) {
  const { t } = useTranslation()
  const servingStatusId = useId()

  const isTeam1 = teamId === 'team-1'
  const panelClass = isTeam1 ? styles.team1Panel : styles.team2Panel

  return (
    <button
      {...props}
      type="button"
      className={cn(styles.panel, panelClass, className)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={t('match.scorePointFor', { teamName })}
      {...(isServing ? { 'aria-describedby': servingStatusId } : {})}
      data-testid={`team-panel-${teamId}`}
    >
      <div className={styles.teamNameSection}>
        {/* Team name */}
        <span className={styles.teamName}>{teamName}</span>
      </div>

      <div className={styles.scoreStack}>
        {/* Score display */}
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

      <div className={styles.bottomSection}>
        {isGoldenPointActive && (
          <span className={styles.goldenPointIndicator} aria-label={t('match.info.goldenPointOn')}>
            {t('match.info.goldenPoint')}
          </span>
        )}
        {/* Games label */}
        <span className={styles.gamesLabel}>
          {t('match.score.games')} {games}
        </span>
      </div>
    </button>
  )
}
