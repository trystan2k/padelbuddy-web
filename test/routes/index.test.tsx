import { describe, expect, test, vi } from 'vitest'

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
})
