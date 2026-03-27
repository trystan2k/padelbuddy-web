import '@/styles.css'

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  type ErrorComponentProps
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DebugPwa } from '@/components/DebugPwa'
import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'
import { Button, ToastProvider, TopBar } from '@/components/ui'
import { i18n, initializeI18n } from '@/lib/i18n'
import { registerSW } from '@/lib/pwa'

import { getErrorMessage } from './-route-utils'
import styles from './RootDocument.module.css'
import { PadelCourtSpinner } from '@/components/PadelCourtSpinner'
import { Layout } from '@/components/Layout'

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

const HeaderContent = <TopBar iconSrc="/icon.png" iconAlt="Padel Buddy" title="Padel Buddy" />
const LoaderPadelCourt = () => (
  <Layout header={HeaderContent}>
    <div className={styles.loaderContainer}>
      <PadelCourtSpinner />
    </div>
  </Layout>
)

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

function RootDocument() {
  const [i18nReady, setI18nReady] = useState(() => i18n.isInitialized)

  useEffect(() => {
    if (i18n.isInitialized) {
      return
    }

    let cancelled = false

    void initializeI18n()
      .then(() => {
        if (cancelled) return undefined
        setI18nReady(true)
        return undefined
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to initialize i18n:', error)
        setI18nReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!i18nReady) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <LoaderPadelCourt />
          <Scripts />
        </body>
      </html>
    )
  }

  return <AppShell />
}
