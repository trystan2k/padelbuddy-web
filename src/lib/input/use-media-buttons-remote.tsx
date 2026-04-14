'use client';

import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useRef } from 'react';

import type { MatchAction, MatchTeamId } from '@/core/match/types';

import { getMediaButtonIdFromKeyboardInput } from './media-buttons';
import { listenToNativeMediaButtons } from './media-buttons-native';
import { type UseWakeLockReturn, useWakeLock } from './wake-lock';
import { activateWebMediaSession, clearWebMediaSession } from './web-media-session';

interface UseMediaButtonsRemoteOptions {
  actions: MatchAction[];
  enabled?: boolean;
  useWakeLock?: boolean;
  bufferedAddWindowMs?: number;
}

interface UseMediaButtonsRemoteCallbacks {
  onAdd: (teamId: MatchTeamId) => Promise<void> | void;
  onUndoForTeam: (teamId: MatchTeamId) => Promise<void> | void;
  onError?: (error: Error) => void;
}

interface UseMediaButtonsRemoteReturn {
  handlers: {
    onMediaButtonPress: (buttonId: string) => void;
  };
  wakeLockState: Pick<UseWakeLockReturn, 'isSupported' | 'isActive' | 'error'>;
}

function getTeamIdFromTrackButton(buttonId: string): MatchTeamId | null {
  switch (buttonId) {
    case 'media-track-previous':
      return 'team-1';
    case 'media-track-next':
      return 'team-2';
    default:
      return null;
  }
}

/**
 * Web Media Session + DOM key fallback hook for media button remote controls.
 * This hook owns:
 * - Web MediaSession activation/cleanup via navigator.mediaSession (for nexttrack/previoustrack)
 * - DOM keydown fallback for audio/media keys emitted by browsers or Bluetooth remotes
 * - Independent lifecycle from audio announcements
 */
