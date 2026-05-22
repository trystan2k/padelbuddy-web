import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function importInstallModule() {
  return import('@/lib/pwa/install');
}

function createStorageMock() {
  const storage = new Map<string, string>();

  return {
    getItem: vi.fn<(key: string) => string | null>((key) => storage.get(key) ?? null),
    setItem: vi.fn<(key: string, value: string) => void>((key, value) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn<(key: string) => void>((key) => {
      storage.delete(key);
    }),
    clear: vi.fn<() => void>(() => {
      storage.clear();
    })
  };
}

describe('PWA install module', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('localStorage', createStorageMock());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('detects standalone display mode as installed', async () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn<(query: string) => MediaQueryList>().mockReturnValue({
        matches: true
      } as MediaQueryList)
    });
    vi.stubGlobal('navigator', {});

    const { isPwaInstalled } = await importInstallModule();

    expect(isPwaInstalled()).toBe(true);
  });

  it('returns false for installed state when no browser globals exist', async () => {
    const { isPwaInstalled } = await importInstallModule();

    expect(isPwaInstalled()).toBe(false);
  });

  it('detects iOS standalone flag as installed', async () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn<(query: string) => MediaQueryList>().mockReturnValue({
        matches: false
      } as MediaQueryList)
    });
    vi.stubGlobal('navigator', { standalone: true });

    const { isPwaInstalled } = await importInstallModule();

    expect(isPwaInstalled()).toBe(true);
  });

  it('does not detect non-iOS devices as manual install candidates', async () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn<(query: string) => MediaQueryList>().mockReturnValue({
        matches: false
      } as MediaQueryList)
    });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
      platform: 'Linux armv8l',
      maxTouchPoints: 5
    });

    const { isIosDevice, supportsManualPwaInstallInstructions } = await importInstallModule();

    expect(isIosDevice()).toBe(false);
    expect(supportsManualPwaInstallInstructions()).toBe(false);
  });

  it('detects iPhone browsers for manual install instructions', async () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn<(query: string) => MediaQueryList>().mockReturnValue({
        matches: false
      } as MediaQueryList)
    });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5
    });

    const { isIosDevice, supportsManualPwaInstallInstructions } = await importInstallModule();

    expect(isIosDevice()).toBe(true);
    expect(supportsManualPwaInstallInstructions()).toBe(true);
  });

  it('detects iPadOS desktop-class user agents for manual instructions', async () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn<(query: string) => MediaQueryList>().mockReturnValue({
        matches: false
      } as MediaQueryList)
    });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'MacIntel',
      maxTouchPoints: 5
    });

    const { isIosDevice, supportsManualPwaInstallInstructions } = await importInstallModule();

    expect(isIosDevice()).toBe(true);
    expect(supportsManualPwaInstallInstructions()).toBe(true);
  });

  it('does not show manual instructions when the iOS app is already installed', async () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn<(query: string) => MediaQueryList>().mockReturnValue({
        matches: true
      } as MediaQueryList)
    });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5
    });

    const { supportsManualPwaInstallInstructions } = await importInstallModule();

    expect(supportsManualPwaInstallInstructions()).toBe(false);
  });

  it('treats storage access failure as dismissed', async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>(() => {
        throw new Error('blocked');
      }),
      setItem: vi.fn<(key: string, value: string) => void>(),
      removeItem: vi.fn<(key: string) => void>(),
      clear: vi.fn<() => void>()
    });

    const { hasPwaInstallBannerBeenDismissed } = await importInstallModule();

    expect(hasPwaInstallBannerBeenDismissed()).toBe(true);
  });

  it('accepts legacy truthy dismissal value', async () => {
    localStorage.setItem('padelbuddy_pwa_install_banner_dismissed', '1');

    const { hasPwaInstallBannerBeenDismissed } = await importInstallModule();

    expect(hasPwaInstallBannerBeenDismissed()).toBe(true);
  });

  it('stores dismissal state', async () => {
    const {
      hasPwaInstallBannerBeenDismissed,
      markPwaInstallBannerDismissed,
      clearPwaInstallBannerDismissed
    } = await importInstallModule();

    expect(hasPwaInstallBannerBeenDismissed()).toBe(false);

    markPwaInstallBannerDismissed();
    expect(hasPwaInstallBannerBeenDismissed()).toBe(true);

    clearPwaInstallBannerDismissed();
    expect(hasPwaInstallBannerBeenDismissed()).toBe(false);
  });

  it('swallows storage write failures', async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>(() => null),
      setItem: vi.fn<(key: string, value: string) => void>(() => {
        throw new Error('blocked');
      }),
      removeItem: vi.fn<(key: string) => void>(() => {
        throw new Error('blocked');
      }),
      clear: vi.fn<() => void>()
    });

    const { markPwaInstallBannerDismissed, clearPwaInstallBannerDismissed } =
      await importInstallModule();

    expect(() => markPwaInstallBannerDismissed()).not.toThrow();
    expect(() => clearPwaInstallBannerDismissed()).not.toThrow();
  });

  it('returns prompt outcome from install prompt event', async () => {
    const { promptPwaInstall } = await importInstallModule();

    const promptEvent = {
      prompt: vi.fn<() => Promise<{ outcome: 'accepted'; platform: string }>>().mockResolvedValue({
        outcome: 'accepted',
        platform: 'web'
      })
    };

    await expect(promptPwaInstall(promptEvent as never)).resolves.toBe('accepted');
  });
});
