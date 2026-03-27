import { describe, expect, test, vi } from 'vitest'

const { mockLoadHomeStartup } = vi.hoisted(() => ({
  mockLoadHomeStartup: vi.fn(async () => ({
    startupState: {
      status: 'no-match' as const,
      notice: null
    }
  }))
}))

vi.mock('@/routes/-home-startup', () => ({
  loadHomeStartup: mockLoadHomeStartup
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({ options })
  }
})

import { Route } from '@/routes/index'

describe('index route', () => {
  test('renders the app shell component', () => {
    const HomeRoute = Route.options.component

    if (!HomeRoute) {
      throw new Error('Expected the home route to expose a component')
    }

    expect(HomeRoute).toBeTypeOf('function')
  })

  test('loads serializable startup state through the home loader helper', async () => {
    const loader = Route.options.loader

    if (typeof loader !== 'function') {
      throw new Error('Expected the home route to expose a loader.')
    }

    await expect(loader({} as never)).resolves.toEqual({
      startupState: {
        status: 'no-match',
        notice: null
      }
    })
    expect(mockLoadHomeStartup).toHaveBeenCalledTimes(1)
  })
})
