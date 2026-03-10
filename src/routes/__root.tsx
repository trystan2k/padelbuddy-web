import '@/styles.css'

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'

import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'

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
        content:
          'Client-only TanStack Start foundation for the Padel Buddy score tracker.'
      }
    ]
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage
})

function RootDocument() {
  return (
    <html lang='en'>
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
