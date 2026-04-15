import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, type RenderResult } from 'vitest-browser-react';

import { LicenseGate } from '@/components/LicenseGate/LicenseGate';
import type { LicenseStatus } from '@/lib/license';

const { mockCheckLicenseStatus, mockIsAppAllowed } = vi.hoisted(() => ({
  mockCheckLicenseStatus: vi.fn<() => Promise<LicenseStatus>>(),
  mockIsAppAllowed: vi.fn<(status: LicenseStatus) => boolean>()
}));

const { mockGetPlatform } = vi.hoisted(() => ({
  mockGetPlatform: vi.fn<() => string>()
}));

const { translations } = vi.hoisted(() => ({
  translations: {
    'app.license.blocked.eyebrow': 'Google Play required',
    'app.license.blocked.title': 'Install from Google Play',
    'app.license.blocked.body': 'This build can only run when installed from Google Play.',
    'common.retry': 'Retry',
    'common.loadingPleaseWait': 'Loading, please wait...'
  } as const
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => translations[key as keyof typeof translations] ?? key
    })
  };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => mockGetPlatform()
  }
}));

vi.mock('@/lib/license', () => ({
  checkLicenseStatus: mockCheckLicenseStatus,
  isAppAllowed: mockIsAppAllowed
}));

describe('LicenseGate.spec', () => {
  let renderResult: RenderResult | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPlatform.mockReturnValue('android');
    mockCheckLicenseStatus.mockResolvedValue({
      status: 0,
      isLicensed: true,
      isGraceActive: true
    });
    mockIsAppAllowed.mockImplementation(
      (status: { isLicensed?: boolean; isGraceActive?: boolean }) =>
        Boolean(status?.isLicensed || status?.isGraceActive)
    );
  });

  afterEach(async () => {
    if (renderResult) {
      await renderResult.unmount();
      renderResult = null;
    }
  });

  test('renders children when license is valid (accepted)', async () => {
    mockCheckLicenseStatus.mockResolvedValueOnce({
      status: 0,
      isLicensed: true,
      isGraceActive: false
    });

    renderResult = await render(
      <LicenseGate>
        <div data-testid="licensed-content">licensed content</div>
      </LicenseGate>
    );

    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="licensed-content"]')).toBeVisible();
    });

    expect(document.body.textContent).not.toContain('Install from Google Play');
    expect(document.querySelector('button')).toBeNull();
  });

  test('renders blocked status when license is expired', async () => {
    mockCheckLicenseStatus.mockResolvedValueOnce({
      status: 1,
      isLicensed: false,
      isGraceActive: false
    });
    mockIsAppAllowed.mockReturnValue(false);

    renderResult = await render(
      <LicenseGate>
        <div data-testid="licensed-content">licensed content</div>
      </LicenseGate>
    );

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Install from Google Play');
    });

    expect(document.body.textContent).toContain('Google Play');

    const retryButton = document.querySelector<HTMLButtonElement>('button');

    expect(retryButton).toBeVisible();
    expect(retryButton).toBeEnabled();
  });

  test('renders blocked status when license is missing (check failed)', async () => {
    mockCheckLicenseStatus.mockRejectedValueOnce(new Error('license plugin unavailable'));

    renderResult = await render(
      <LicenseGate>
        <div data-testid="licensed-content">licensed content</div>
      </LicenseGate>
    );

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Install from Google Play');
    });

    expect(document.body.textContent).toContain('Google Play required');

    const retryButton = document.querySelector<HTMLButtonElement>('button');

    expect(retryButton).toBeVisible();
    expect(retryButton).toBeEnabled();
  });

  test('SSR renders children immediately on web platform', () => {
    mockGetPlatform.mockReturnValue('web');

    const markup = renderToStaticMarkup(
      <LicenseGate>
        <div>app content</div>
      </LicenseGate>
    );

    expect(markup).toContain('app content');
    expect(markup).not.toContain('role="status"');
  });

  test('SSR renders children on Android initial render to avoid hydration mismatch', () => {
    mockGetPlatform.mockReturnValue('android');

    const markup = renderToStaticMarkup(
      <LicenseGate>
        <div>app content</div>
      </LicenseGate>
    );

    expect(markup).toContain('app content');
    expect(markup).not.toContain('role="status"');
  });
});
