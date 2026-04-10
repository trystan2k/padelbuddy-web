import { Capacitor } from '@capacitor/core';

export interface LicenseStatus {
  status: number;
  isLicensed: boolean;
  isGraceActive: boolean;
  timestamp?: number;
}

export const LicenseStatusValues = {
  LICENSED: 0,
  NOT_LICENSED: 1,
  ERROR: 2,
  UNKNOWN: 3
} as const;

const LICENSE_CHECK_KEY = 'pbw_license_v1';
const LICENSE_TTL_MS = 24 * 60 * 60 * 1000;

// The native Android plugin currently verifies Play Store install source.
// We keep the broader "license" naming here so the JS contract stays stable.

interface PluginMethod {
  (...args: unknown[]): Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callPluginMethod<T>(
  pluginName: string,
  methodName: string,
  ...args: unknown[]
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = Capacitor as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: Record<string, unknown> = cap.Plugins ?? {};
  const plugin = plugins[pluginName];
  if (!plugin) return Promise.reject(new Error(`Plugin ${pluginName} not found`));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const method = (plugin as any)[methodName] as PluginMethod | undefined;
  if (!method) return Promise.reject(new Error(`Method ${methodName} not found on ${pluginName}`));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return method(...args) as any;
}

async function getNativeLicenseStatus(): Promise<LicenseStatus | null> {
  try {
    const result = await callPluginMethod<LicenseStatus>('License', 'checkLicense');
    return result;
  } catch {
    return null;
  }
}

function getCachedStatus(): LicenseStatus | null {
  try {
    const raw = localStorage.getItem(LICENSE_CHECK_KEY);
    if (!raw) return null;
    const cached: LicenseStatus & { cachedAt: number } = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > LICENSE_TTL_MS) {
      localStorage.removeItem(LICENSE_CHECK_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function cacheStatus(status: LicenseStatus) {
  try {
    const entry = { ...status, cachedAt: Date.now() };
    localStorage.setItem(LICENSE_CHECK_KEY, JSON.stringify(entry));
  } catch {}
}

export async function checkLicenseStatus(): Promise<LicenseStatus> {
  if (!Capacitor.isNativePlatform()) {
    return { status: LicenseStatusValues.LICENSED, isLicensed: true, isGraceActive: true };
  }

  const native = await getNativeLicenseStatus();

  if (native) {
    cacheStatus(native);
    return native;
  }

  const cached = getCachedStatus();
  if (cached) return cached;

  return {
    status: LicenseStatusValues.UNKNOWN,
    isLicensed: false,
    isGraceActive: false
  };
}

export function isAppAllowed(status: LicenseStatus): boolean {
  return status.isLicensed || status.isGraceActive;
}
