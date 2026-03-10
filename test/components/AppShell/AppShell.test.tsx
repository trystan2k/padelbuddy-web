import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { AppShell } from '@/components/AppShell/AppShell'

describe('AppShell', () => {
  test('renders the foundation shell smoke content', () => {
    const markup = renderToStaticMarkup(<AppShell />)

    expect(markup).toContain('Padel Buddy')
    expect(markup).toContain('App foundation')
    expect(markup).toContain('Open Base UI check')
    expect(markup).toContain('Bootstrap status')
    expect(markup).toContain('Client-only')
  })
})
