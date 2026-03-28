import { beforeEach, describe, expect, test, vi } from 'vitest'

const { initializeI18nMock, i18nMock, registerSWMock, routerStateMock, translationMap } =
  vi.hoisted(() => ({
    initializeI18nMock: vi.fn(() => Promise.resolve()),
    i18nMock: {
      resolvedLanguage: 'en',
      language: 'en',
      on: vi.fn(),
      off: vi.fn()
    },
    registerSWMock: vi.fn(() => Promise.resolve()),
    routerStateMock: {
      isRoutePending: false
    },
    translationMap: {
      'error.unexpectedLabel': 'Unexpected error',
      'error.unexpectedTitle': 'Something went wrong',
      'error.unexpectedBody': 'Please try again.',
      'common.retry': 'Try again'
    } satisfies Record<string, string>
  }))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      effect()
    }
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translationMap[key as keyof typeof translationMap] ?? key
  })
}))

vi.mock('@/lib/i18n', () => ({
  i18n: i18nMock,
  initializeI18n: initializeI18nMock
}))

vi.mock('@/lib/pwa', () => ({
  registerSW: registerSWMock
}))

vi.mock('@/components/DebugPwa', () => ({
  DebugPwa: () => <div>debug pwa</div>
}))

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

import { renderToStaticMarkup } from 'react-dom/server'

import { Route } from '@/routes/__root'

describe('root route effects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routerStateMock.isRoutePending = false
    i18nMock.resolvedLanguage = 'en'
    i18nMock.language = 'en'
    vi.stubGlobal('window', {})
    vi.stubGlobal('navigator', { serviceWorker: {} })
  })

  test('kicks off i18n initialization without blocking the root shell', async () => {
    let resolveInitialization!: () => void
    const initializationPromise = new Promise<void>((resolve) => {
      resolveInitialization = resolve
    })
    initializeI18nMock.mockReturnValueOnce(initializationPromise)

    const RootDocument = Route.options.component

    if (!RootDocument) {
      throw new Error('Expected the root route to expose a component.')
    }

    const markup = renderToStaticMarkup(<RootDocument />)

    expect(markup).toContain('<html lang="en">')
    expect(markup).toContain('route outlet')
    expect(markup).toContain('scripts')
    expect(initializeI18nMock).toHaveBeenCalledTimes(1)
    expect(registerSWMock).toHaveBeenCalledTimes(1)

    resolveInitialization()
    await initializationPromise
  })

  test('logs initialization failures without replacing the root shell', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failure = new Error('init failed')
    initializeI18nMock.mockRejectedValueOnce(failure)

    const RootDocument = Route.options.component

    if (!RootDocument) {
      throw new Error('Expected the root route to expose a component.')
    }

    const markup = renderToStaticMarkup(<RootDocument />)

    await Promise.resolve()

    expect(markup).toContain('route outlet')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize i18n:', failure)
  })
})
