import { describe, expect, test } from 'vitest'

import { getRouter } from '@/router'

describe('getRouter', () => {
  test('creates and caches the application router', () => {
    const firstRouter = getRouter()
    const secondRouter = getRouter()

    expect(secondRouter).toBe(firstRouter)
    expect(firstRouter.options.defaultPreload).toBe('intent')
    expect(firstRouter.options.scrollRestoration).toBe(true)
  })
})
