import { useState, useEffect, useMemo } from 'react'

interface UseMatchTimerOptions {
  startedAt: number | null
  finishedAt?: number
  isMatchCompleted: boolean
}

interface UseMatchTimerReturn {
  elapsedSeconds: number
  formattedTime: string
  isRunning: boolean
}

/**
 * Hook to manage match timer with persistence across page refreshes.
 * Calculates elapsed time from startedAt timestamp and formats it for display.
 */
export function useMatchTimer(options: UseMatchTimerOptions): UseMatchTimerReturn {
  const { startedAt, finishedAt, isMatchCompleted } = options

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (startedAt === null || isMatchCompleted) {
      return
    }

    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [startedAt, isMatchCompleted])

  const elapsedSeconds = useMemo(() => {
    if (startedAt === null) {
      return 0
    }
    const endTimestamp = isMatchCompleted && typeof finishedAt === 'number' ? finishedAt : now

    return Math.max(0, Math.floor((endTimestamp - startedAt) / 1000))
  }, [finishedAt, isMatchCompleted, now, startedAt])

  const formattedTime = useMemo(() => {
    if (startedAt === null) {
      return '0 min'
    }

    const totalMinutes = Math.floor(elapsedSeconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }, [elapsedSeconds, startedAt])

  return {
    elapsedSeconds,
    formattedTime,
    isRunning: startedAt !== null && !isMatchCompleted
  }
}
