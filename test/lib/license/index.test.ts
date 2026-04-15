import { afterEach, describe, expect, it, vi } from 'vitest';

import { LicenseStatusValues, checkLicenseStatus, isAppAllowed } from '@/lib/license';

const { mockCapacitor } = vi.hoisted(() => ({
  mockCapacitor: {
    isNativePlatform: vi.fn<() => boolean>(),
    Plugins: {} as Record<string, unknown>
  }
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: mockCapacitor
}));

describe('license status', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockCapacitor.Plugins = {};
  });

  it('returns licensed on web platforms', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(false);

    await expect(checkLicenseStatus()).resolves.toEqual({
      status: LicenseStatusValues.LICENSED,
      isLicensed: true,
      isGraceActive: true
    });
  });

  it('returns and caches native plugin status when plugin succeeds', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    const pluginStatus = {
      status: LicenseStatusValues.NOT_LICENSED,
      isLicensed: false,
      isGraceActive: true,
      timestamp: 123
    };

    const setItem = vi.fn<(key: string, value: string) => void>();
    const getItem = vi.fn<(key: string) => string | null>();
    const removeItem = vi.fn<(key: string) => void>();
    vi.stubGlobal('localStorage', { getItem, setItem, removeItem });

    mockCapacitor.Plugins = {
      License: {
        checkLicense: vi.fn<() => Promise<typeof pluginStatus>>().mockResolvedValue(pluginStatus)
      }
    };

    await expect(checkLicenseStatus()).resolves.toEqual(pluginStatus);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(setItem.mock.calls[0]?.[0]).toBe('pbw_license_v1');
  });

  it('falls back to a valid cached status when native plugin fails', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.Plugins = {
      License: {
        checkLicense: vi
          .fn<() => Promise<never>>()
          .mockRejectedValue(new Error('native unavailable'))
      }
    };

    const cached = {
      status: LicenseStatusValues.NOT_LICENSED,
      isLicensed: false,
      isGraceActive: true,
      cachedAt: Date.now()
    };

    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>().mockReturnValue(JSON.stringify(cached)),
      setItem: vi.fn<(key: string, value: string) => void>(),
      removeItem: vi.fn<(key: string) => void>()
    });

    await expect(checkLicenseStatus()).resolves.toEqual(cached);
  });

  it('drops expired cache entries and returns unknown status', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.Plugins = {};

    const removeItem = vi.fn<(key: string) => void>();
    const expiredCache = {
      status: LicenseStatusValues.NOT_LICENSED,
      isLicensed: false,
      isGraceActive: false,
      cachedAt: Date.now() - 25 * 60 * 60 * 1000
    };

    vi.stubGlobal('localStorage', {
      getItem: vi
        .fn<(key: string) => string | null>()
        .mockReturnValue(JSON.stringify(expiredCache)),
      setItem: vi.fn<(key: string, value: string) => void>(),
      removeItem
    });

    await expect(checkLicenseStatus()).resolves.toEqual({
      status: LicenseStatusValues.UNKNOWN,
      isLicensed: false,
      isGraceActive: false
    });
    expect(removeItem).toHaveBeenCalledWith('pbw_license_v1');
  });

  it('returns unknown when cache is malformed and plugin is unavailable', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.Plugins = {
      License: {}
    };

    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>().mockReturnValue('{bad-json'),
      setItem: vi.fn<(key: string, value: string) => void>(),
      removeItem: vi.fn<(key: string) => void>()
    });

    await expect(checkLicenseStatus()).resolves.toEqual({
      status: LicenseStatusValues.UNKNOWN,
      isLicensed: false,
      isGraceActive: false
    });
  });

  it('returns unknown when there is no plugin namespace and no cached status', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.Plugins = undefined as unknown as Record<string, unknown>;

    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>().mockReturnValue(null),
      setItem: vi.fn<(key: string, value: string) => void>(),
      removeItem: vi.fn<(key: string) => void>()
    });

    await expect(checkLicenseStatus()).resolves.toEqual({
      status: LicenseStatusValues.UNKNOWN,
      isLicensed: false,
      isGraceActive: false
    });
  });

  it('returns unknown when cache lookup throws and plugin is unavailable', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.Plugins = {
      License: {
        checkLicense: vi
          .fn<() => Promise<never>>()
          .mockRejectedValue(new Error('native unavailable'))
      }
    };

    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>().mockImplementation(() => {
        throw new Error('storage read failed');
      }),
      setItem: vi.fn<(key: string, value: string) => void>(),
      removeItem: vi.fn<(key: string) => void>()
    });

    await expect(checkLicenseStatus()).resolves.toEqual({
      status: LicenseStatusValues.UNKNOWN,
      isLicensed: false,
      isGraceActive: false
    });
  });

  it('allows access when either licensed or grace period is active', () => {
    expect(
      isAppAllowed({
        status: LicenseStatusValues.NOT_LICENSED,
        isLicensed: false,
        isGraceActive: true
      })
    ).toBe(true);
    expect(
      isAppAllowed({
        status: LicenseStatusValues.LICENSED,
        isLicensed: true,
        isGraceActive: false
      })
    ).toBe(true);
    expect(
      isAppAllowed({
        status: LicenseStatusValues.UNKNOWN,
        isLicensed: false,
        isGraceActive: false
      })
    ).toBe(false);
  });
});
