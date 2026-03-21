import { describe, expect, test, vi, beforeAll } from 'vitest'

// Note: i18n is initialized in beforeAll() before tests execute.
// ESM imports are hoisted, so this import runs before beforeAll -
// but the route component handles uninitialized i18n gracefully.
import { i18n, resetI18nInitialization } from '@/lib/i18n/i18n'

beforeAll(async () => {
  // Reset any previous initialization state
  resetI18nInitialization()

  // Initialize i18n with test configuration
  await i18n.init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    resources: {
      en: {
        translation: {}
      }
    }
  })
})

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    HeadContent: () => <meta content="test-head" name="test-head" />,
    Outlet: () => <div>route outlet</div>,
    Scripts: () => <script type="application/json">scripts</script>,
    createRootRoute: (options: unknown) => ({ options }),
    useRouterState: () => false
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
    // The component now waits for i18n initialization
    // In the initial render, it shows the loading state without Outlet
    expect(markup).toContain('<html lang="en">')
    expect(markup).toContain('scripts')
    expect(Route.options.notFoundComponent).toBeTypeOf('function')
  })

  test('renders full document immediately when i18n is already initialized', () => {
    const RootDocument = Route.options.component

    if (!RootDocument) {
      throw new Error('Expected the root route to expose component')
    }

    // When i18n is already initialized (as it is in beforeAll),
    // the component renders the full document immediately without loading flash
    const initialMarkup = renderToStaticMarkup(<RootDocument />)
    expect(initialMarkup).toContain('<html lang="en">')
    // The Outlet should be rendered immediately since i18n is already initialized
    expect(initialMarkup).toContain('route outlet')
    expect(initialMarkup).toContain('scripts')

    // Note: Testing async state transition requires browser tests with
    // React Testing Library's act() and waitFor().
    // The async behavior is covered in E2E tests.
  })
})
