import { describe, expect, test, vi, beforeAll } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { defaultTranslation, i18n, initializeI18n, resetI18nInitialization } from '@/lib/i18n'

import { getErrorMessage, RouteErrorState, RoutePendingBoundary } from '@/routes/-route-utils'

beforeAll(async () => {
  await resetI18nInitialization()
  i18n.addResourceBundle('en', 'translation', defaultTranslation, true, true)
  await initializeI18n()
})

describe('getErrorMessage', () => {
  test('returns the message for a user-facing Error', () => {
    expect(getErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong')
  })

  test('returns null for a technical Error containing TypeError', () => {
    expect(getErrorMessage(new Error('TypeError: x is not a function'))).toBeNull()
  })

  test('returns null for a technical Error containing SyntaxError', () => {
    expect(getErrorMessage(new Error('SyntaxError: unexpected token'))).toBeNull()
  })

  test('returns null for a technical Error containing IndexedDB', () => {
    expect(getErrorMessage(new Error('IndexedDB database failed'))).toBeNull()
  })

  test('returns null for a technical Error containing IDB', () => {
    expect(getErrorMessage(new Error('IDBFactory request failed'))).toBeNull()
  })

  test('returns null for a technical Error containing undefined', () => {
    expect(getErrorMessage(new Error('Cannot read undefined'))).toBeNull()
  })

  test('returns null for a technical Error containing fetch', () => {
    expect(getErrorMessage(new Error('fetch failed to complete'))).toBeNull()
  })

  test('returns null for a technical Error containing network', () => {
    expect(getErrorMessage(new Error('A network error occurred'))).toBeNull()
  })

  test('returns the message for a non-technical Error', () => {
    expect(getErrorMessage(new Error('Match not found'))).toBe('Match not found')
  })

  test('returns null for an Error with an empty message', () => {
    expect(getErrorMessage(new Error(''))).toBeNull()
  })

  test('returns null for a non-Error value', () => {
    expect(getErrorMessage('string error')).toBeNull()
  })

  test('returns null for undefined', () => {
    expect(getErrorMessage(undefined)).toBeNull()
  })

  test('returns null for null', () => {
    expect(getErrorMessage(null)).toBeNull()
  })

  test('returns null for a number', () => {
    expect(getErrorMessage(42)).toBeNull()
  })
})

describe('RoutePendingBoundary', () => {
  test('returns null', () => {
    expect(RoutePendingBoundary()).toBeNull()
  })
})

describe('RouteErrorState', () => {
  test('renders without an error message when error has an empty message', () => {
    const reset = vi.fn()
    const markup = renderToStaticMarkup(<RouteErrorState error={new Error('')} reset={reset} />)

    expect(markup).toContain('Something interrupted this screen.')
    expect(markup).toContain('Try again')
    expect(markup).not.toContain('role="alert"')
  })

  test('renders with an error message when error has a user-facing message', () => {
    const reset = vi.fn()
    const markup = renderToStaticMarkup(
      <RouteErrorState error={new Error('Match not found')} reset={reset} />
    )

    expect(markup).toContain('Something interrupted this screen.')
    expect(markup).toContain('Match not found')
    expect(markup).toContain('role="alert"')
  })

  test('renders without error detail for technical errors', () => {
    const reset = vi.fn()
    const markup = renderToStaticMarkup(
      <RouteErrorState error={new Error('TypeError: x is undefined')} reset={reset} />
    )

    expect(markup).toContain('Something interrupted this screen.')
    expect(markup).not.toContain('role="alert"')
  })

  test('uses custom eyebrowKey when provided', () => {
    const reset = vi.fn()
    const markup = renderToStaticMarkup(
      <RouteErrorState error={new Error('test')} reset={reset} eyebrowKey="error.loadMatch" />
    )

    expect(markup).toContain('Error loading match')
  })
})
