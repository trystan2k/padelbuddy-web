'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

let moduleWakeLockRef: WakeLockSentinel | null = null

export async function requestScreenWakeLock(): Promise<WakeLockSentinel | null> {
  if (moduleWakeLockRef) {
    return moduleWakeLockRef
  }

  if (typeof navigator === 'undefined' || !navigator.wakeLock) {
    console.warn('Wake Lock API is not supported in this browser')
    return null
  }

  try {
    const wakeLock = await navigator.wakeLock.request('screen')
    moduleWakeLockRef = wakeLock

    wakeLock.addEventListener('release', () => {
      moduleWakeLockRef = null
    })

    return wakeLock
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.warn('Wake Lock request failed:', error.message)
    return null
  }
}

export function isScreenWakeLockActive(): boolean {
  return moduleWakeLockRef !== null
}

export function _resetModuleWakeLockRef(): void {
  moduleWakeLockRef = null
}

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
  const pendingRequestRef = useRef<Promise<WakeLockSentinel | null> | null>(null)
  const isMountedRef = useRef(true)
  const enabledRef = useRef(enabled)

  // Keep the ref in sync with the latest enabled value
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const requestWakeLock = useCallback(async () => {
    if (!isSupportedValue) {
      console.warn('Wake Lock API is not supported in this browser')
      return
    }

    if (wakeLockRef.current || moduleWakeLockRef) {
      if (isMountedRef.current) {
        setIsActive(true)
        setError(null)
      }
      return
    }

    // Guard against concurrent requests
    if (pendingRequestRef.current) {
      await pendingRequestRef.current
      return
    }

    const requestPromise = (async () => {
      try {
        const wakeLock = await navigator.wakeLock.request('screen')

        // Re-check enabled after the await to handle race condition
        if (!enabledRef.current) {
          await wakeLock.release()
          return null
        }

        wakeLockRef.current = wakeLock
        moduleWakeLockRef = wakeLock

        const handleRelease = () => {
          if (isMountedRef.current) {
            setIsActive(false)
          }
          wakeLockRef.current = null
          moduleWakeLockRef = null
        }

        wakeLock.addEventListener('release', handleRelease)
        if (isMountedRef.current) {
          setIsActive(true)
          setError(null)
        }
        return wakeLock
      } catch (err) {
        const wakeLockError = err instanceof Error ? err : new Error(String(err))
        if (isMountedRef.current) {
          setError(wakeLockError)
        }
        if (onError) {
          onError(wakeLockError)
        }
        console.warn('Wake Lock request failed:', wakeLockError.message)
        return null
      }
    })()

    pendingRequestRef.current = requestPromise
    await requestPromise
    pendingRequestRef.current = null
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
