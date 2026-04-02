import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './RotateDeviceBlocker.module.css'

export function RotateDeviceBlocker() {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // NOTE: document.activeElement may already be document.body here because the
    // parent Layout's inert attribute is applied synchronously before this effect runs.
    // Full focus restoration would require the parent to capture focus before re-render.
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    cardRef.current?.focus()
    return () => {
      previouslyFocused?.focus()
    }
  }, [])

  return (
    <div className={styles.overlay} data-testid="rotate-device-blocker">
      <div
        ref={cardRef}
        className={styles.card}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            className={styles.icon}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <path
              d="M23 10C23 7.79086 24.7909 6 27 6H45C47.2091 6 49 7.79086 49 10V38C49 40.2091 47.2091 42 45 42H27C24.7909 42 23 40.2091 23 38V10Z"
              className={styles.phone}
            />
            <rect x="28" y="11" width="16" height="25" rx="2" className={styles.screen} />
            <circle cx="36" cy="39" r="1.75" className={styles.button} />
            <path
              d="M17.856 44.144C13.9525 40.2404 12 35.1275 12 30.0146C12 24.9017 13.9525 19.7888 17.856 15.8853L20.6844 18.7137C17.5317 21.8664 15.9553 25.9405 15.9553 30.0146C15.9553 34.0887 17.5317 38.1629 20.6844 41.3156L24 38V50H12L17.856 44.144Z"
              className={styles.arrow}
            />
          </svg>
        </div>

        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            {t('match.rotateDevice.title')}
          </h2>
          <p id={descriptionId} className={styles.description}>
            {t('match.rotateDevice.description')}
          </p>
        </div>
      </div>
    </div>
  )
}
