import '@/styles.css'

import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'
import { i18n, initializeI18n } from '@/lib/i18n'

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
  notFoundComponent: NotFoundPage
})

function RootDocument() {
  const [i18nReady, setI18nReady] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')

  useEffect(() => {
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
          <div
            // oxlint-disable-next-line jsx-no-new-object-as-prop
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            <div
              // oxlint-disable-next-line jsx-no-new-object-as-prop
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
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
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
