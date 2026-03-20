import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
/* eslint-disable react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop, @typescript-eslint/no-explicit-any */
import { render } from 'vitest-browser-react'
import { useEffect } from 'react'

import {
  useInputHandler,
  type UseInputHandlerOptions,
  type UseInputHandlerReturn,
  type UseInputHandlerCallbacks
} from '@/lib/input'
import { currentMatchSchemaVersion } from '@/lib/current-match/persistence'
import {
  createCurrentMatchSession,
  type CurrentMatchSession,
  type CurrentMatchPersistence
} from '@/lib/current-match'

import { createTestSetup } from '../core/match/test-helpers'

const testMatchId = 'test-match'

// Helper function at module scope to avoid eslint warning about function recreation
const createOptions = (sessionObj: CurrentMatchSession) => ({ session: sessionObj })

// Test component to render the hook output
function InputHandlerTestComponent({
  options,
  callbacks,
  onStateChange
}: {
  options: UseInputHandlerOptions
  callbacks?: UseInputHandlerCallbacks
  onStateChange?: (state: UseInputHandlerReturn) => void
}) {
  const state = useInputHandler(options, callbacks)

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  return (
    <div>
      <span data-testid="enabled">{options.enabled !== false ? 'true' : 'false'}</span>
      <button data-testid="team1Score" type="button" onClick={state.handlers.onTeam1Score}>
        Team 1 Score
      </button>
      <button data-testid="team2Score" type="button" onClick={state.handlers.onTeam2Score}>
        Team 2 Score
      </button>
      <button data-testid="undo" type="button" onClick={state.handlers.onUndo}>
        Undo
      </button>
      <span data-testid="wakeLockSupported">{state.wakeLockState.isSupported.toString()}</span>
    </div>
  )
}

