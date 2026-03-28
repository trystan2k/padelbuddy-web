'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { MatchAction, MatchTeamId } from '@/core/match'

import { getActionFromKey, type RemoteControllerBindings } from './keyboard-aliases'
import { type UseWakeLockReturn, useWakeLock } from './wake-lock'

const defaultBufferedAddWindowMs = 380

export interface UseInputHandlerOptions {
  actions: MatchAction[]
  bindings?: RemoteControllerBindings | null
  enabled?: boolean
  useWakeLock?: boolean
  bufferedAddWindowMs?: number
}

export interface UseInputHandlerCallbacks {
  onAdd: (teamId: MatchTeamId) => Promise<void> | void
  onUndo: () => Promise<void> | void
  onUndoForTeam: (teamId: MatchTeamId) => Promise<void> | void
  onError?: (error: Error) => void
}

export interface UseInputHandlerReturn {
  scorePoint: (teamId: MatchTeamId) => Promise<void>
  undo: () => Promise<void>
  handlers: {
    onKeyDown: (event: KeyboardEvent) => void
    onTeam1Score: () => void
    onTeam2Score: () => void
    onUndo: () => void
  }
  wakeLockState: Pick<UseWakeLockReturn, 'isSupported' | 'isActive' | 'error'>
}

export function useInputHandler(
  options: UseInputHandlerOptions,
  callbacks: UseInputHandlerCallbacks
): UseInputHandlerReturn {
  const {
    bindings = null,
    enabled = true,
    useWakeLock: useWakeLockEnabled = false,
    bufferedAddWindowMs = defaultBufferedAddWindowMs
  } = options

  const callbacksRef = useRef(callbacks)
  const bindingsRef = useRef<RemoteControllerBindings | null>(bindings)
  const actionsRef = useRef(options.actions)
  const enabledRef = useRef(enabled)
  const pendingAddTimersRef = useRef<Record<MatchTeamId, ReturnType<typeof setTimeout> | null>>({
    'team-1': null,
    'team-2': null
  })

  callbacksRef.current = callbacks
  bindingsRef.current = bindings
  actionsRef.current = options.actions
  enabledRef.current = enabled

  const onWakeLockError = useCallback((error: Error) => {
    callbacksRef.current.onError?.(error)
  }, [])

  const wakeLock = useWakeLock({
    enabled: useWakeLockEnabled && enabled,
    onError: onWakeLockError
  })

  const scorePoint = useCallback(async (teamId: MatchTeamId) => {
    try {
      await callbacksRef.current.onAdd(teamId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      callbacksRef.current.onError?.(error)
    }
  }, [])

  const undo = useCallback(async () => {
    try {
      await callbacksRef.current.onUndo()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      callbacksRef.current.onError?.(error)
    }
  }, [])

  const undoForTeam = useCallback(async (teamId: MatchTeamId) => {
    // MatchAction is currently ScorePointAction only; guard is future-proof if new action types are added
    const hasScoringAction = actionsRef.current.some(
      (action) => action.type === 'score-point' && action.teamId === teamId
    )

    if (!hasScoringAction) {
      return
    }

    try {
      await callbacksRef.current.onUndoForTeam(teamId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      callbacksRef.current.onError?.(error)
    }
  }, [])

  const cancelPendingAdd = useCallback((teamId: MatchTeamId): boolean => {
    const timer = pendingAddTimersRef.current[teamId]

    if (!timer) {
      return false
    }

    clearTimeout(timer)
    pendingAddTimersRef.current[teamId] = null
    return true
  }, [])

  const cancelAllPendingAdds = useCallback((): boolean => {
    const cancelledTeam1 = cancelPendingAdd('team-1')
    const cancelledTeam2 = cancelPendingAdd('team-2')

    return cancelledTeam1 || cancelledTeam2
  }, [cancelPendingAdd])

  const queueBufferedAdd = useCallback(
    (teamId: MatchTeamId) => {
      if (pendingAddTimersRef.current[teamId]) {
        cancelPendingAdd(teamId)
        void undoForTeam(teamId)
        return
      }

      pendingAddTimersRef.current[teamId] = setTimeout(() => {
        pendingAddTimersRef.current[teamId] = null

        if (!enabledRef.current) {
          return
        }

        void scorePoint(teamId)
      }, bufferedAddWindowMs)
    },
    [bufferedAddWindowMs, cancelPendingAdd, scorePoint, undoForTeam]
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      const action = getActionFromKey(event.key, bindingsRef.current)

      if (action === 'unknown') {
        return
      }

      event.preventDefault()

      switch (action) {
        case 'add-team-1':
          queueBufferedAdd('team-1')
          break
        case 'add-team-2':
          queueBufferedAdd('team-2')
          break
        case 'revert-team-1':
          cancelPendingAdd('team-1')
          void undoForTeam('team-1')
          break
        case 'revert-team-2':
          cancelPendingAdd('team-2')
          void undoForTeam('team-2')
          break
        case 'undo':
          // Undo cancels buffered adds first so a queued remote score cannot still commit
          // after the user asks to reverse the latest action.
          if (!cancelAllPendingAdds()) {
            void undo()
          }
          break
        default:
          break
      }
    },
    [cancelAllPendingAdds, cancelPendingAdd, enabled, queueBufferedAdd, undo, undoForTeam]
  )

  const onTeam1Score = useCallback(() => {
    if (!enabled) {
      return
    }

    void scorePoint('team-1')
  }, [enabled, scorePoint])

  const onTeam2Score = useCallback(() => {
    if (!enabled) {
      return
    }

    void scorePoint('team-2')
  }, [enabled, scorePoint])

  const onUndoHandler = useCallback(() => {
    if (!enabled) {
      return
    }

    void undo()
  }, [enabled, undo])

  useEffect(() => {
    // enabledRef is already current from the render body (synchronous assignment above).
    // cancelAllPendingAdds() is the important cleanup here.
    if (!enabled) {
      cancelAllPendingAdds()
      return
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [cancelAllPendingAdds, enabled, onKeyDown])

  useEffect(() => {
    return () => {
      cancelAllPendingAdds()
    }
  }, [cancelAllPendingAdds])

  return {
    scorePoint,
    undo,
    handlers: {
      onKeyDown,
      onTeam1Score,
      onTeam2Score,
      onUndo: onUndoHandler
    },
    wakeLockState: {
      isSupported: wakeLock.isSupported,
      isActive: wakeLock.isActive,
      error: wakeLock.error
    }
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}
