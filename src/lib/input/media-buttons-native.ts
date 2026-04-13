import { Capacitor } from '@capacitor/core';
import type { MatchTeamId } from '@/core/match/types';

import { actionToTeamId, mediaButtonMapping, type MediaButtonAction } from './media-buttons';

interface PluginMethod {
  (...args: unknown[]): Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callPluginMethod<T>(
  pluginName: string,
  methodName: string,
  ...args: unknown[]
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
  const cap = Capacitor as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: Record<string, unknown> = cap.Plugins ?? {};
  const plugin = plugins[pluginName];
  if (!plugin) {
    return Promise.reject(new Error(`Plugin ${pluginName} not found`));
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
  const method = (plugin as any)[methodName] as PluginMethod | undefined;
  if (!method) {
    return Promise.reject(new Error(`Method ${methodName} not found on ${pluginName}`));
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
  return method(...args) as any;
}

type MediaButtonsNativeCallback = (action: MediaButtonAction) => void;

/**
 * Listens to native media button events on Android/iOS.
 * Returns a cleanup function that removes the listener.
 */
export function listenToNativeMediaButtons(callback: MediaButtonsNativeCallback): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
  const cap = Capacitor as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: Record<string, unknown> = cap.Plugins ?? {};
  const plugin = plugins['MediaButtons'];

  if (!plugin) {
    console.warn('[MediaButtons] Native plugin not available');
    return () => {};
  }

  // Store the callback to avoid it being garbage collected
  const storedCallback = callback;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
  const subscription = (plugin as any)
    .addListener('mediaButton', (event: { buttonId: string }) => {
      const action = mediaButtonMapping[event.buttonId];

      if (action) {
        storedCallback(action);
      }
    })
    .catch((error: unknown) => {
      console.warn('[MediaButtons] Failed to register native media button listener:', error);
      return null;
    });

  // Return cleanup function
  return () => {
    subscription
      .then((sub: { remove: () => void }) => {
        return sub.remove();
      })
      .catch(() => {
        // Ignore cleanup errors
      });
  };
}

/**
 * Dispatches a media button action to the native layer (for debugging/testing).
 */
export async function dispatchNativeMediaButton(buttonId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await callPluginMethod('MediaButtons', 'dispatchButton', { buttonId });
  } catch (error) {
    console.warn('[MediaButtons] Failed to dispatch native button:', error);
  }
}

/**
 * Maps a buttonId to the team ID for scoring/reverting.
 */
export function buttonIdToTeamId(buttonId: string): MatchTeamId | null {
  const action = mediaButtonMapping[buttonId];

  if (!action) {
    return null;
  }

  return actionToTeamId(action);
}
