import { describe, expect, test, vi, beforeAll } from 'vitest'

import defaultTranslation from '@/lib/i18n/locales/en'
import { i18n, initializeI18n, resetI18nInitialization } from '@/lib/i18n/i18n'

import { Route } from '@/routes/__root'
import { renderToStaticMarkup } from 'react-dom/server'

const { routerStateMock } = vi.hoisted(() => ({
  routerStateMock: {
    isRoutePending: false
  }
}))

beforeAll(async () => {
  await resetI18nInitialization()
  i18n.addResourceBundle('en', 'translation', defaultTranslation, true, true)
  await initializeI18n()
})

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    HeadContent: () => <meta content="test-head" name="test-head" />,
    Outlet: () => <div>route outlet</div>,
    Scripts: () => <script type="application/json">scripts</script>,
    createRootRoute: (options: unknown) => ({ options }),
    useRouterState: () => routerStateMock.isRoutePending
  }
})

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
    expect(markup).toContain('scripts')
    expect(Route.options.notFoundComponent).toBeTypeOf('function')
  })

  test('renders full document immediately without an i18n bootstrap gate', async () => {
    const RootDocument = Route.options.component

    if (!RootDocument) {
      throw new Error('Expected the root route to expose component')
    }

    await resetI18nInitialization()

    const initialMarkup = renderToStaticMarkup(<RootDocument />)

    expect(initialMarkup).toContain('<html lang="en">')
    expect(initialMarkup).toContain('route outlet')
    expect(initialMarkup).toContain('scripts')
  })
})
