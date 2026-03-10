import type { ReactNode } from 'react'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    className,
    to
  }: {
    children: ReactNode
    className?: string
    to: string
  }) => (
    <a className={className} href={to}>
      {children}
    </a>
  )
}))

import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'

describe('NotFoundPage', () => {
  test('renders the not-found guidance', () => {
    const markup = renderToStaticMarkup(<NotFoundPage />)

    expect(markup).toContain('Page not found')
    expect(markup).toContain('We could not find that route.')
    expect(markup).toContain('The app foundation is running')
    expect(markup).toContain('Go back to the home screen')
    expect(markup).toContain('href="/"')
  })
})
