import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import {
  clearCurrentMatch,
  hydrateCurrentMatchStartup,
  type CurrentMatchPersistence,
  type CurrentMatchStartupResult
} from '@/lib/current-match'

import styles from './CurrentMatchStartupGate.module.css'

interface CurrentMatchStartupGateProps {
  children: ReactNode
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

export function CurrentMatchStartupGate({ children, persistence }: CurrentMatchStartupGateProps) {
  const [startupState, setStartupState] = useState<CurrentMatchStartupViewState>({
    status: 'loading'
  })
  const [isClearing, setIsClearing] = useState(false)
  const resumeButtonRef = useRef<HTMLButtonElement | null>(null)

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

  const dismissNotice = useCallback(() => {
    setStartupState((currentState) => dismissCurrentMatchStartupNotice(currentState))
  }, [])

  const clearSavedMatch = useCallback(async () => {
    setIsClearing(true)

    try {
      await (persistence?.clearCurrentMatch() ?? clearCurrentMatch())
      setStartupState((currentState) => clearCurrentMatchStartup(currentState))
    } finally {
      setIsClearing(false)
    }
  }, [persistence])

  const resumeSavedMatch = useCallback(() => {
    setStartupState((currentState) => resumeCurrentMatchStartup(currentState))
  }, [])

  const handleResetAndContinue = useCallback(() => {
    void clearSavedMatch()
  }, [clearSavedMatch])

  const handleDiscardSavedMatch = useCallback(() => {
    void clearSavedMatch()
  }, [clearSavedMatch])

  if (startupState.status === 'loading') {
    return (
      <main className={styles.loadingPage}>
        <section className={styles.loadingCard} aria-live="polite">
          <p className={styles.eyebrow}>Startup check</p>
          <h1 className={styles.title}>Checking for a saved match</h1>
          <p className={styles.body}>
            Padel Buddy is restoring the current-match workspace before opening the shell.
          </p>
        </section>
      </main>
    )
  }

  if (startupState.status === 'corrupt') {
    return (
      <main className={styles.loadingPage}>
        <section className={styles.recoveryCard} aria-live="assertive">
          <p className={styles.eyebrow}>Startup recovery</p>
          <h1 className={styles.title}>Saved match needs recovery</h1>
          <p className={styles.body}>
            The current-match record could not be restored safely. Reset the saved match to continue
            into the app shell.
          </p>
          <p className={styles.detail}>{startupState.message}</p>
          <button
            className={styles.primaryButton}
            disabled={isClearing}
            onClick={handleResetAndContinue}
            type="button"
          >
            Reset and continue
          </button>
        </section>
      </main>
    )
  }

  return (
    <>
      {startupState.notice ? (
        <aside className={styles.notice} role="status">
          <div className={styles.noticeCopy}>
            <p className={styles.noticeTitle}>Saved match was reset</p>
            <p className={styles.noticeText}>
              An older saved match was cleared because it no longer matches the current app schema.
            </p>
          </div>
          <button className={styles.noticeButton} onClick={dismissNotice} type="button">
            Dismiss
          </button>
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
            role="dialog"
          >
            <p className={styles.eyebrow}>Saved match found</p>
            <h2 className={styles.promptTitle} id="resume-match-heading">
              Resume saved match?
            </h2>
            <p className={styles.body} id="resume-match-description">
              Padel Buddy restored an in-progress current match. Resume keeps the action log and
              restores the live score state through replay.
            </p>
            <div className={styles.promptActions}>
              <button
                className={styles.primaryButton}
                data-emphasis="primary"
                disabled={isClearing}
                onClick={resumeSavedMatch}
                ref={resumeButtonRef}
                type="button"
              >
                Resume saved match
              </button>
              <button
                className={styles.secondaryButton}
                disabled={isClearing}
                onClick={handleDiscardSavedMatch}
                type="button"
              >
                Discard saved match
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
