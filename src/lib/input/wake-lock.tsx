'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import wakeLockManager from './wake-lock-manager';

export async function requestScreenWakeLock(): Promise<WakeLockSentinel | null> {
  if (!wakeLockManager.isSupported()) {
    console.warn('Wake Lock API is not supported in this browser');
    return null;
  }

  try {
    return await wakeLockManager.request();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.warn('Wake Lock request failed:', error.message);
    return null;
  }
}

export function _resetWakeLockManager(): void {
  wakeLockManager.reset();
}

interface UseWakeLockOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  error: Error | null;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(options: UseWakeLockOptions = {}): UseWakeLockReturn {
  const { enabled = true, onError } = options;

  const isSupportedValue = wakeLockManager.isSupported();
  const [isSupported] = useState(() => isSupportedValue);
  const [isActive, setIsActive] = useState(() => wakeLockManager.isActive());
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);
  const enabledRef = useRef(enabled);
  const ownsWakeLockRef = useRef(false);

  // Keep the ref in sync with the latest enabled value
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const requestWakeLock = useCallback(async () => {
    if (!isSupportedValue) {
      console.warn('Wake Lock API is not supported in this browser');
      return;
    }

    if (wakeLockManager.isActive()) {
      if (isMountedRef.current) {
        setIsActive(true);
        setError(null);
      }
      return;
    }

    try {
      const wakeLock = await wakeLockManager.request();

      if (!enabledRef.current && wakeLock) {
        ownsWakeLockRef.current = true;
        await wakeLockManager.release();
        ownsWakeLockRef.current = false;
        return;
      }

      ownsWakeLockRef.current = wakeLock !== null;

      if (isMountedRef.current) {
        setIsActive(wakeLockManager.isActive());
        setError(null);
      }
    } catch (err) {
      const wakeLockError = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) {
        setError(wakeLockError);
      }
      onError?.(wakeLockError);
      console.warn('Wake Lock request failed:', wakeLockError.message);
    }
  }, [isSupportedValue, onError]);

  const releaseWakeLock = useCallback(async () => {
    if (!ownsWakeLockRef.current || !wakeLockManager.isActive()) {
      return;
    }

    try {
      await wakeLockManager.release();
      ownsWakeLockRef.current = false;
      if (isMountedRef.current) {
        setIsActive(false);
      }
    } catch (err) {
      const releaseError = err instanceof Error ? err : new Error(String(err));
      console.warn('Wake Lock release failed:', releaseError.message);
      if (isMountedRef.current) {
        setIsActive(false);
        setError(releaseError);
      }
      onError?.(releaseError);
    }
  }, [onError]);

  useEffect(() => {
    return wakeLockManager.subscribe(() => {
      if (!wakeLockManager.isActive()) {
        ownsWakeLockRef.current = false;
      }

      if (isMountedRef.current) {
        setIsActive(wakeLockManager.isActive());
      }
    });
  }, []);

  useEffect(() => {
    if (!isSupportedValue || !enabled) {
      return undefined;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLockManager.isActive()) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupportedValue, enabled, requestWakeLock]);

  useEffect(() => {
    if (enabled && isSupportedValue) {
      void requestWakeLock();
    } else if (!enabled && ownsWakeLockRef.current && wakeLockManager.isActive()) {
      void releaseWakeLock();
    }
  }, [enabled, isSupportedValue, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (ownsWakeLockRef.current && wakeLockManager.isActive()) {
        wakeLockManager.release().catch(() => {
          // Silently ignore cleanup errors
        });
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    error,
    request: requestWakeLock,
    release: releaseWakeLock
  };
}
