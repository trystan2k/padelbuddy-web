import '@/styles.css'

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
  type ErrorComponentProps
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import mixpanel from 'mixpanel-browser'

import { DebugPwa } from '@/components/DebugPwa/DebugPwa'
import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'
import { ToastProvider } from '@/components/ui/Toast/useToast'
import { i18n, initializeI18n } from '@/lib/i18n/i18n'
import { registerSW } from '@/lib/pwa/registration'
import { getOrCreateUserId } from '@/lib/user/id'

import { RouteErrorCard } from './-route-utils'
import styles from './RootDocument.module.css'
import { PadelCourtSpinner } from '@/components/PadelCourtSpinner/PadelCourtSpinner'

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
        title: i18n.t('app.title')
      },
      {
        name: 'description',
        content: i18n.t('app.description')
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
        content: i18n.t('app.title')
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

function RootErrorState(props: ErrorComponentProps) {
  return (
    <html lang={i18n.resolvedLanguage ?? i18n.language ?? 'en'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <main className="appStatusPage">
          <RouteErrorCard {...props} eyebrowKey="error.unexpectedLabel" />
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

  const routePendingRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    // Use remove() instead of document.body.removeChild() because during SSR
    // hydration the spinner may not be a direct child of document.body.
    routePendingRef.current?.remove()
  }, [routePendingRef])

  return (
    <html lang={currentLang}>
      <head>
        <HeadContent />
      </head>
      <body>
        <PadelCourtSpinner
          ref={routePendingRef}
          className={styles.routePendingSpinner}
          silent={true}
          aria-hidden="true"
        />
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
  const isRoutePending = useRouterState({
    select: (state) =>
      Boolean(state.resolvedLocation) && state.matches.some((match) => match.status === 'pending'),
    structuralSharing: true
  })

  if (!isRoutePending) {
    return null
  }

  return (
    <PadelCourtSpinner className={styles.routePendingSpinner} silent={true} aria-hidden="true" />
  )
}

function RootDocument() {
  useEffect(() => {
    if (import.meta.env.PROD) {
      mixpanel.init('21d2e2fd8e6c4eeca02abb794fb90c7a', {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: 'https://api-eu.mixpanel.com'
      })

      const userId = getOrCreateUserId()
      mixpanel.identify(userId)
    }

    void initializeI18n().catch((error) => {
      console.error('Failed to initialize i18n:', error)
    })
  }, [])

  return <AppShell />
}
