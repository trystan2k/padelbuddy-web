import { useTranslation } from 'react-i18next'

import styles from './FinishButton.module.css'

export interface FinishButtonProps {
  onClick: () => void
  disabled?: boolean
}

/**
 * FinishButton component - Button to finish the match and navigate to end screen.
 * Follows Pencil design node ID: kmXz8
 * Container: fill container height, corner radius 28px
 */
export function FinishButton({ onClick, disabled = false }: FinishButtonProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={styles.container}
      aria-label={t('match.actions.finishMatch')}
      data-testid="finish-button"
    >
      {t('match.actions.finishMatch')}
    </button>
  )
}
