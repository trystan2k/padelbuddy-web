import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@base-ui/react/dialog'

import { Button } from '@/components/ui'

import styles from './SideSwitchPrompt.module.css'

export interface SideSwitchPromptProps {
  isOpen: boolean
  reason: 'odd-games' | 'tiebreak-interval' | null
  onConfirm: () => void
  onDismiss: () => void
  /** Delay in milliseconds before auto-closing. Set to 0 to disable auto-close. */
  autoCloseDelay?: number
}

/**
 * SideSwitchPrompt component - Modal that prompts players to switch sides.
 * Uses Base UI Dialog for accessibility with focus trap and keyboard handling.
 * Auto-closes after a configurable delay (default 10 seconds).
 */
export function SideSwitchPrompt({
  isOpen,
  reason,
  onConfirm,
  onDismiss,
  autoCloseDelay = 10000
}: SideSwitchPromptProps) {
  const { t } = useTranslation()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-close timer
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        onConfirm()
      }, autoCloseDelay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isOpen, autoCloseDelay, onConfirm])

  if (!reason) {
    return null
  }

  const title =
    reason === 'odd-games' ? t('match.sideSwitch.oddGames') : t('match.sideSwitch.tiebreakInterval')

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <Dialog.Portal>
        <Dialog.Backdrop
          render={(props) => (
            <div {...props} data-testid="side-switch-backdrop" className={styles.overlay} />
          )}
        />

        <Dialog.Popup
          render={(props) => (
            <div
              {...props}
              className={styles.container}
              data-testid="side-switch-prompt"
              aria-modal="true"
            >
              <Dialog.Title
                render={(titleProps) => (
                  <h2 {...titleProps} id="side-switch-title" className={styles.title}>
                    {title}
                  </h2>
                )}
              />

              <Dialog.Description
                render={(descProps) => (
                  <p {...descProps} className={styles.description}>
                    {t('match.sideSwitch.description')}
                  </p>
                )}
              />

              <Button variant="solid" size="sm" accent="success" onClick={onConfirm}>
                {t('match.sideSwitch.confirm')}
              </Button>
            </div>
          )}
        />
      </Dialog.Portal>
    </Dialog.Root>
  )
}