describe('use-input-handler browser', () => {
  let session: CurrentMatchSession
  let mockPersistence: CurrentMatchPersistence

  beforeEach(() => {
    const matchSetup = createTestSetup()
    const testStartedAt = Date.now()
    mockPersistence = {
      saveCurrentMatch: vi
        .fn<CurrentMatchPersistence['saveCurrentMatch']>()
        .mockImplementation(async ({ matchId = testMatchId, setup, actions, startedAt }) => ({
          schemaVersion: currentMatchSchemaVersion,
          matchId,
          setup,
          actions,
          startedAt: startedAt ?? testStartedAt
        })),
      loadCurrentMatch: vi.fn(),
      clearCurrentMatch: vi.fn(async () => undefined)
    }
    session = createCurrentMatchSession({
      matchId: testMatchId,
      setup: matchSetup,
      actions: [],
      startedAt: testStartedAt,
      persistence: mockPersistence
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('keyboard event handling', () => {
    test('handles ArrowLeft key for team-1 score', async () => {
      const onScore = vi.fn()
      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
      const options = createOptions(session)
      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
      const callbacks = { onScore }

      await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

      // Simulate keyboard event
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

      // Wait for the callback to be called
      await vi.waitFor(() => expect(onScore).toHaveBeenCalledWith('team-1'))
    })

    test('handles ArrowRight key for team-2 score', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))

      await vi.waitFor(() => expect(onScore).toHaveBeenCalledWith('team-2'))
    })

    test('handles ArrowUp key for undo', async () => {
      const onUndo = vi.fn()
      const options = createOptions(session)
      const callbacks = { onUndo }

      await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))

      await vi.waitFor(() => expect(onUndo).toHaveBeenCalled())
    })

    test('ignores unknown keys', async () => {
      const onScore = vi.fn()
      const onUndo = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore, onUndo }

      await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))

      await vi.waitFor(() => {
        expect(onScore).not.toHaveBeenCalled()
        expect(onUndo).not.toHaveBeenCalled()
      })
    })

    test('does not handle events when disabled', async () => {
      const onScore = vi.fn()
      const options = { session, enabled: false }
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      // When enabled is false, the click handler should also return early
      await screen.getByTestId('team1Score').click()

      await vi.waitFor(() => expect(onScore).not.toHaveBeenCalled())
    })
  })

  describe('touch/click handlers', () => {
    test('onTeam1Score triggers team-1 score', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await screen.getByTestId('team1Score').click()

      await vi.waitFor(() => expect(onScore).toHaveBeenCalledWith('team-1'))
    })

    test('onTeam2Score triggers team-2 score', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await screen.getByTestId('team2Score').click()

      await vi.waitFor(() => expect(onScore).toHaveBeenCalledWith('team-2'))
    })

    test('onUndo triggers undo', async () => {
      const onUndo = vi.fn()
      const options = createOptions(session)
      const callbacks = { onUndo }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await screen.getByTestId('undo').click()

      await vi.waitFor(() => expect(onUndo).toHaveBeenCalled())
    })

    test('touch handlers do not work when disabled', async () => {
      const onScore = vi.fn()
      const options = { session, enabled: false }
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await screen.getByTestId('team1Score').click()

      await vi.waitFor(() => expect(onScore).not.toHaveBeenCalled())
    })
  })

  describe('debounce prevents rapid duplicate scores', () => {
    test('debounces rapid button clicks', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })

      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      // First click registers and sets debounce timestamp
      await screen.getByTestId('team1Score').click()

      // Wait for the first callback to complete
      await vi.waitFor(() => expect(onScore).toHaveBeenCalledTimes(1))
      expect(onScore).toHaveBeenCalledWith('team-1')

      // Don't advance time - second click should be debounced
      await screen.getByTestId('team1Score').click()

      // Verify debounce blocked the second click
      expect(onScore).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    test('allows score after debounce period', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      // First click
      await screen.getByTestId('team1Score').click()

      await vi.waitFor(() => expect(onScore).toHaveBeenCalledTimes(1))

      // Wait for debounce to expire (300ms + buffer)
      await new Promise((resolve) => setTimeout(resolve, 350))

      // Second click should now register
      await screen.getByTestId('team1Score').click()

      await vi.waitFor(() => expect(onScore).toHaveBeenCalledTimes(2))
    })

    test('undo is not debounced', async () => {
      const onUndo = vi.fn()
      const options = createOptions(session)
      const callbacks = { onUndo }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      // First undo
      await screen.getByTestId('undo').click()

      await vi.waitFor(() => expect(onUndo).toHaveBeenCalledTimes(1))

      // Rapid second undo should also work
      await screen.getByTestId('undo').click()

      await vi.waitFor(() => expect(onUndo).toHaveBeenCalledTimes(2))
    })
  })

  describe('wake lock integration', () => {
    test('handles wake lock error when useWakeLock is enabled', async () => {
      const onError = vi.fn()
      const options = { session, useWakeLock: true }
      const callbacks = { onError }

      // This test just verifies the component renders with wake lock enabled
      // The actual wake lock error handling is tested in wake-lock.browser.test.tsx
      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await expect.element(screen.getByTestId('wakeLockSupported')).toBeVisible()
    })
  })

  describe('handler invocation', () => {
    test('onKeyDown handler respects enabled: false via state', async () => {
      const onScore = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let handlerRef: any = null

      const options = { session, enabled: false }
      const callbacks = { onScore }

      await render(
        <InputHandlerTestComponent
          options={options}
          callbacks={callbacks}
          onStateChange={(state) => {
            handlerRef = state.handlers.onKeyDown
          }}
        />
      )

      // Now call the handler directly
      if (handlerRef) {
        handlerRef(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      }

      await vi.waitFor(() => {
        // onScore should NOT be called because enabled is false
        expect(onScore).not.toHaveBeenCalled()
      })
    })
  })

  describe('return value', () => {
    test('works without callbacks provided', async () => {
      const options = createOptions(session)

      const screen = await render(<InputHandlerTestComponent options={options} />)

      // Should render without errors even without callbacks
      await expect.element(screen.getByTestId('team1Score')).toBeVisible()
    })

    test('returns correct interface shape', async () => {
      const options = createOptions(session)
      const screen = await render(<InputHandlerTestComponent options={options} />)

      // Check that the component renders with expected elements
      await expect.element(screen.getByTestId('team1Score')).toBeVisible()
      await expect.element(screen.getByTestId('team2Score')).toBeVisible()
      await expect.element(screen.getByTestId('undo')).toBeVisible()
      await expect.element(screen.getByTestId('wakeLockSupported')).toBeVisible()
    })
  })

  describe('error handling', () => {
    test('calls onError callback when score fails', async () => {
      const onError = vi.fn()

      // Create a session that throws on score - use a proper mock that implements the interface
      const failingSession = {
        getSnapshot: () => session.getSnapshot(),
        scorePoint: vi.fn().mockRejectedValue(new Error('Score failed')),
        undoScoreAction: vi.fn().mockResolvedValue(session.getSnapshot()),
        continuePlaying: vi.fn().mockResolvedValue(session.getSnapshot())
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
      const options = { session: failingSession as any }
      const callbacks = { onError }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await screen.getByTestId('team1Score').click()

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
        expect(onError.mock.calls[0]![0].message).toBe('Score failed')
      })
    })

    test('calls onError callback when undo fails', async () => {
      const onError = vi.fn()

      const failingSession = {
        getSnapshot: () => session.getSnapshot(),
        scorePoint: vi.fn().mockResolvedValue(session.getSnapshot()),
        undoScoreAction: vi.fn().mockRejectedValue(new Error('Undo failed')),
        continuePlaying: vi.fn().mockResolvedValue(session.getSnapshot())
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
      const options = { session: failingSession as any }
      const callbacks = { onError }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      await screen.getByTestId('undo').click()

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
        expect(onError.mock.calls[0]![0].message).toBe('Undo failed')
      })
    })
  })

  describe('debounce edge cases', () => {
    test('does not trigger score when debounce is not ready', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      const screen = await render(
        <InputHandlerTestComponent options={options} callbacks={callbacks} />
      )

      // First click - should work
      await screen.getByTestId('team1Score').click()
      await vi.waitFor(() => expect(onScore).toHaveBeenCalledTimes(1))

      // Immediate second click - debounce should block it
      await screen.getByTestId('team1Score').click()
      await vi.waitFor(() => {
        // Still only 1 call because of debounce
        expect(onScore).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('keyboard event edge cases', () => {
    test('processes keyboard events when target is not an HTMLElement (null)', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

      // Dispatch keyboard event with a non-HTMLElement target (like window)
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      Object.defineProperty(event, 'target', { value: null })
      window.dispatchEvent(event)

      await vi.waitFor(() => expect(onScore).toHaveBeenCalledWith('team-1'))
    })

    test('ignores keyboard events when target is an input element', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      // Create a mock input element
      const input = document.createElement('input')
      document.body.appendChild(input)

      try {
        await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

        // Focus on input and dispatch keyboard event
        input.focus()
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
        input.dispatchEvent(event)

        await vi.waitFor(() => {
          // Should NOT trigger because target is an INPUT element
          expect(onScore).not.toHaveBeenCalled()
        })
      } finally {
        document.body.removeChild(input)
      }
    })

    test('ignores keyboard events when target is a textarea element', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      // Create a mock textarea element
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      try {
        await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

        // Focus on textarea and dispatch keyboard event
        textarea.focus()
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
        textarea.dispatchEvent(event)

        await vi.waitFor(() => {
          // Should NOT trigger because target is a TEXTAREA element
          expect(onScore).not.toHaveBeenCalled()
        })
      } finally {
        document.body.removeChild(textarea)
      }
    })

    test('ignores keyboard events when target is contentEditable', async () => {
      const onScore = vi.fn()
      const options = createOptions(session)
      const callbacks = { onScore }

      // Create a mock contentEditable div
      const div = document.createElement('div')
      div.contentEditable = 'true'
      document.body.appendChild(div)

      try {
        await render(<InputHandlerTestComponent options={options} callbacks={callbacks} />)

        // Focus on div and dispatch keyboard event
        div.focus()
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
        div.dispatchEvent(event)

        await vi.waitFor(() => {
          // Should NOT trigger because target is contentEditable
          expect(onScore).not.toHaveBeenCalled()
        })
      } finally {
        document.body.removeChild(div)
      }
    })
  })
})
