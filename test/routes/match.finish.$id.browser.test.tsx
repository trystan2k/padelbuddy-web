/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-object-as-prop -- Test files use inline objects for readability */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence'
import { Route } from '@/routes/match.finish.$id'

import { createTestSetup, winQuickSet } from '../core/match/test-helpers'

const { mockLoadCurrentMatch, mockUseLoaderData } = vi.hoisted(() => ({
  mockLoadCurrentMatch: vi.fn<() => Promise<unknown>>(),
  mockUseLoaderData: vi.fn<() => unknown>()
}))

vi.mock('@/lib/current-match/indexed-db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/current-match/indexed-db')>()

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
      invalidate: vi.fn<() => Promise<void>>(),
      preloadRoute: vi.fn<() => Promise<void>>()
    }),
    useNavigate: () => vi.fn<() => void>()
  }
})

describe('match.finish.$id route', () => {
  const setup = createTestSetup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('redirects home when no saved match exists', async () => {
    mockLoadCurrentMatch.mockResolvedValue({ status: 'empty' })

    await expect(
      getLoader()({
        params: { id: 'match-finish' }
      } as never)
    ).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'no-match' }
    })
  })

  test('redirects home when the saved match requires a reset', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'reset-required',
      reason: 'schema-version',
      storedSchemaVersion: currentMatchSchemaVersion - 1
    })

    await expect(
      getLoader()({
        params: { id: 'match-finish' }
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

    await expect(
      getLoader()({
        params: { id: 'match-finish' }
      } as never)
    ).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'corrupt' }
    })
  })

  test('loads ready data for completed matches', async () => {
    const record = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: 'match-finish',
      setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: 1_000
    }

    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record
    })

    await expect(getLoader()({ params: { id: 'match-finish' } } as never)).resolves.toMatchObject({
      matchId: 'match-finish',
      record,
      projection: {
        derived: {
          status: 'completed'
        }
      }
    })
  })

  test('renders the finish screen for loader-ready matches', async () => {
    const record = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: 'match-finish',
      setup,
      actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
      startedAt: 1_000,
      finishedAt: 2_000
    }

    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record
    })

    mockUseLoaderData.mockReturnValue(
      await getLoader()({ params: { id: 'match-finish' } } as never)
    )

    const MatchFinishRouteComponent = getRouteComponent()
    const screen = await render(<MatchFinishRouteComponent />)

    await expect.element(screen.getByTestId('match-end-screen')).toBeInTheDocument()
  })

  test('loads ready data for manually finished matches', async () => {
    const record = {
      schemaVersion: currentMatchSchemaVersion,
      matchId: 'match-finish',
      setup,
      actions: [],
      startedAt: 1_000,
      finishedAt: 2_000
    }

    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record
    })

    await expect(getLoader()({ params: { id: 'match-finish' } } as never)).resolves.toMatchObject({
      matchId: 'match-finish',
      record
    })
  })

  test('redirects in-progress matches back to the active route', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: 'match-finish',
        setup,
        actions: [],
        startedAt: 1_000
      }
    })

    await expect(
      getLoader()({
        params: { id: 'match-finish' }
      } as never)
    ).rejects.toMatchObject({
      to: '/match/$id',
      params: { id: 'match-finish' },
      replace: true
    })
  })

  test('redirects home when the saved match does not match the route id', async () => {
    mockLoadCurrentMatch.mockResolvedValue({
      status: 'ok',
      record: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: 'different-match',
        setup,
        actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
        startedAt: 1_000
      }
    })

    await expect(
      getLoader()({
        params: { id: 'match-finish' }
      } as never)
    ).rejects.toMatchObject({
      to: '/',
      replace: true,
      search: { error: 'invalid-match' }
    })
  })
})

function getLoader() {
  const loader = Route.options.loader

  if (typeof loader !== 'function') {
    throw new Error('Expected the match finish route to expose a loader.')
  }

  return loader
}

function getRouteComponent() {
  const component = Route.options.component

  if (typeof component !== 'function') {
    throw new Error('Expected the match finish route to expose a component.')
  }

  return component
}
