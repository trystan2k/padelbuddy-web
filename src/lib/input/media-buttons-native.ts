import { Capacitor } from '@capacitor/core';
interface PluginMethod {
  (...args: unknown[]): Promise<unknown>;
}

interface MediaButtonsPluginEvent {
  buttonId: string;
}

interface MediaButtonsListenerHandle {
  remove: () => Promise<void> | void;
}

function buttonIdToTeamId(buttonId: string): 'team-1' | 'team-2' | null {
  switch (buttonId) {
    case 'media-track-previous':
      return 'team-1';
    case 'media-track-next':
      return 'team-2';
    default:
      return null;
  }
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

type MediaButtonsNativeCallback = (buttonId: string) => void;

async function startNativeMediaButtonsListening(): Promise<void> {
  await callPluginMethod('MediaButtons', 'startListening');
}

async function stopNativeMediaButtonsListening(): Promise<void> {
  await callPluginMethod('MediaButtons', 'stopListening');
}

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

  let listenerHandle: MediaButtonsListenerHandle | null = null;
  let listenerHandlePromise: Promise<MediaButtonsListenerHandle> | null = null;
  let disposed = false;
  let listenerRemoved = false;

  const removeListenerOnce = (handle: MediaButtonsListenerHandle | null): void => {
    if (!handle || listenerRemoved) {
      return;
    }

    listenerRemoved = true;

    try {
      void Promise.resolve(handle.remove()).catch(() => {
        // Ignore cleanup errors
      });
    } catch {
      // Ignore cleanup errors
    }
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
    const listenerResult = (plugin as any).addListener(
      'mediaButton',
      (event: MediaButtonsPluginEvent) => {
        const teamId = buttonIdToTeamId(event.buttonId);
        if (teamId === null) {
          return;
        }
        storedCallback(event.buttonId);
      }
    ) as MediaButtonsListenerHandle | Promise<MediaButtonsListenerHandle>;

    listenerHandlePromise = Promise.resolve(listenerResult);

    void listenerHandlePromise
      .then((handle) => {
        listenerHandlePromise = null;

        if (disposed) {
          removeListenerOnce(handle);
          return;
        }

        listenerHandle = handle;
        return;
      })
      .catch((error: unknown) => {
        console.warn('[MediaButtons] Failed to register native media button listener:', error);
      });
  } catch (error) {
    console.warn('[MediaButtons] Failed to register native media button listener:', error);
  }

  void startNativeMediaButtonsListening().catch((error: unknown) => {
    console.warn('[MediaButtons] Failed to start native media button listener:', error);
  });

  // Return cleanup function
  return () => {
    disposed = true;

    removeListenerOnce(listenerHandle);

    if (!listenerHandle) {
      void listenerHandlePromise?.then((handle) => {
        removeListenerOnce(handle);
        return;
      });
    }

    void stopNativeMediaButtonsListening().catch(() => {
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

export { buttonIdToTeamId };
