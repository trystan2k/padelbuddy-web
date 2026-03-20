import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import {
  clearCurrentMatch,
  hydrateCurrentMatchStartup,
  type CurrentMatchPersistence,
  type CurrentMatchStartupResult
} from '@/lib/current-match'

import styles from './CurrentMatchStartupGate.module.css'

interface CurrentMatchStartupGateProps extends HTMLAttributes<HTMLElement> {
  persistence?: CurrentMatchPersistence
}

export type CurrentMatchStartupViewState = { status: 'loading' } | CurrentMatchStartupResult

export function dismissCurrentMatchStartupNotice(
  currentState: CurrentMatchStartupViewState
): CurrentMatchStartupViewState {
  if (currentState.status === 'loading') {
    return currentState
  }

  return {
    ...currentState,
    notice: null
  }
}

export function resumeCurrentMatchStartup(
  currentState: CurrentMatchStartupViewState
): CurrentMatchStartupViewState {
  if (currentState.status !== 'resume-required') {
    return currentState
  }

  return {
    status: 'ready',
    notice: currentState.notice,
    session: currentState.session
  }
}

export function clearCurrentMatchStartup(
  currentState: CurrentMatchStartupViewState
): Extract<CurrentMatchStartupResult, { status: 'ready' }> {
  return {
    status: 'ready',
    notice: currentState.status === 'loading' ? null : currentState.notice,
    session: null
  }
}

export function CurrentMatchStartupGate({
  children,
  persistence,
  ...props
}: CurrentMatchStartupGateProps) {
  const { t } = useTranslation()
  const [startupState, setStartupState] = useState<CurrentMatchStartupViewState>({
    status: 'loading'
  })
  const [isClearing, setIsClearing] = useState(false)
  const [clearErrorMessage, setClearErrorMessage] = useState<string | null>(null)
  const resumeButtonRef = useRef<HTMLButtonElement | null>(null)
  const resumeDialogRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const result = await hydrateCurrentMatchStartup(persistence ? { persistence } : {})

      if (!cancelled) {
        setStartupState(result)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [persistence])

  useEffect(() => {
    if (startupState.status === 'resume-required') {
      resumeButtonRef.current?.focus()
    }
  }, [startupState])

  useEffect(() => {
    if (startupState.status !== 'resume-required') {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      const dialog = resumeDialogRef.current

      if (!dialog) {
        return
      }

      const focusableElements = getDialogFocusableElements(dialog)

      if (focusableElements.length === 0) {
        event.preventDefault()

        return
      }

      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      const currentIndex = activeElement ? focusableElements.indexOf(activeElement) : -1

      event.preventDefault()

      if (event.shiftKey) {
        const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1

        focusableElements[previousIndex]?.focus()

        return
      }

      const nextIndex =
        currentIndex === -1 || currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1

      focusableElements[nextIndex]?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [startupState.status])

  const dismissNotice = useCallback(() => {
    setStartupState((currentState) => dismissCurrentMatchStartupNotice(currentState))
  }, [])

  const clearSavedMatch = useCallback(async () => {
    setIsClearing(true)
    setClearErrorMessage(null)

    try {
      await (persistence?.clearCurrentMatch() ?? clearCurrentMatch())
      setStartupState((currentState) => clearCurrentMatchStartup(currentState))
    } catch (error) {
      setClearErrorMessage(
        error instanceof Error ? error.message : 'Unable to clear the saved match right now.'
      )
    } finally {
      setIsClearing(false)
    }
  }, [persistence])

  const resumeSavedMatch = useCallback(() => {
    setClearErrorMessage(null)
    setStartupState((currentState) => resumeCurrentMatchStartup(currentState))
  }, [])

  const handleClearSavedMatch = useCallback(() => {
    void clearSavedMatch()
  }, [clearSavedMatch])

  if (startupState.status === 'loading') {
    return (
      <main className={styles.loadingPage} {...props}>
        <section className={styles.loadingCard} aria-live="polite">
          <p className={styles.eyebrow}>{t('startupGate.loading.eyebrow')}</p>
          <h1 className={styles.title}>{t('startupGate.loading.title')}</h1>
          <p className={styles.body}>{t('startupGate.loading.body')}</p>
        </section>
      </main>
    )
  }

  if (startupState.status === 'corrupt') {
    return (
      <main className={styles.loadingPage} {...props}>
        <section className={styles.recoveryCard} aria-live="assertive">
          <p className={styles.eyebrow}>{t('startupGate.corrupt.eyebrow')}</p>
          <h1 className={styles.title}>{t('startupGate.corrupt.title')}</h1>
          <p className={styles.body}>{t('startupGate.corrupt.body')}</p>
          <p className={styles.detail}>{startupState.message}</p>
          {clearErrorMessage ? (
            <p className={styles.detail} role="alert">
              {clearErrorMessage}
            </p>
          ) : null}
          <Button
            variant="solid"
            size="sm"
            accent="secondary"
            disabled={isClearing}
            onClick={handleClearSavedMatch}
          >
            {t('startupGate.corrupt.resetButton')}
          </Button>
        </section>
      </main>
    )
  }

  return (
    <>
      {startupState.notice ? (
        <aside className={styles.notice} role="status">
          <div className={styles.noticeCopy}>
            <p className={styles.noticeTitle}>{t('startupGate.notice.title')}</p>
            <p className={styles.noticeText}>{t('startupGate.notice.body')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={dismissNotice}>
            {t('startupGate.notice.dismiss')}
          </Button>
        </aside>
      ) : null}

      {children}

      {startupState.status === 'resume-required' ? (
        <div className={styles.promptBackdrop}>
          <section
            aria-describedby="resume-match-description"
            aria-labelledby="resume-match-heading"
            aria-modal="true"
            className={styles.promptCard}
            ref={resumeDialogRef}
            role="dialog"
          >
            <p className={styles.eyebrow}>{t('startupGate.resume.eyebrow')}</p>
            <h2 className={styles.promptTitle} id="resume-match-heading">
              {t('startupGate.resume.title')}
            </h2>
            <p className={styles.body} id="resume-match-description">
              {t('startupGate.resume.body')}
            </p>
            {clearErrorMessage ? (
              <p className={styles.detail} role="alert">
                {clearErrorMessage}
              </p>
            ) : null}
            <div className={styles.promptActions}>
              <Button
                variant="solid"
                size="sm"
                accent="secondary"
                disabled={isClearing}
                onClick={resumeSavedMatch}
                ref={resumeButtonRef}
              >
                {t('startupGate.resume.resumeButton')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isClearing}
                onClick={handleClearSavedMatch}
              >
                {t('startupGate.resume.discardButton')}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

function getDialogFocusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}
