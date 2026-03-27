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

import { DebugPwa } from '@/components/DebugPwa'
import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'
import { Button, Spinner, ToastProvider } from '@/components/ui'
import { i18n, initializeI18n } from '@/lib/i18n'
import { registerSW } from '@/lib/pwa'

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
      },
      {
        name: 'theme-color',
        content: '#2F7CF6'
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes'
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default'
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Padel Buddy'
      }
    ],
    links: [
      {
        rel: 'manifest',
        href: '/manifest.json'
      },
      {
        rel: 'apple-touch-icon',
        href: '/icon.png'
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

function AppShell() {
  const [currentLang, setCurrentLang] = useState(
    () => i18n.resolvedLanguage ?? i18n.language ?? 'en'
  )

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng || 'en')
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      void registerSW()
    }
  }, [])

  return (
    <html lang={currentLang}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider>
          <div className={styles.routeShell}>
            <RoutePendingOverlay />
            <div className={styles.routeViewport} data-view-transition-root="true">
              <Outlet />
            </div>
          </div>
        </ToastProvider>
        <Scripts />
        {import.meta.env.DEV && <DebugPwa />}
      </body>
    </html>
  )
}

export function RoutePendingOverlay() {
  const { t } = useTranslation()
  const isRoutePending = useRouterState({
    select: (state) =>
      Boolean(state.resolvedLocation) && state.matches.some((match) => match.status === 'pending'),
    structuralSharing: true
  })

  if (!isRoutePending) {
    return null
  }

  return (
    <div className={styles.routePendingOverlay} role="status" aria-live="polite" aria-atomic="true">
      <Spinner
        className={styles.routePendingSpinner}
        size="sm"
        color="secondary"
        silent={true}
        aria-hidden="true"
      />
      <div className={styles.routePendingCopy}>
        <p className={styles.routePendingTitle}>{t('loadingState.routeTransition')}</p>
        <p className={styles.routePendingBody}>{t('loadingState.routeBody')}</p>
      </div>
    </div>
  )
}

function RootDocument() {
  useEffect(() => {
    void initializeI18n().catch((error) => {
      console.error('Failed to initialize i18n:', error)
    })
  }, [])

  return <AppShell />
}
