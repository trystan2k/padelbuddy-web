import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Dialog } from '@base-ui/react/dialog'

import { Button } from '@/components/ui/Button/Button'
import { clearCurrentMatch, type CurrentMatchPersistence } from '@/lib/current-match/indexed-db'
import type { CurrentMatchStartupResult } from '@/lib/current-match/startup'
import {
  invalidateCurrentMatchPersistenceRoutes,
  prepareCurrentMatchRouteNavigation
} from '@/lib/router/current-match-route-flow'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import styles from './CurrentMatchStartupGate.module.css'

export interface CurrentMatchStartupGateProps extends HTMLAttributes<HTMLElement> {
  startupState: CurrentMatchStartupResult
  persistence?: CurrentMatchPersistence
  portalContainer?: HTMLElement | null
}

export interface CurrentMatchStartupGateResolvedProps extends HTMLAttributes<HTMLElement> {
  initialState: CurrentMatchStartupResult
  persistence?: CurrentMatchPersistence
  portalContainer?: HTMLElement | null
}

export function dismissCurrentMatchStartupNotice(
  currentState: CurrentMatchStartupResult
): CurrentMatchStartupResult {
  return {
    ...currentState,
    notice: null
  }
}

export function resumeCurrentMatchStartup(
  currentState: CurrentMatchStartupResult
): CurrentMatchStartupResult {
  if (currentState.status !== 'resume-required') {
    return currentState
  }

  return {
    status: 'ready',
    notice: currentState.notice,
    match: currentState.match
  }
}

export function clearCurrentMatchStartup(
  currentState: CurrentMatchStartupResult
): Extract<CurrentMatchStartupResult, { status: 'no-match' }> {
  return {
    status: 'no-match',
    notice: currentState.notice
  }
}

export function CurrentMatchStartupGateResolved({
  initialState,
  ...props
}: CurrentMatchStartupGateResolvedProps) {
  return <CurrentMatchStartupGate startupState={initialState} {...props} />
}

export function CurrentMatchStartupGate({
  children,
  startupState: initialStartupState,
  persistence,
  portalContainer,
  ...props
}: CurrentMatchStartupGateProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const router = useRouter()
  const [startupState, setStartupState] = useState(initialStartupState)
  const [isClearing, setIsClearing] = useState(false)
  const [clearErrorMessage, setClearErrorMessage] = useState<string | null>(null)
  const pendingResumeMatchIdRef = useRef<string | null>(null)

  useEffect(() => {
    setStartupState(initialStartupState)
    setIsClearing(false)
    setClearErrorMessage(null)
  }, [initialStartupState])

  useEffect(() => {
    const matchId = pendingResumeMatchIdRef.current

    if (matchId === null) {
      return
    }

    pendingResumeMatchIdRef.current = null

    void (async () => {
      try {
        await prepareCurrentMatchRouteNavigation(router, {
          to: '/match/$id',
          params: { id: matchId }
        })
      } finally {
        await navigate({
          to: '/match/$id',
          params: { id: matchId },
          ...getViewTransitionNavigationOptions()
        })
      }
    })()
  }, [navigate, router, startupState])

  const dismissNotice = useCallback(() => {
    setStartupState((currentState) => dismissCurrentMatchStartupNotice(currentState))
  }, [])

  const clearSavedMatch = useCallback(async () => {
    setIsClearing(true)
    setClearErrorMessage(null)

    try {
      await (persistence?.clearCurrentMatch() ?? clearCurrentMatch())
      await invalidateCurrentMatchPersistenceRoutes(router)
      setStartupState((currentState) => clearCurrentMatchStartup(currentState))
    } catch (error) {
      setClearErrorMessage(
        error instanceof Error ? error.message : t('startupGate.errors.clearSavedMatch')
      )
    } finally {
      setIsClearing(false)
    }
  }, [persistence, router, t])

  const resumeSavedMatch = useCallback(() => {
    setClearErrorMessage(null)
    setStartupState((currentState) => {
      if (currentState.status === 'resume-required') {
        pendingResumeMatchIdRef.current = currentState.match.matchId
      }

      return resumeCurrentMatchStartup(currentState)
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
