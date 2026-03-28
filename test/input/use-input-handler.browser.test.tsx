/* oxlint-disable jsx-no-new-function-as-prop, jsx-no-new-object-as-prop, jsx-no-new-array-as-prop -- test harness props are intentionally inline for readability. */

import { useEffect, useState } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { useInputHandler, type RemoteControllerBindings } from '@/lib/input'
import type { MatchAction, MatchTeamId } from '@/core/match'

function removeLastTeamAction(actions: MatchAction[], teamId: MatchTeamId): MatchAction[] {
  const actionIndex = actions.findLastIndex((action) => action.teamId === teamId)

  if (actionIndex < 0) {
    return actions
  }

  return [...actions.slice(0, actionIndex), ...actions.slice(actionIndex + 1)]
}

function InputHandlerHarness({
  enabled = true,
  bindings = null,
  initialActions = [],
  bufferedAddWindowMs = 380,
  onAdd = vi.fn(),
  onUndo = vi.fn(),
  onUndoForTeam = vi.fn(),
  onError = vi.fn(),
  onStateChange
}: {
  enabled?: boolean
  bindings?: RemoteControllerBindings | null
  initialActions?: MatchAction[]
  bufferedAddWindowMs?: number
  onAdd?: (teamId: MatchTeamId) => void
  onUndo?: () => void
  onUndoForTeam?: (teamId: MatchTeamId) => void
  onError?: (error: Error) => void
  onStateChange?: (state: ReturnType<typeof useInputHandler>) => void
}) {
  const [actions, setActions] = useState<MatchAction[]>(initialActions)
  const state = useInputHandler(
    {
      actions,
      bindings,
      enabled,
      bufferedAddWindowMs
    },
    {
      onAdd: async (teamId) => {
        setActions((currentActions) => [...currentActions, { type: 'score-point', teamId }])
        onAdd(teamId)
      },
      onUndo: async () => {
        setActions((currentActions) => currentActions.slice(0, -1))
        onUndo()
      },
      onUndoForTeam: async (teamId) => {
        setActions((currentActions) => removeLastTeamAction(currentActions, teamId))
        onUndoForTeam(teamId)
      },
      onError
    }
  )

  useEffect(() => {
    onStateChange?.(state)
  }, [onStateChange, state])

  return (
    <div>
      <button data-testid="touch-add-team-1" type="button" onClick={state.handlers.onTeam1Score}>
        Add team 1
      </button>
      <button data-testid="touch-add-team-2" type="button" onClick={state.handlers.onTeam2Score}>
        Add team 2
      </button>
      <button data-testid="touch-undo" type="button" onClick={state.handlers.onUndo}>
        Undo
      </button>
      <span data-testid="action-count">{actions.length}</span>
      <span data-testid="latest-team">{actions.at(-1)?.teamId ?? 'none'}</span>
    </div>
  )
}

