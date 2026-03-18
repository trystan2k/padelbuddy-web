import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'

import styles from './SideSwitchPrompt.module.css'

export interface SideSwitchPromptProps {
  isOpen: boolean
  reason: 'odd-games' | 'tiebreak-interval' | null
  onConfirm: () => void
}

/**
 * SideSwitchPrompt component - Modal that prompts players to switch sides.
 * Uses a plain dialog implementation with ARIA attributes for accessibility.
 * TODO: Consider migrating to Base UI Dialog for enhanced focus trap and keyboard handling.
 */
export function SideSwitchPrompt({ isOpen, reason, onConfirm }: SideSwitchPromptProps) {
  const { t } = useTranslation()

  if (!isOpen || !reason) {
    return null
  }

  const title =
    reason === 'odd-games' ? t('match.sideSwitch.oddGames') : t('match.sideSwitch.tiebreakInterval')

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-switch-title"
      data-testid="side-switch-prompt"
    >
      <div className={styles.container}>
        <h2 id="side-switch-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.description}>{t('match.sideSwitch.description')}</p>
        <Button variant="solid" size="sm" accent="success" onClick={onConfirm}>
          {t('match.sideSwitch.confirm')}
        </Button>
      </div>
    </div>
  )
}