export function useMediaButtonsRemote(
  options: UseMediaButtonsRemoteOptions,
  callbacks: UseMediaButtonsRemoteCallbacks
): UseMediaButtonsRemoteReturn {
  const {
    actions,
    enabled = true,
    useWakeLock: useWakeLockEnabled = false,
    bufferedAddWindowMs = 600
  } = options;

  const callbacksRef = useRef(callbacks);
  const actionsRef = useRef(actions);
  const enabledRef = useRef(enabled);
  const pendingAddTimersRef = useRef<Record<MatchTeamId, ReturnType<typeof setTimeout> | null>>({
    'team-1': null,
    'team-2': null
  });

  callbacksRef.current = callbacks;
  actionsRef.current = actions;
  enabledRef.current = enabled;

  const onWakeLockError = useCallback((error: Error) => {
    callbacksRef.current.onError?.(error);
  }, []);

  const wakeLock = useWakeLock({
    enabled: useWakeLockEnabled && enabled,
    onError: onWakeLockError
  });

  const invokeCallbackSafely = useCallback(
    (callback: (teamId: MatchTeamId) => Promise<void> | void, teamId: MatchTeamId) => {
      try {
        const result = callback(teamId);
        if (result instanceof Promise) {
          result.catch((error) => {
            callbacksRef.current.onError?.(
              error instanceof Error ? error : new Error(String(error))
            );
          });
        }
      } catch (error) {
        callbacksRef.current.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    },
    []
  );

  const undoForTeamIfPossible = useCallback(
    (teamId: MatchTeamId) => {
      const hasScoringAction = actionsRef.current.some(
        (action) => action.type === 'score-point' && action.teamId === teamId
      );

      if (!hasScoringAction) {
        return;
      }

      invokeCallbackSafely(callbacksRef.current.onUndoForTeam, teamId);
    },
    [invokeCallbackSafely]
  );

  const cancelPendingAdd = useCallback((teamId: MatchTeamId): boolean => {
    const timer = pendingAddTimersRef.current[teamId];

    if (timer === null) {
      return false;
    }

    clearTimeout(timer);
    pendingAddTimersRef.current[teamId] = null;
    return true;
  }, []);

  const cancelAllPendingAdds = useCallback(() => {
    cancelPendingAdd('team-1');
    cancelPendingAdd('team-2');
  }, [cancelPendingAdd]);

  const queueBufferedAdd = useCallback(
    (teamId: MatchTeamId) => {
      if (pendingAddTimersRef.current[teamId]) {
        cancelPendingAdd(teamId);
        undoForTeamIfPossible(teamId);
        return;
      }

      pendingAddTimersRef.current[teamId] = setTimeout(() => {
        pendingAddTimersRef.current[teamId] = null;

        if (!enabledRef.current) {
          return;
        }

        invokeCallbackSafely(callbacksRef.current.onAdd, teamId);
      }, bufferedAddWindowMs);
    },
    [bufferedAddWindowMs, cancelPendingAdd, invokeCallbackSafely, undoForTeamIfPossible]
  );

  const onMediaButtonPress = useCallback(
    (buttonId: string) => {
      if (!enabledRef.current) {
        return;
      }

      const teamId = getTeamIdFromTrackButton(buttonId);

      if (!teamId) {
        return;
      }

      queueBufferedAdd(teamId);
    },
    [queueBufferedAdd]
  );

  // Set up MediaSession handlers for nexttrack/previoustrack on the Web platform
  // Note: volumeup/volumedown are NOT valid MediaSessionAction values, they only come through DOM keydown
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (typeof navigator === 'undefined') {
      return undefined;
    }

    // Skip registration when disabled to avoid claiming media key events
    // that the OS may still want to handle
    if (!enabled) {
      return undefined;
    }

    const mediaSession = navigator.mediaSession;

    if (!mediaSession) {
      return undefined;
    }

    activateWebMediaSession();

    // Only 'nexttrack' and 'previoustrack' are valid MediaSessionAction values
    const supportedActions: Array<'nexttrack' | 'previoustrack'> = ['nexttrack', 'previoustrack'];

    const handleAction = (details: MediaSessionActionDetails) => {
      if (!enabledRef.current) {
        return;
      }

      let buttonId: string | undefined;

      switch (details.action) {
        case 'nexttrack':
          buttonId = 'media-track-next';
          break;
        case 'previoustrack':
          buttonId = 'media-track-previous';
          break;
      }

      if (buttonId) {
        onMediaButtonPress(buttonId);
      }
    };

    // Register MediaSession action handlers
    for (const action of supportedActions) {
      try {
        mediaSession.setActionHandler(action, handleAction);
      } catch {
        // Some actions may not be supported; ignore errors
      }
    }

    return () => {
      // Clean up action handlers by setting to null when disabled or unmounting
      for (const action of supportedActions) {
        try {
          mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore cleanup errors
        }
      }

      clearWebMediaSession();
    };
  }, [enabled, onMediaButtonPress]);

  // Native platform media button listener (Android/iOS via Capacitor plugin)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!Capacitor.isNativePlatform()) {
      return undefined;
    }

    // Skip registration when disabled to avoid capturing events we shouldn't handle
    if (!enabled) {
      return undefined;
    }

    const cleanup = listenToNativeMediaButtons(onMediaButtonPress);

    return cleanup;
  }, [enabled, onMediaButtonPress]);

  // DOM keydown fallback for media keys supported by getMediaButtonIdFromKeyboardInput
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const buttonId =
        getMediaButtonIdFromKeyboardInput(event.code) ??
        getMediaButtonIdFromKeyboardInput(event.key);

      if (buttonId) {
        event.preventDefault();
        onMediaButtonPress(buttonId);
      }
    };

    if (enabled) {
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, onMediaButtonPress]);

  useEffect(() => {
    if (enabled) {
      return;
    }

    cancelAllPendingAdds();
  }, [cancelAllPendingAdds, enabled]);

  useEffect(() => {
    return () => {
      cancelAllPendingAdds();
    };
  }, [cancelAllPendingAdds]);

  return {
    handlers: {
      onMediaButtonPress
    },
    wakeLockState: {
      isSupported: wakeLock.isSupported,
      isActive: wakeLock.isActive,
      error: wakeLock.error
    }
  };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}
