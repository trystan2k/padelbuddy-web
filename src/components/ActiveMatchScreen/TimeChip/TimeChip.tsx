import { useTranslation } from 'react-i18next'

import styles from './TimeChip.module.css'

export interface TimeChipProps {
  formattedTime: string
}

/**
 * TimeChip component - Displays match timer.
 * Follows Pencil design node ID: cOPm9
 * Container: corner radius 20px
 */
export function TimeChip({ formattedTime }: TimeChipProps) {
  const { t } = useTranslation()

  return (
    <div
      className={styles.container}
      data-testid="time-chip"
      role="timer"
      aria-label={t('match.timer.label', { time: formattedTime })}
    >
      {formattedTime}
    </div>
  )
}
