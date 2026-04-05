import { describe, expect, test, vi } from 'vitest'
import type { CurrentMatchLoadResult } from '@/lib/current-match/indexed-db'
import type { CurrentMatchRecord, CurrentMatchSaveInput } from '@/lib/current-match/persistence'
import { loadHomeStartup } from '@/routes/-home-startup'

const { mockHydrateCurrentMatchStartup } = vi.hoisted(() => ({
  mockHydrateCurrentMatchStartup: vi.fn<() => Promise<object>>()
}))

vi.mock('@/lib/current-match/startup', () => ({
  hydrateCurrentMatchStartup: mockHydrateCurrentMatchStartup
}))

describe('loadHomeStartup', () => {
  test('wraps startup hydration in the home loader data contract', async () => {
    const startupState = {
      status: 'resume-required' as const,
      notice: null,
      match: {
        matchId: 'startup-match',
        snapshot: {
          setup: { format: 'best-of-3' },
          actions: []
        }
      }
    }

    mockHydrateCurrentMatchStartup.mockResolvedValue(startupState)

    await expect(loadHomeStartup()).resolves.toEqual({ startupState })
    expect(mockHydrateCurrentMatchStartup).toHaveBeenCalledWith(undefined)
  })

  test('passes through explicit startup options for browser-backed home hydration', async () => {
    const persistence = {
      loadCurrentMatch: vi.fn<() => Promise<CurrentMatchLoadResult>>(),
      saveCurrentMatch: vi.fn<(input: CurrentMatchSaveInput) => Promise<CurrentMatchRecord>>(),
      clearCurrentMatch: vi.fn<() => Promise<void>>()
    }

    mockHydrateCurrentMatchStartup.mockResolvedValue({
      status: 'no-match',
      notice: null
    })

    await loadHomeStartup({
      startup: {
        persistence
      }
    })

    expect(mockHydrateCurrentMatchStartup).toHaveBeenCalledWith({
      persistence
    })
  })
})
