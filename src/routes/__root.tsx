import '@/styles.css'

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
  type ErrorComponentProps
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'
import { Button, Spinner } from '@/components/ui'
import { i18n, initializeI18n } from '@/lib/i18n'

import { getErrorMessage } from './-route-utils'
import styles from './RootDocument.module.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Padel Buddy'
      },
      {
        name: 'description',
        content: 'Client-only TanStack Start foundation for the Padel Buddy score tracker.'
      }
    ]
  }),
  component: RootDocument,
  errorComponent: RootErrorState,
  notFoundComponent: NotFoundPage
})

function RootErrorState({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const errorMessage = getErrorMessage(error)

  return (
    <html lang={i18n.resolvedLanguage ?? i18n.language ?? 'en'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <main className="appStatusPage">
          <section className="appStatusCard" aria-live="assertive">
            <p className="appStatusEyebrow">{t('error.unexpectedLabel')}</p>
            <h1 className="appStatusTitle">{t('error.unexpectedTitle')}</h1>
            <p className="appStatusBody">{t('error.unexpectedBody')}</p>
            {errorMessage ? (
              <p className="appStatusDetail" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <div className="appStatusActions">
              <Button variant="outline" size="sm" accent="secondary" onClick={reset}>
                {t('common.retry')}
              </Button>
            </div>
          </section>
        </main>
        <Scripts />
      </body>
    </html>
  )
}

function RootDocument() {
  const [i18nReady, setI18nReady] = useState(() => i18n.isInitialized)
  const [currentLang, setCurrentLang] = useState(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'en'
  )
  const { t } = useTranslation()
  const isRoutePending = useRouterState({
    select: (state) => state.isLoading || state.matches.some((match) => match.status === 'pending')
  })

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.body.dataset.routePending = isRoutePending ? 'true' : 'false'

    return () => {
      delete document.body.dataset.routePending
    }
  }, [isRoutePending])

  useEffect(() => {
    // If already initialized, no need to initialize again
    if (i18n.isInitialized) {
      return
    }

    let cancelled = false

    void initializeI18n()
      .then(() => {
        if (cancelled) return undefined
        setI18nReady(true)
        setCurrentLang(i18n.language || 'en')
        return undefined
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to initialize i18n:', error)
        setI18nReady(true)
        setCurrentLang('en')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng || 'en')
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  if (!i18nReady) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <main className="appStatusPage">
            <section className="appStatusCard" aria-live="polite" aria-busy="true">
              <Spinner
                className="appStatusSpinner"
                size="lg"
                label={t('loadingState.appInitLabel', { defaultValue: 'Loading Padel Buddy' })}
                silent
              />
              <p className="appStatusEyebrow">
                {t('loadingState.appInitEyebrow', { defaultValue: 'Starting app' })}
              </p>
              <h1 className="appStatusTitle">
                {t('loadingState.appInitTitle', { defaultValue: 'Preparing Padel Buddy' })}
              </h1>
              <p className="appStatusBody">
                {t('loadingState.appInitBody', {
                  defaultValue: 'Loading translations and preparing the score tracker shell.'
                })}
              </p>
            </section>
          </main>
          <Scripts />
        </body>
      </html>
    )
  }

  return (
    <html lang={currentLang}>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className={styles.routeShell}>
          <div
            className={
              isRoutePending
                ? `${styles.routeViewport} ${styles.routeViewportPending}`
                : styles.routeViewport
            }
            data-view-transition-root="true"
          >
            <Outlet />
          </div>
          {isRoutePending ? (
            <div className={styles.routePendingOverlay} role="status" aria-live="polite">
              <div className={styles.routePendingNotice}>
                <Spinner
                  size="sm"
                  color="secondary"
                  label={t('loadingState.routeTransition')}
                  silent
                />
                <p className={styles.routePendingLabel}>{t('loadingState.routeTransition')}</p>
              </div>
            </div>
          ) : null}
        </div>
        <Scripts />
      </body>
    </html>
  )
}
