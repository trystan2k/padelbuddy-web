/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-object-as-prop -- Test files use inline objects for readability */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { currentMatchSchemaVersion } from '@/lib/current-match'
import { MatchFinishRouteContent } from '@/routes/match.finish.$id'
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

vi.mock('@/components/MatchEndScreen', () => ({
  MatchEndScreen: () => <div data-testid="match-end-screen-stub">completed</div>
}))

describe('match.finish.$id route content', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('redirects home when no saved match exists', async () => {
    await render(<MatchFinishRouteContent matchData={{ status: 'empty' }} matchId="match-finish" />)

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  test('redirects home when the saved match requires a reset', async () => {
    await render(
      <MatchFinishRouteContent
        matchData={{
          status: 'reset-required',
          reason: 'schema-version',
          storedSchemaVersion: currentMatchSchemaVersion - 1
        }}
        matchId="match-finish"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })

  test('redirects home when the saved match is corrupt', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await render(
      <MatchFinishRouteContent
        matchData={{
          status: 'corrupt',
          message: 'bad record'
        }}
        matchId="match-finish"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Corrupted match data:', 'bad record')
  })

  test('renders the finish screen for completed matches', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <MatchFinishRouteContent
        matchData={{
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'match-finish',
            setup,
            actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
            startedAt: 1_000
          }
        }}
        matchId="match-finish"
      />
    )

    await expect.element(screen.getByTestId('match-end-screen-stub')).toBeInTheDocument()
  })

  test('redirects in-progress matches back to the active route', async () => {
    const setup = createTestSetup()

    await render(
      <MatchFinishRouteContent
        matchData={{
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'match-finish',
            setup,
            actions: [],
            startedAt: 1_000
          }
        }}
        matchId="match-finish"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/match/$id',
        params: { id: 'match-finish' },
        replace: true
      })
    })
  })

  test('redirects home when the saved match does not match the route id', async () => {
    const setup = createTestSetup()

    await render(
      <MatchFinishRouteContent
        matchData={{
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'different-match',
            setup,
            actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
            startedAt: 1_000
          }
        }}
        matchId="match-finish"
      />
    )

    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })
})
