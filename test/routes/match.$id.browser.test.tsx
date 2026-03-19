/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-object-as-prop -- Test files use inline objects for readability */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { currentMatchSchemaVersion } from '@/lib/current-match'
import { MatchRouteContent } from '@/routes/match.$id'
import { createTestSetup, winQuickSet } from '../core/match/test-helpers'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({
      options,
      useLoaderData: vi.fn()
    }),
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/components/ActiveMatchScreen', () => ({
  ActiveMatchScreen: ({ matchId }: { matchId: string }) => (
    <div data-testid="active-match-screen">active:{matchId}</div>
  )
}))

vi.mock('@/components/MatchEndScreen', () => ({
  MatchEndScreen: () => <div data-testid="match-end-screen-stub">completed</div>
}))

describe('match.$id route content', () => {
  const testMatchId = 'match-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the active match screen for in-progress matches', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <MatchRouteContent
        matchData={{
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: testMatchId,
            setup,
            actions: [],
            startedAt: 1_000
          }
        }}
        matchId={testMatchId}
      />
    )

    await expect.element(screen.getByTestId('active-match-screen')).toBeInTheDocument()
  })

  test('redirects completed matches to the finish route', async () => {
    const setup = createTestSetup()

    await render(
      <MatchRouteContent
        matchData={{
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'match-2',
            setup,
            actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
            startedAt: 1_000
          }
        }}
        matchId="match-2"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/finish/$id',
        params: { id: 'match-2' },
        replace: true
      })
    })
  })

  test('redirects home when no saved match exists', async () => {
    await render(<MatchRouteContent matchData={{ status: 'empty' }} matchId="match-3" />)

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  test('redirects home when the saved match requires a reset', async () => {
    await render(
      <MatchRouteContent
        matchData={{
          status: 'reset-required',
          reason: 'schema-version',
          storedSchemaVersion: 1
        }}
        matchId="match-reset"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  test('redirects home when the saved match is corrupt', async () => {
    await render(
      <MatchRouteContent
        matchData={{
          status: 'corrupt',
          message: 'bad record'
        }}
        matchId="match-4"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  test('redirects home when the route match id does not match persistence', async () => {
    const setup = createTestSetup()

    await render(
      <MatchRouteContent
        matchData={{
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'different-match',
            setup,
            actions: [],
            startedAt: 1_000
          }
        }}
        matchId="match-5"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })
})
