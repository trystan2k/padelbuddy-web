'use client';

import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useRef } from 'react';

import type { MatchAction, MatchTeamId } from '@/core/match/types';

import {
  actionToTeamId,
  isAddAction,
  mediaButtonMapping,
  type MediaButtonAction
} from './media-buttons';
import { listenToNativeMediaButtons } from './media-buttons-native';
import { type UseWakeLockReturn, useWakeLock } from './wake-lock';

interface UseMediaButtonsRemoteOptions {
  actions: MatchAction[];
  enabled?: boolean;
  useWakeLock?: boolean;
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
  const { actions, enabled = true, useWakeLock: useWakeLockEnabled = false } = options;

  const callbacksRef = useRef(callbacks);
  const actionsRef = useRef(actions);
  const enabledRef = useRef(enabled);

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

  const handleMediaButtonAction = useCallback(
    (action: MediaButtonAction) => {
      if (!enabledRef.current) {
        return;
      }

      const teamId = actionToTeamId(action);

      if (isAddAction(action)) {
        invokeCallbackSafely(callbacksRef.current.onAdd, teamId);
      } else {
        // MatchAction is currently ScorePointAction only; guard is future-proof if new action types are added
        const hasScoringAction = actionsRef.current.some(
          (a) => a.type === 'score-point' && a.teamId === teamId
        );

        if (!hasScoringAction) {
          return;
        }

        invokeCallbackSafely(callbacksRef.current.onUndoForTeam, teamId);
      }
    },
    [invokeCallbackSafely]
  );

  const onMediaButtonPress = useCallback(
    (buttonId: string) => {
      const action = mediaButtonMapping[buttonId];

      if (action) {
        handleMediaButtonAction(action);
      }
    },
    [handleMediaButtonAction]
  );

  // Set up MediaSession handlers for nexttrack/previoustrack on the Web platform
  // Note: volumeup/volumedown are NOT valid MediaSessionAction values, they only come through DOM keydown
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof navigator === 'undefined') {
      return;
    }

    // Skip registration when disabled to avoid claiming media key events
    // that the OS may still want to handle
    if (!enabled) {
      return;
    }

    const mediaSession = navigator.mediaSession;

    if (!mediaSession) {
      return;
    }

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
    };
  }, [enabled, onMediaButtonPress]);

  // Native platform media button listener (Android/iOS via Capacitor plugin)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Skip registration when disabled to avoid capturing events we shouldn't handle
    if (!enabled) {
      return;
    }

    const handleNativeButtonAction = (action: MediaButtonAction) => {
      handleMediaButtonAction(action);
    };

    const cleanup = listenToNativeMediaButtons(handleNativeButtonAction);

    return cleanup;
  }, [enabled, handleMediaButtonAction]);

  // DOM keydown fallback for media keys (including volumeup/volumedown which aren't MediaSession actions)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
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

      // Map DOM key values to button IDs
      let buttonId: string | undefined;

      switch (event.code) {
        case 'VolumeUp':
          buttonId = 'media-volume-up';
          break;
        case 'VolumeDown':
          buttonId = 'media-volume-down';
          break;
        case 'MediaTrackNext':
          buttonId = 'media-track-next';
          break;
        case 'MediaTrackPrevious':
          buttonId = 'media-track-previous';
          break;
      }

      if (buttonId) {
        event.preventDefault();
        onMediaButtonPress(buttonId);
      }
    };

    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onMediaButtonPress]);

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
