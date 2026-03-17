import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils/cn'

import type { MatchTeamId } from '@/core/match'

import styles from './RevertButton.module.css'

export interface RevertButtonProps {
  teamId: MatchTeamId
  onClick: () => void
  disabled: boolean
}

/**
 * RevertButton component - Button to undo the last scoring action.
 * Follows Pencil design node IDs: owlFX (team1), veV4T (team2)
 */
export function RevertButton({ teamId, onClick, disabled }: RevertButtonProps) {
  const { t } = useTranslation()

  const isTeam1 = teamId === 'team-1'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.container, isTeam1 ? styles.team1 : styles.team2)}
      aria-label={t('match.actions.revertPoint')}
      data-testid={`revert-button-${teamId}`}
    >
      {t('match.actions.revertPoint')}
    </button>
  )
}
