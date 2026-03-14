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
    void initializeI18n().then(() => {
      setI18nReady(true)
      setCurrentLang(i18n.language || 'en')
      return undefined
    })
  }, [])

  if (!i18nReady) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
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
