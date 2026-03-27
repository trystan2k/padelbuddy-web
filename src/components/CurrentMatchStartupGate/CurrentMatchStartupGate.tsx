import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Dialog } from '@base-ui/react/dialog'

import { Button } from '@/components/ui'
import {
  clearCurrentMatch,
  hydrateCurrentMatchStartup,
  type CurrentMatchPersistence,
  type CurrentMatchStartupResult
} from '@/lib/current-match'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import styles from './CurrentMatchStartupGate.module.css'

interface CurrentMatchStartupGateProps extends HTMLAttributes<HTMLElement> {
  persistence?: CurrentMatchPersistence
  portalContainer?: HTMLElement | null
}

export type CurrentMatchStartupViewState = { status: 'loading' } | CurrentMatchStartupResult

export interface CurrentMatchStartupGateResolvedProps extends HTMLAttributes<HTMLElement> {
  initialState: CurrentMatchStartupResult
  persistence?: CurrentMatchPersistence
  portalContainer?: HTMLElement | null
}

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

function dismissResolvedStartupNotice(
  currentState: CurrentMatchStartupResult
): CurrentMatchStartupResult {
  if (currentState.status === 'resume-required') {
    return {
      ...currentState,
      notice: null
    }
  }

  if (currentState.status === 'ready') {
    return {
      ...currentState,
      notice: null
    }
  }

  return currentState
}

function resumeResolvedStartupState(
  currentState: CurrentMatchStartupResult
): CurrentMatchStartupResult {
  if (currentState.status === 'resume-required') {
    return {
      status: 'ready',
      notice: currentState.notice,
      session: currentState.session
    }
  }

  return currentState
}

export function CurrentMatchStartupGateResolved({
  children,
  initialState,
  persistence,
  portalContainer,
  ...props
}: CurrentMatchStartupGateResolvedProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [startupState, setStartupState] = useState<CurrentMatchStartupResult>(initialState)
  const [isClearing, setIsClearing] = useState(false)
  const [clearErrorMessage, setClearErrorMessage] = useState<string | null>(null)
  const pendingResumeMatchIdRef = useRef<string | null>(null)

  useEffect(() => {
    setStartupState(initialState)
    setIsClearing(false)
    setClearErrorMessage(null)
  }, [initialState])

  useEffect(() => {
    const matchId = pendingResumeMatchIdRef.current

    if (matchId === null) {
      return
    }

    pendingResumeMatchIdRef.current = null

    void navigate({
      to: '/match/$id',
      params: { id: matchId },
      ...getViewTransitionNavigationOptions()
    })
  }, [navigate, startupState])

  const dismissNotice = useCallback(() => {
    setStartupState((currentState) => dismissResolvedStartupNotice(currentState))
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
    setStartupState((currentState) => {
      if (currentState.status === 'resume-required') {
        pendingResumeMatchIdRef.current = currentState.matchId
      }

      return resumeResolvedStartupState(currentState)
    })
  }, [])

  const handleClearSavedMatch = useCallback(() => {
    void clearSavedMatch()
  }, [clearSavedMatch])

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClearSavedMatch()
      }
    },
    [handleClearSavedMatch]
  )

  const renderBackdrop = useCallback(
    (backdropProps: HTMLAttributes<HTMLElement>) => (
      <div {...backdropProps} className={styles.promptBackdrop} />
    ),
    []
  )

  const renderTitle = useCallback(
    (titleProps: HTMLAttributes<HTMLElement>) => (
      <h2 {...titleProps} id="resume-match-heading" className={styles.promptTitle}>
        {t('startupGate.resume.title')}
      </h2>
    ),
    [t]
  )

  const renderDescription = useCallback(
    (descProps: HTMLAttributes<HTMLElement>) => (
      <p {...descProps} id="resume-match-description" className={styles.body}>
        {t('startupGate.resume.body')}
      </p>
    ),
    [t]
  )

  const renderPopup = useCallback(
    (popupProps: HTMLAttributes<HTMLElement>) => (
      <div
        {...popupProps}
        role="dialog"
        aria-describedby="resume-match-description"
        aria-labelledby="resume-match-heading"
        aria-modal="true"
        className={styles.promptCard}
      >
        <p className={styles.eyebrow}>{t('startupGate.resume.eyebrow')}</p>
        <Dialog.Title render={renderTitle} />
        <Dialog.Description render={renderDescription} />
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
          >
            {t('startupGate.resume.resumeButton')}
          </Button>
          <Button variant="outline" size="sm" disabled={isClearing} onClick={handleClearSavedMatch}>
            {t('startupGate.resume.discardButton')}
          </Button>
        </div>
      </div>
    ),
    [
      clearErrorMessage,
      isClearing,
      resumeSavedMatch,
      handleClearSavedMatch,
      t,
      renderTitle,
      renderDescription
    ]
  )

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

      {startupState.status === 'resume-required' && (
        <Dialog.Root open={true} onOpenChange={handleDialogOpenChange}>
          <Dialog.Portal container={portalContainer}>
            <Dialog.Backdrop render={renderBackdrop} />

            <Dialog.Popup render={renderPopup} />
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  )
}

export function CurrentMatchStartupGate({
  children,
  persistence,
  portalContainer,
  ...props
}: CurrentMatchStartupGateProps) {
  const [startupState, setStartupState] = useState<CurrentMatchStartupViewState>({
    status: 'loading'
  })

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

  if (startupState.status === 'loading') {
    const { t } = useTranslation()

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

  return (
    <CurrentMatchStartupGateResolved
      initialState={startupState}
      {...(persistence ? { persistence } : {})}
      {...(typeof portalContainer !== 'undefined' ? { portalContainer } : {})}
      {...props}
    >
      {children}
    </CurrentMatchStartupGateResolved>
  )
}
