/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-object-as-prop -- Test files use inline objects for readability */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

const { mockLoadCurrentMatch, mockUseLoaderData } = vi.hoisted(() => ({
  mockLoadCurrentMatch: vi.fn(),
  mockUseLoaderData: vi.fn()
}))

vi.mock('@/lib/current-match', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/current-match')>()

  return {
    ...actual,
    loadCurrentMatch: mockLoadCurrentMatch
  }
})

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({
      options,
      useLoaderData: mockUseLoaderData,
      isPending: false,
      error: false
    }),
    redirect: (options: unknown) => options,
    useRouter: () => ({
      invalidate: vi.fn(),
      preloadRoute: vi.fn(),
      navigate: vi.fn()
    })
  }
})

import { currentMatchSchemaVersion } from '@/lib/current-match'
import { Route } from '@/routes/match.$id'

import { createTestSetup, winQuickSet } from '../core/match/test-helpers'

describe('match.$id route', () => {
  const testMatchId = 'match-1'
  const setup = createTestSetup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('loads ready data for in-progress matches', async () => {
    const record = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: testMatchId,
      setup,
      actions: [],
      startedAt: 1_000
    }

    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record
    })

    await expect(getLoader()({ params: { id: testMatchId } } as never)).resolves.toEqual({
      matchId: testMatchId,
      record
    })
  })

  test('renders the active match screen from loader data', async () => {
    mockUseLoaderData.mockReturnValue({
      matchId: testMatchId,
      record: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: testMatchId,
        setup,
        actions: [],
        startedAt: 1_000
      }
    })

    const MatchRouteComponent = getRouteComponent()
    const screen = await render(<MatchRouteComponent />)

    await expect.element(screen.getByTestId('layout-body')).toBeInTheDocument()
  })

  test('redirects completed matches to the finish route at loader time', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: 'match-2',
        setup,
        actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
        startedAt: 1_000
      }
    })

    await expect(getLoader()({ params: { id: 'match-2' } } as never)).rejects.toMatchObject({
      to: '/match/finish/$id',
      params: { id: 'match-2' },
      replace: true
    })
  })

  test('redirects home when no saved match exists', async () => {
    mockLoadCurrentMatch.mockResolvedValue({ status: 'empty' })

    await expect(getLoader()({ params: { id: 'match-3' } } as never)).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'no-match' }
    })
  })

  test('redirects home when the saved match requires a reset', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'reset-required',
      reason: 'schema-version',
      storedSchemaVersion: 1
    })

    await expect(
      getLoader()({
        params: { id: 'match-reset' }
      } as never)
    ).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'no-match' }
    })
  })

  test('redirects home when the saved match is corrupt', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'corrupt',
      message: 'bad record'
    })

    await expect(getLoader()({ params: { id: 'match-4' } } as never)).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'corrupt' }
    })
  })

  test('redirects home when the route match id does not match persistence', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: 'different-match',
        setup,
        actions: [],
        startedAt: 1_000
      }
    })

    await expect(getLoader()({ params: { id: 'match-5' } } as never)).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'invalid-match' }
    })
  })
})

function getLoader() {
  const loader = Route.options.loader

  if (typeof loader !== 'function') {
    throw new Error('Expected the match route to expose a loader.')
  }

  return loader
}

function getRouteComponent() {
  const component = Route.options.component

  if (typeof component !== 'function') {
    throw new Error('Expected the match route to expose a component.')
  }

  return component
}
