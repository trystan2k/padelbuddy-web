import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { PwaInstallBanner } from '@/components/PwaInstallBanner/PwaInstallBanner';

const { usePwaInstallPromptMock } = vi.hoisted(() => ({
  usePwaInstallPromptMock: vi.fn<() => unknown>()
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'common.dismiss': 'Dismiss',
        'pwaInstall.banner.label': 'Install app banner',
        'pwaInstall.banner.title': 'Install Padel Buddy',
        'pwaInstall.banner.body': 'Add app to your home screen for quicker access.',
        'pwaInstall.banner.manualTitle': 'Add Padel Buddy to your home screen',
        'pwaInstall.banner.manualBody':
          'On iPhone or iPad, open the Share menu and tap Add to Home Screen.',
        'pwaInstall.banner.install': 'Install app',
        'pwaInstall.banner.installing': 'Opening prompt...'
      })[key] ?? key
  })
}));

vi.mock('@/lib/pwa/install', () => ({
  usePwaInstallPrompt: usePwaInstallPromptMock
}));

describe('PwaInstallBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not render when install prompt is unavailable', async () => {
    usePwaInstallPromptMock.mockReturnValue({
      mode: null,
      isVisible: false,
      isInstalling: false,
      dismissBanner: vi.fn<() => void>(),
      promptInstall: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    });

    const screen = await render(<PwaInstallBanner />);

    expect(screen.container.firstChild).toBeNull();
  });

  test('renders banner copy and actions', async () => {
    usePwaInstallPromptMock.mockReturnValue({
      mode: 'native_prompt',
      isVisible: true,
      isInstalling: false,
      dismissBanner: vi.fn<() => void>(),
      promptInstall: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    });

    const screen = await render(<PwaInstallBanner />);

    await expect.element(screen.getByText('Install Padel Buddy')).toBeInTheDocument();
    await expect
      .element(screen.getByText('Add app to your home screen for quicker access.'))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Install app' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  test('calls dismiss handler', async () => {
    const dismissBanner = vi.fn<() => void>();

    usePwaInstallPromptMock.mockReturnValue({
      mode: 'native_prompt',
      isVisible: true,
      isInstalling: false,
      dismissBanner,
      promptInstall: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    });

    const screen = await render(<PwaInstallBanner />);

    await screen.getByRole('button', { name: 'Dismiss' }).click();

    expect(dismissBanner).toHaveBeenCalledTimes(1);
  });

  test('shows installing label while prompt is opening', async () => {
    usePwaInstallPromptMock.mockReturnValue({
      mode: 'native_prompt',
      isVisible: true,
      isInstalling: true,
      dismissBanner: vi.fn<() => void>(),
      promptInstall: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    });

    const screen = await render(<PwaInstallBanner />);

    await expect.element(screen.getByRole('button', { name: 'Opening prompt...' })).toBeDisabled();
  });

  test('renders iOS manual install instructions without install button', async () => {
    usePwaInstallPromptMock.mockReturnValue({
      mode: 'manual_ios',
      isVisible: true,
      isInstalling: false,
      dismissBanner: vi.fn<() => void>(),
      promptInstall: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    });

    const screen = await render(<PwaInstallBanner />);

    await expect
      .element(screen.getByText('Add Padel Buddy to your home screen'))
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByText('On iPhone or iPad, open the Share menu and tap Add to Home Screen.')
      )
      .toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });
});
