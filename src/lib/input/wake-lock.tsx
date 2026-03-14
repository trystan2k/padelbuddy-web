'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseWakeLockOptions {
  enabled?: boolean
  onError?: (error: Error) => void
}

export interface UseWakeLockReturn {
  isSupported: boolean
  isActive: boolean
  error: Error | null
  request: () => Promise<void>
  release: () => Promise<void>
}

export function useWakeLock(options: UseWakeLockOptions = {}): UseWakeLockReturn {
  const { enabled = true, onError } = options

  const isSupportedValue = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [isSupported] = useState(() => isSupportedValue)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if (!isSupportedValue) {
      console.warn('Wake Lock API is not supported in this browser')
      return
    }

    if (wakeLockRef.current) {
      return
    }

    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      wakeLockRef.current = wakeLock
      setIsActive(true)
      setError(null)

      wakeLock.addEventListener('release', () => {
        setIsActive(false)
      })
    } catch (err) {
      const wakeLockError = err instanceof Error ? err : new Error(String(err))
      setError(wakeLockError)
      if (onError) {
        onError(wakeLockError)
      }
      console.warn('Wake Lock request failed:', wakeLockError.message)
    }
  }, [isSupportedValue, onError])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsActive(false)
      } catch (err) {
        const releaseError = err instanceof Error ? err : new Error(String(err))
        console.warn('Wake Lock release failed:', releaseError.message)
        wakeLockRef.current = null
        setIsActive(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!isSupportedValue || !enabled) {
      return
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        await requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSupportedValue, enabled, requestWakeLock])

  useEffect(() => {
    if (enabled && isSupportedValue) {
      void requestWakeLock()
    } else if (!enabled && wakeLockRef.current) {
      void releaseWakeLock()
    }
  }, [enabled, isSupportedValue, requestWakeLock, releaseWakeLock])

  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
          // Silently ignore cleanup errors
        })
        wakeLockRef.current = null
      }
    }
  }, [])

  return {
    isSupported,
    isActive,
    error,
    request: requestWakeLock,
    release: releaseWakeLock
  }
}
