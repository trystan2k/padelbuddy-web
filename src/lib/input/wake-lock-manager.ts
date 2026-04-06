'use client';

export interface WakeLockManager {
  isActive(): boolean;
  isSupported(): boolean;
  request(): Promise<WakeLockSentinel | null>;
  release(): Promise<void>;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

const isSupported = () =>
  typeof navigator !== 'undefined' && typeof navigator.wakeLock?.request === 'function';

export function createWakeLockManager(): WakeLockManager {
  let wakeLock: WakeLockSentinel | null = null;
  let pendingRequest: Promise<WakeLockSentinel | null> | null = null;
  const listeners = new Set<() => void>();

  const emitChange = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const detachWakeLock = () => {
    if (wakeLock) {
      wakeLock.removeEventListener('release', handleRelease);
      wakeLock = null;
      emitChange();
    }
  };

  const handleRelease = () => {
    detachWakeLock();
  };

  return {
    isActive() {
      return wakeLock !== null;
    },
    isSupported() {
      return isSupported();
    },
    async request() {
      if (wakeLock) {
        return wakeLock;
      }

      if (!isSupported()) {
        return null;
      }

      if (pendingRequest) {
        return pendingRequest;
      }

      pendingRequest = (async () => {
        const nextWakeLock = await navigator.wakeLock.request('screen');

        wakeLock = nextWakeLock;
        wakeLock.addEventListener('release', handleRelease);
        emitChange();

        return nextWakeLock;
      })();

      try {
        return await pendingRequest;
      } finally {
        pendingRequest = null;
      }
    },
    async release() {
      if (!wakeLock) {
        return;
      }

      const activeWakeLock = wakeLock;

      try {
        await activeWakeLock.release();
      } finally {
        detachWakeLock();
      }
    },
    reset() {
      pendingRequest = null;
      detachWakeLock();
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  };
}

const wakeLockManager = createWakeLockManager();

export default wakeLockManager;
