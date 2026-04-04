/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for test data */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useEffect, useState } from 'react'

import { useMatchSession } from '@/components/ActiveMatchScreen/useMatchSession'
import { createTestSetup } from '../../core/match/test-helpers'
import type { CurrentMatchPersistence } from '@/lib/current-match/indexed-db'

const testMatchId = 'test-match'

// Test component to render the hook output
function SessionTestComponent({
  setup,
  initialActions,
  startedAt,
  persistence,
  onStateChange
}: {
  setup: ReturnType<typeof createTestSetup>
  initialActions: Array<{ type: 'score-point'; teamId: 'team-1' | 'team-2' }>
  startedAt: number
  persistence?: CurrentMatchPersistence
  onStateChange?: (state: ReturnType<typeof useMatchSession>) => void
}) {
  const state = useMatchSession({
    matchId: testMatchId,
    setup,
    initialActions,
    startedAt,
    ...(persistence !== undefined && { persistence })
  })

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  return (
    <div>
      <span data-testid="actionCount">{state.snapshot.actions.length}</span>
      <span data-testid="isLoading">{state.isLoading.toString()}</span>
      <span data-testid="projectionActionCount">{state.snapshot.projection.state.actionCount}</span>
      <button type="button" data-testid="scoreTeam1" onClick={() => state.scorePoint('team-1')}>
        Score Team 1
      </button>
      <button type="button" data-testid="scoreTeam2" onClick={() => state.scorePoint('team-2')}>
        Score Team 2
      </button>
      <button type="button" data-testid="undo" onClick={() => state.undoScoreAction()}>
        Undo
      </button>
      <button
        type="button"
        data-testid="undo-team-1"
        onClick={() => state.undoScoreActionForTeam('team-1')}
      >
        Undo Team 1
      </button>
      <button
        type="button"
        data-testid="undo-team-2"
        onClick={() => state.undoScoreActionForTeam('team-2')}
      >
        Undo Team 2
      </button>
    </div>
  )
}

// Helper to create mock persistence
const createMockPersistence = (): CurrentMatchPersistence => ({
  saveCurrentMatch: vi.fn().mockResolvedValue(undefined),
  loadCurrentMatch: vi.fn().mockResolvedValue({ kind: 'not-found' }),
  clearCurrentMatch: vi.fn().mockResolvedValue(undefined)
})

describe('useMatchSession', () => {
  const defaultStartedAt = Date.now()
  let mockPersistence: CurrentMatchPersistence

  beforeEach(() => {
    vi.clearAllMocks()
    mockPersistence = createMockPersistence()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns initial snapshot with no actions', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('0')
    await expect.element(screen.getByTestId('isLoading')).toHaveTextContent('false')
    await expect.element(screen.getByTestId('projectionActionCount')).toHaveTextContent('0')
  })

  test('returns initial snapshot with existing actions', async () => {
    const setup = createTestSetup()
    const initialActions = [
      { type: 'score-point' as const, teamId: 'team-1' as const },
      { type: 'score-point' as const, teamId: 'team-2' as const }
    ]

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={initialActions}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('2')
    await expect.element(screen.getByTestId('projectionActionCount')).toHaveTextContent('2')
  })

  test('scorePoint adds action and updates snapshot', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('0')

    await screen.getByTestId('scoreTeam1').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('1')
    })

    // oxlint-disable-next-line typescript-eslint(unbound-method): Mock function doesn't use 'this'
    expect(mockPersistence.saveCurrentMatch).toHaveBeenCalledTimes(1)
  })

  test('undoScoreAction removes last action', async () => {
    const setup = createTestSetup()
    const initialActions = [
      { type: 'score-point' as const, teamId: 'team-1' as const },
      { type: 'score-point' as const, teamId: 'team-2' as const }
    ]

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={initialActions}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('2')

    await screen.getByTestId('undo').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('1')
    })
  })

  test('undoScoreAction does nothing when no actions exist', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('0')

    await screen.getByTestId('undo').click()

    // Should still be 0
    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('0')
  })

  test('undoScoreActionForTeam removes the last action for the selected team', async () => {
    const setup = createTestSetup()
    const initialActions = [
      { type: 'score-point' as const, teamId: 'team-1' as const },
      { type: 'score-point' as const, teamId: 'team-2' as const },
      { type: 'score-point' as const, teamId: 'team-1' as const }
    ]

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={initialActions}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('3')

    await screen.getByTestId('undo-team-1').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('2')
    })
  })

  test('undoScoreActionForTeam keeps the snapshot unchanged when the selected team has no actions', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[{ type: 'score-point' as const, teamId: 'team-2' as const }]}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await screen.getByTestId('undo-team-1').click()

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('1')
  })

  test('works without persistence (uses default)', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
        // No persistence prop
      />
    )

    await expect.element(screen.getByTestId('actionCount')).toHaveTextContent('0')

    await screen.getByTestId('scoreTeam1').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('1')
    })
  })

  test('projection is updated after scorePoint', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('projectionActionCount')).toHaveTextContent('0')

    await screen.getByTestId('scoreTeam1').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('projectionActionCount').element().textContent).toBe('1')
    })
  })

  test('projection is updated after undoScoreAction', async () => {
    const setup = createTestSetup()
    const initialActions = [{ type: 'score-point' as const, teamId: 'team-1' as const }]

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={initialActions}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await expect.element(screen.getByTestId('projectionActionCount')).toHaveTextContent('1')

    await screen.getByTestId('undo').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('projectionActionCount').element().textContent).toBe('0')
    })
  })

  test('multiple scorePoints update actions correctly', async () => {
    const setup = createTestSetup()

    const screen = await render(
      <SessionTestComponent
        setup={setup}
        initialActions={[]}
        startedAt={defaultStartedAt}
        persistence={mockPersistence}
      />
    )

    await screen.getByTestId('scoreTeam1').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('1')
    })

    await screen.getByTestId('scoreTeam2').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('2')
    })

    await screen.getByTestId('scoreTeam1').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('actionCount').element().textContent).toBe('3')
    })
  })
})

describe('useMatchSession - error handling', () => {
  const defaultStartedAt = Date.now()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('handles persistence errors gracefully', async () => {
    const setup = createTestSetup()
    const errorPersistence: CurrentMatchPersistence = {
      saveCurrentMatch: vi.fn().mockRejectedValue(new Error('Persistence error')),
      loadCurrentMatch: vi.fn().mockResolvedValue({ kind: 'not-found' }),
      clearCurrentMatch: vi.fn().mockResolvedValue(undefined)
    }

    // Error component to catch errors
    function ErrorCatchingComponent() {
      const [error, setError] = useState<Error | null>(null)

      const state = useMatchSession({
        matchId: testMatchId,
        setup,
        initialActions: [],
        startedAt: defaultStartedAt,
        persistence: errorPersistence
      })

      const handleScore = async () => {
        try {
          await state.scorePoint('team-1')
        } catch (e) {
          setError(e as Error)
        }
      }

      return (
        <div>
          <span data-testid="error">{error?.message || 'no error'}</span>
          <button type="button" data-testid="scoreButton" onClick={handleScore}>
            Score
          </button>
        </div>
      )
    }

    const screen = await render(<ErrorCatchingComponent />)

    await expect.element(screen.getByTestId('error')).toHaveTextContent('no error')

    await screen.getByTestId('scoreButton').click()

    await vi.waitFor(() => {
      expect(screen.getByTestId('error').element().textContent).toBe('Persistence error')
    })
  })
})
