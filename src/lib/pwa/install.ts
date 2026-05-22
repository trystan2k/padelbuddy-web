import { useEffect, useRef, useState } from 'react';

export const pwaInstallBannerDismissedStorageKey = 'padelbuddy_pwa_install_banner_dismissed';

export type PwaInstallOutcome = 'accepted' | 'dismissed';
export type PwaInstallBannerMode = 'native_prompt' | 'manual_ios';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: PwaInstallOutcome; platform: string }>;
  prompt(): Promise<{ outcome: PwaInstallOutcome; platform: string }>;
}

function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return 'prompt' in event && typeof event.prompt === 'function';
}

function getWindow(): Window | undefined {
  return typeof window === 'undefined' ? undefined : window;
}

function getNavigator(): (Navigator & { standalone?: boolean }) | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator;
}

function getUserAgent(): string {
  return getNavigator()?.userAgent ?? '';
}

export function isIosDevice(): boolean {
  const currentNavigator = getNavigator();

  if (!currentNavigator) {
    return false;
  }

  const platform = currentNavigator.platform ?? '';
  const maxTouchPoints = currentNavigator.maxTouchPoints ?? 0;

  return /iPad|iPhone|iPod/.test(getUserAgent()) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function supportsManualPwaInstallInstructions(): boolean {
  return isIosDevice() && !isPwaInstalled();
}

export function isPwaInstalled(): boolean {
  const currentWindow = getWindow();
  const currentNavigator = getNavigator();
  const standaloneDisplayMode =
    typeof currentWindow?.matchMedia === 'function'
      ? currentWindow.matchMedia('(display-mode: standalone)').matches
      : false;

  if (!currentWindow) {
    return false;
  }

  return standaloneDisplayMode || currentNavigator?.standalone === true;
}

export function hasPwaInstallBannerBeenDismissed(): boolean {
  try {
    const storedValue = localStorage.getItem(pwaInstallBannerDismissedStorageKey);
    return storedValue === 'true' || storedValue === '1';
  } catch {
    return true;
  }
}

export function markPwaInstallBannerDismissed(): void {
  try {
    localStorage.setItem(pwaInstallBannerDismissedStorageKey, 'true');
  } catch {}
}

export function clearPwaInstallBannerDismissed(): void {
  try {
    localStorage.removeItem(pwaInstallBannerDismissedStorageKey);
  } catch {}
}

export async function promptPwaInstall(
  promptEvent: BeforeInstallPromptEvent
): Promise<PwaInstallOutcome> {
  const result = await promptEvent.prompt();
  return result.outcome;
}

interface UsePwaInstallPromptResult {
  mode: PwaInstallBannerMode | null;
  isVisible: boolean;
  isInstalling: boolean;
  dismissBanner: () => void;
  promptInstall: () => Promise<void>;
}

export function usePwaInstallPrompt(): UsePwaInstallPromptResult {
  const promptEventRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<PwaInstallBannerMode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const currentWindow = getWindow();

    if (
      !currentWindow ||
      typeof currentWindow.addEventListener !== 'function' ||
      typeof currentWindow.removeEventListener !== 'function' ||
      isPwaInstalled() ||
      hasPwaInstallBannerBeenDismissed()
    ) {
      return undefined;
    }

    if (supportsManualPwaInstallInstructions()) {
      setMode('manual_ios');
      setIsVisible(true);
      return undefined;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }

      if (isPwaInstalled() || hasPwaInstallBannerBeenDismissed()) {
        return;
      }

      promptEventRef.current = event;
      setMode('native_prompt');
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      promptEventRef.current = null;
      setMode(null);
      clearPwaInstallBannerDismissed();
      setIsVisible(false);
      setIsInstalling(false);
    };

    currentWindow.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    currentWindow.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      currentWindow.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      currentWindow.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissBanner = () => {
    promptEventRef.current = null;
    setMode(null);
    markPwaInstallBannerDismissed();
    setIsVisible(false);
  };

  const promptInstall = async () => {
    const promptEvent = promptEventRef.current;

    if (!promptEvent) {
      return;
    }

    promptEventRef.current = null;
    setIsInstalling(true);

    try {
      const outcome = await promptPwaInstall(promptEvent);

      if (outcome === 'accepted') {
        clearPwaInstallBannerDismissed();
      } else {
        markPwaInstallBannerDismissed();
      }

      setMode(null);
      setIsVisible(false);
    } finally {
      setIsInstalling(false);
    }
  };

  return {
    mode,
    isVisible,
    isInstalling,
    dismissBanner,
    promptInstall
  };
}
