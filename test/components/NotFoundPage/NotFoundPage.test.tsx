import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

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
