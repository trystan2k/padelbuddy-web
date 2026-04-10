import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { LicenseGate } from '@/components/LicenseGate/LicenseGate';
import * as licenseLib from '@/lib/license';

const translationMap = {
  'common.loadingPleaseWait': 'Loading, please wait...',
  'license.blocked.eyebrow': 'License required',
  'license.blocked.title': 'App not licensed',
  'license.blocked.body': 'This version of Padel Buddy is not licensed.',
  'common.retry': 'Try again'
} satisfies Record<string, string>;

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => translationMap[key as keyof typeof translationMap] ?? key
    })
  };
});

vi.mock('@/lib/license', () => ({
  checkLicenseStatus:
    vi.fn<() => Promise<{ status: number; isLicensed: boolean; isGraceActive: boolean }>>(),
  isAppAllowed: ({ isLicensed, isGraceActive }: { isLicensed: boolean; isGraceActive: boolean }) =>
    isLicensed || isGraceActive
}));

const mockIsNativePlatform = vi.fn<() => boolean>();

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNativePlatform()
  }
}));

describe('LicenseGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsNativePlatform.mockReturnValue(false);
    vi.mocked(licenseLib.checkLicenseStatus).mockResolvedValue({
      status: 0,
      isLicensed: true,
      isGraceActive: true
    });
  });

  test('renders children immediately on web platform', () => {
    mockIsNativePlatform.mockReturnValue(false);
    const markup = renderToStaticMarkup(
      <LicenseGate>
        <div>app content</div>
      </LicenseGate>
    );
    expect(markup).toContain('app content');
    expect(markup).not.toContain('role="status"');
  });

  test('renders loading spinner while checking on native', () => {
    mockIsNativePlatform.mockReturnValue(true);
    vi.mocked(licenseLib.checkLicenseStatus).mockImplementationOnce(() => new Promise(() => {}));
    const markup = renderToStaticMarkup(
      <LicenseGate>
        <div>app content</div>
      </LicenseGate>
    );
    expect(markup).toContain('role="status"');
  });
});
