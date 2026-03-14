'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { MatchTeamId } from '@/core/match'
import type { CurrentMatchSession } from '@/lib/current-match/session'
import { getActionFromKey, type KeyboardAction } from './keyboard-aliases'
import { createDebounce } from './debounce'
import { useWakeLock, type UseWakeLockReturn } from './wake-lock'

export interface UseInputHandlerOptions {
  session: CurrentMatchSession
  enabled?: boolean
  useWakeLock?: boolean
}

export interface UseInputHandlerCallbacks {
  onScore?: (teamId: MatchTeamId) => void
  onUndo?: () => void
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
  callbacks?: UseInputHandlerCallbacks
): UseInputHandlerReturn {
  const { session, enabled = true, useWakeLock: useWakeLockEnabled = false } = options

  const debounceRef = useRef(createDebounce({ delay: 300 }))
  const callbacksRef = useRef<UseInputHandlerCallbacks | undefined>(callbacks)
  const sessionRef = useRef(session)

  callbacksRef.current = callbacks
  sessionRef.current = session

  useEffect(() => {
    const debounce = debounceRef.current
    return () => {
      debounce.cleanup()
    }
  }, [])

  const onWakeLockError = useCallback((error: Error) => {
    callbacksRef.current?.onError?.(error)
  }, [])

  const wakeLock = useWakeLock({
    enabled: useWakeLockEnabled && enabled,
    onError: onWakeLockError
  })

  const scorePoint = useCallback(async (teamId: MatchTeamId) => {
    try {
      await sessionRef.current.scorePoint(teamId)
      callbacksRef.current?.onScore?.(teamId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      callbacksRef.current?.onError?.(error)
    }
  }, [])

  const undo = useCallback(async () => {
    try {
      await sessionRef.current.undoScoreAction()
      callbacksRef.current?.onUndo?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      callbacksRef.current?.onError?.(error)
    }
  }, [])

  const handleAction = useCallback(
    (action: KeyboardAction) => {
      switch (action) {
        case 'score-team-1':
          if (debounceRef.current?.isReady()) {
            debounceRef.current.trigger()
            void scorePoint('team-1')
          }
          break
        case 'score-team-2':
          if (debounceRef.current?.isReady()) {
            debounceRef.current.trigger()
            void scorePoint('team-2')
          }
          break
        case 'undo':
          void undo()
          break
        case 'unknown':
        default:
          break
      }
    },
    [scorePoint, undo]
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return
      }

      // Don't handle keys when modifier keys are pressed to avoid breaking browser shortcuts
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      const action = getActionFromKey(event.key)

      // Prevent default browser behavior for handled keys to avoid navigation/scrolling
      if (action !== 'unknown') {
        event.preventDefault()
      }

      handleAction(action)
    },
    [enabled, handleAction]
  )

  const onTeam1Score = useCallback(() => {
    if (!enabled) return
    if (debounceRef.current?.isReady()) {
      debounceRef.current.trigger()
      void scorePoint('team-1')
    }
  }, [enabled, scorePoint])

  const onTeam2Score = useCallback(() => {
    if (!enabled) return
    if (debounceRef.current?.isReady()) {
      debounceRef.current.trigger()
      void scorePoint('team-2')
    }
  }, [enabled, scorePoint])

  const onUndoHandler = useCallback(() => {
    if (!enabled) return
    void undo()
  }, [enabled, undo])

  useEffect(() => {
    if (!enabled) {
      return
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [enabled, onKeyDown])

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
