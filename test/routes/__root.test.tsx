import { describe, expect, test, vi } from 'vitest'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    HeadContent: () => <meta content="test-head" name="test-head" />,
    Outlet: () => <div>route outlet</div>,
    Scripts: () => <script type="application/json">scripts</script>,
    createRootRoute: (options: unknown) => ({ options })
  }
})

import { Route } from '@/routes/__root'
import { renderToStaticMarkup } from 'react-dom/server'

describe('root route', () => {
  test('defines document metadata and shell markup', async () => {
    const head = Route.options.head
    const RootDocument = Route.options.component

    if (!head || !RootDocument || !Route.options.notFoundComponent) {
      throw new Error('Expected the root route to expose head, component, and notFoundComponent')
    }

    const headResult = await Reflect.apply(head, undefined, [])
    const markup = renderToStaticMarkup(<RootDocument />)

    expect(headResult.meta).toContainEqual({ charSet: 'utf-8' })
    expect(headResult.meta).toContainEqual({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    })
    expect(headResult.meta).toContainEqual({ title: 'Padel Buddy' })
    expect(markup).toContain('<html lang="en">')
    expect(markup).toContain('route outlet')
    expect(Route.options.notFoundComponent).toBeTypeOf('function')
  })
})