describe('use-input-handler browser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('commits a mapped add after the buffered window', async () => {
    vi.useFakeTimers()

    const onAdd = vi.fn()
    await render(<InputHandlerHarness onAdd={onAdd} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

    expect(onAdd).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(380)

    expect(onAdd).toHaveBeenCalledWith('team-1')
  })

  test('supports custom mapped adds for team 2', async () => {
    vi.useFakeTimers()

    const onAdd = vi.fn()
    await render(
      <InputHandlerHarness
        onAdd={onAdd}
        bindings={{
          'add-team-1': 'q',
          'revert-team-1': 'a',
          'add-team-2': 'w',
          'revert-team-2': 's'
        }}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))
    await vi.advanceTimersByTimeAsync(380)

    expect(onAdd).toHaveBeenCalledWith('team-2')
  })

  test('double pressing the same add key reverts that team instead of scoring', async () => {
    vi.useFakeTimers()

    const onAdd = vi.fn()
    const onUndoForTeam = vi.fn()
    const initialActions: MatchAction[] = [{ type: 'score-point', teamId: 'team-1' }]

    const screen = await render(
      <InputHandlerHarness
        initialActions={initialActions}
        onAdd={onAdd}
        onUndoForTeam={onUndoForTeam}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await vi.advanceTimersByTimeAsync(150)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await vi.advanceTimersByTimeAsync(400)

    expect(onAdd).not.toHaveBeenCalled()
    expect(onUndoForTeam).toHaveBeenCalledWith('team-1')
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('0')
  })

  test('explicit revert mapping removes the last team-specific action even when another team scored later', async () => {
    const onUndoForTeam = vi.fn()
    const bindings: RemoteControllerBindings = {
      'add-team-1': 'q',
      'revert-team-1': 'z',
      'add-team-2': 'w',
      'revert-team-2': 'x'
    }

    const screen = await render(
      <InputHandlerHarness
        bindings={bindings}
        initialActions={[
          { type: 'score-point', teamId: 'team-1' },
          { type: 'score-point', teamId: 'team-2' }
        ]}
        onUndoForTeam={onUndoForTeam}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))

    expect(onUndoForTeam).toHaveBeenCalledWith('team-1')
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1')
    await expect.element(screen.getByTestId('latest-team')).toHaveTextContent('team-2')
  })

  test('explicit revert mapping does nothing when that team has no scoring action', async () => {
    const onUndoForTeam = vi.fn()
    const bindings: RemoteControllerBindings = {
      'add-team-1': 'q',
      'revert-team-1': 'z',
      'add-team-2': 'w',
      'revert-team-2': 'x'
    }

    const screen = await render(
      <InputHandlerHarness
        bindings={bindings}
        initialActions={[{ type: 'score-point', teamId: 'team-2' }]}
        onUndoForTeam={onUndoForTeam}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))

    expect(onUndoForTeam).toHaveBeenCalledWith('team-1')
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1')
  })

  test('team-2 revert mapping removes the last team-2 action', async () => {
    const onUndoForTeam = vi.fn()

    const screen = await render(
      <InputHandlerHarness
        bindings={{
          'add-team-1': 'q',
          'revert-team-1': 'z',
          'add-team-2': 'w',
          'revert-team-2': 'x'
        }}
        initialActions={[
          { type: 'score-point', teamId: 'team-2' },
          { type: 'score-point', teamId: 'team-1' },
          { type: 'score-point', teamId: 'team-2' }
        ]}
        onUndoForTeam={onUndoForTeam}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))

    expect(onUndoForTeam).toHaveBeenCalledWith('team-2')
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('2')
    await expect.element(screen.getByTestId('latest-team')).toHaveTextContent('team-1')
  })

  test('legacy undo keys still work', async () => {
    const onUndo = vi.fn()
    const screen = await render(
      <InputHandlerHarness
        initialActions={[{ type: 'score-point', teamId: 'team-1' }]}
        onUndo={onUndo}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(onUndo).toHaveBeenCalledTimes(1)
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('0')
  })

  test('mapped keys call preventDefault', async () => {
    let handler: ((event: KeyboardEvent) => void) | null = null

    await render(
      <InputHandlerHarness
        onStateChange={(state) => {
          handler = state.handlers.onKeyDown
        }}
      />
    )

    const preventDefault = vi.fn()

    await vi.waitFor(() => {
      expect(handler).not.toBeNull()
    })

    const currentHandler = handler as unknown as (event: KeyboardEvent) => void

    currentHandler({
      key: 'ArrowLeft',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault,
      target: document.body
    } as unknown as KeyboardEvent)

    expect(preventDefault).toHaveBeenCalledTimes(1)
  })

  test('ignores unmapped keys, modifier keys, and editable targets', async () => {
    const onAdd = vi.fn()
    let handler: ((event: KeyboardEvent) => void) | null = null

    await render(
      <InputHandlerHarness
        onAdd={onAdd}
        onStateChange={(state) => {
          handler = state.handlers.onKeyDown
        }}
      />
    )

    await vi.waitFor(() => {
      expect(handler).not.toBeNull()
    })

    const currentHandler = handler as unknown as (event: KeyboardEvent) => void

    currentHandler({
      key: 'b',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      target: document.body
    } as unknown as KeyboardEvent)
    currentHandler({
      key: 'ArrowLeft',
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      target: document.body
    } as unknown as KeyboardEvent)

    const input = document.createElement('input')
    currentHandler({
      key: 'ArrowLeft',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      target: input
    } as unknown as KeyboardEvent)

    expect(onAdd).not.toHaveBeenCalled()
  })

  test('treats non-HTMLElement targets as non-editable', async () => {
    vi.useFakeTimers()

    let handler: ((event: KeyboardEvent) => void) | null = null
    const onAdd = vi.fn()

    await render(
      <InputHandlerHarness
        onAdd={onAdd}
        onStateChange={(state) => {
          handler = state.handlers.onKeyDown
        }}
      />
    )

    await vi.waitFor(() => {
      expect(handler).not.toBeNull()
    })

    const currentHandler = handler as unknown as (event: KeyboardEvent) => void
    const textNode = document.createTextNode('target')

    currentHandler({
      key: 'ArrowLeft',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
      target: textNode
    } as unknown as KeyboardEvent)

    await vi.advanceTimersByTimeAsync(380)

    expect(onAdd).toHaveBeenCalledWith('team-1')
  })

  test('touch handlers remain immediate and do not use the buffer', async () => {
    const onAdd = vi.fn()
    const screen = await render(<InputHandlerHarness onAdd={onAdd} />)

    await screen.getByTestId('touch-add-team-1').click()

    expect(onAdd).toHaveBeenCalledWith('team-1')
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('1')
  })

  test('touch team-2 scoring remains immediate', async () => {
    const onAdd = vi.fn()

    function Team2Harness() {
      const [actions, setActions] = useState<MatchAction[]>([])
      const state = useInputHandler(
        {
          actions
        },
        {
          onAdd: async (teamId) => {
            setActions((currentActions) => [...currentActions, { type: 'score-point', teamId }])
            onAdd(teamId)
          },
          onUndo: async () => undefined,
          onUndoForTeam: async () => undefined
        }
      )

      return (
        <button type="button" data-testid="touch-add-team-2" onClick={state.handlers.onTeam2Score}>
          Add team 2
        </button>
      )
    }

    const screen = await render(<Team2Harness />)

    await screen.getByTestId('touch-add-team-2').click()

    expect(onAdd).toHaveBeenCalledWith('team-2')
  })

  test('touch undo handler works immediately when enabled', async () => {
    const onUndo = vi.fn()
    const screen = await render(
      <InputHandlerHarness
        initialActions={[{ type: 'score-point', teamId: 'team-1' }]}
        onUndo={onUndo}
      />
    )

    await screen.getByTestId('touch-undo').click()

    expect(onUndo).toHaveBeenCalledTimes(1)
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('0')
  })

  test('ignores mapped keyboard input when the handler is disabled', async () => {
    vi.useFakeTimers()

    const onAdd = vi.fn()
    await render(<InputHandlerHarness enabled={false} onAdd={onAdd} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await vi.advanceTimersByTimeAsync(400)

    expect(onAdd).not.toHaveBeenCalled()
  })

  test('ignores touch handlers when the hook is disabled', async () => {
    const onAdd = vi.fn()
    const onUndo = vi.fn()
    const screen = await render(
      <InputHandlerHarness
        enabled={false}
        onAdd={onAdd}
        onUndo={onUndo}
        initialActions={[{ type: 'score-point', teamId: 'team-1' }]}
      />
    )

    await screen.getByTestId('touch-add-team-1').click()
    await screen.getByTestId('touch-add-team-2').click()
    await screen.getByTestId('touch-undo').click()

    expect(onAdd).not.toHaveBeenCalled()
    expect(onUndo).not.toHaveBeenCalled()
  })

  test('team-specific revert keeps state unchanged when that team has no actions', async () => {
    const onUndoForTeam = vi.fn()
    const screen = await render(
      <InputHandlerHarness
        onUndoForTeam={onUndoForTeam}
        bindings={{
          'add-team-1': 'q',
          'revert-team-1': 'z',
          'add-team-2': 'w',
          'revert-team-2': 'x'
        }}
      />
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }))

    expect(onUndoForTeam).toHaveBeenCalledWith('team-1')
    await expect.element(screen.getByTestId('action-count')).toHaveTextContent('0')
  })

  test('global undo cancels a pending buffered add before it is committed', async () => {
    vi.useFakeTimers()

    const onAdd = vi.fn()
    const onUndo = vi.fn()

    await render(<InputHandlerHarness onAdd={onAdd} onUndo={onUndo} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await vi.advanceTimersByTimeAsync(400)

    expect(onAdd).not.toHaveBeenCalled()
    expect(onUndo).not.toHaveBeenCalled()
  })

  test('reports callback errors through onError', async () => {
    const onError = vi.fn()

    function ErrorHarness() {
      const state = useInputHandler(
        {
          actions: [],
          bufferedAddWindowMs: 10
        },
        {
          onAdd: async () => {
            throw new Error('score failed')
          },
          onUndo: async () => undefined,
          onUndoForTeam: async () => undefined,
          onError
        }
      )

      return (
        <button type="button" data-testid="error-button" onClick={state.handlers.onTeam1Score}>
          Error
        </button>
      )
    }

    const screen = await render(<ErrorHarness />)

    await screen.getByTestId('error-button').click()

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'score failed' }))
    })
  })
})
