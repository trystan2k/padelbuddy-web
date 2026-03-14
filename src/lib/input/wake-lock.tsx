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

  const isSupportedValue =
    typeof navigator !== 'undefined' && typeof navigator.wakeLock?.request === 'function'
  const [isSupported] = useState(() => isSupportedValue)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const isMountedRef = useRef(true)

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

      const handleRelease = () => {
        if (isMountedRef.current) {
          setIsActive(false)
        }
        wakeLockRef.current = null
      }

      wakeLock.addEventListener('release', handleRelease)
      if (isMountedRef.current) {
        setIsActive(true)
        setError(null)
      }
    } catch (err) {
      const wakeLockError = err instanceof Error ? err : new Error(String(err))
      if (isMountedRef.current) {
        setError(wakeLockError)
      }
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
        if (isMountedRef.current) {
          setIsActive(false)
        }
        wakeLockRef.current = null
      } catch (err) {
        const releaseError = err instanceof Error ? err : new Error(String(err))
        console.warn('Wake Lock release failed:', releaseError.message)
        if (isMountedRef.current) {
          setIsActive(false)
          setError(releaseError)
        }
        if (onError) {
          onError(releaseError)
        }
        wakeLockRef.current = null
      }
    }
  }, [onError])

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
      isMountedRef.current = false
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
