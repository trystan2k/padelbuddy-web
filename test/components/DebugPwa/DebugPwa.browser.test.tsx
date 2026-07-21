import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { DebugPwa } from '@/components/DebugPwa/DebugPwa';

const mockGetSWState =
  vi.fn<() => Promise<{ supported: boolean; registered: boolean; ready: boolean }>>();
const mockGetSWVersion = vi.fn<() => Promise<{ version: string; cacheName: string }>>();
const mockRequestSWUpdate = vi.fn<() => Promise<void>>();
const mockClearSWCache = vi.fn<() => Promise<boolean>>();

vi.mock('@/lib/pwa/registration', () => ({
  getSWState: () => mockGetSWState(),
  getSWVersion: () => mockGetSWVersion(),
  requestSWUpdate: () => mockRequestSWUpdate(),
  clearSWCache: () => mockClearSWCache()
}));

function clickReopenButton() {
  const reopenButton = document.querySelector('button[class*="reopenButton"]');

  if (!reopenButton) {
    throw new Error('Reopen button not found');
  }

  reopenButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

async function openDebugPanel() {
  clickReopenButton();

  await vi.waitFor(() => {
    expect(document.querySelector('#debug-pwa-title')?.textContent).toContain('PWA Debug');
  });
}

async function closeDebugPanel() {
  const closeButton = document.querySelector('button[aria-label="Close"]');

  if (!closeButton) {
    throw new Error('Close button not found');
  }

  closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  await vi.waitFor(() => {
    expect(document.querySelector('#debug-pwa-title')).toBeNull();
    expect(document.querySelector('button[class*="reopenButton"]')).toBeTruthy();
  });
}

describe('DebugPwa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSWState.mockResolvedValue({
      supported: true,
      registered: true,
      ready: true
    });
    mockGetSWVersion.mockResolvedValue({ version: '1.0.0', cacheName: 'test-cache' });
    mockRequestSWUpdate.mockResolvedValue(undefined);
    mockClearSWCache.mockResolvedValue(true);
  });

  test('renders the hidden reopen button by default', async () => {
    const screen = await render(<DebugPwa />);

    await vi.waitFor(() => {
      const reopenButton = document.querySelector('button[class*="reopenButton"]');
      expect(reopenButton).toBeTruthy();
      expect(screen.container.textContent).toContain('Open PWA Debug');
      expect(document.querySelector('#debug-pwa-title')).toBeNull();
    });
  });

  test('shows reopen button when close is clicked', async () => {
    await render(<DebugPwa />);

    await openDebugPanel();
    await closeDebugPanel();

    await vi.waitFor(
      () => {
        const reopenButton = document.querySelector('button[class*="reopenButton"]');
        expect(reopenButton).toBeTruthy();
        expect(reopenButton?.textContent).toContain('Open PWA Debug');
      },
      { timeout: 5000 }
    );
  });

  test('restores the panel when reopen is clicked', async () => {
    await render(<DebugPwa />);

    await openDebugPanel();
    await closeDebugPanel();
    clickReopenButton();

    await vi.waitFor(
      () => {
        const title = document.querySelector('#debug-pwa-title');
        expect(title).toBeTruthy();
        expect(title?.textContent).toContain('PWA Debug');
      },
      { timeout: 5000 }
    );
  });

  test('displays SW states as check marks', async () => {
    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    // Wait for the async getSWState to resolve
    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    // All three states should be displayed with check marks
    await expect.element(screen.getByText('SW Supported')).toBeInTheDocument();
    await expect.element(screen.getByText('SW Registered')).toBeInTheDocument();
    await expect.element(screen.getByText('SW Ready')).toBeInTheDocument();
  });

  test('shows version and cache info when SW is registered', async () => {
    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWVersion).toHaveBeenCalled();
    });

    await expect.element(screen.getByText('Version')).toBeInTheDocument();
    await expect.element(screen.getByText('1.0.0')).toBeInTheDocument();
    await expect.element(screen.getByText('test-cache')).toBeInTheDocument();
  });

  test('hides version info when SW is not registered', async () => {
    mockGetSWState.mockResolvedValue({
      supported: true,
      registered: false,
      ready: false
    });

    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    // Version and Cache labels should not appear
    expect(screen.container.textContent).not.toContain('Version');
    expect(screen.container.textContent).not.toContain('test-cache');
  });

  test('disables update and clear buttons when SW is not registered', async () => {
    mockGetSWState.mockResolvedValue({
      supported: true,
      registered: false,
      ready: false
    });

    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    await expect.element(screen.getByRole('button', { name: 'Update SW' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Clear Cache' })).toBeDisabled();
  });

  test('calls requestSWUpdate and schedules reload on update click', async () => {
    // Capture the setTimeout callback to prevent the actual window.location.reload()
    // which would kill the test runner in a real browser.
    let capturedTimerCallback: (() => void) | null = null;
    const originalSetTimeout = globalThis.setTimeout;
    vi.stubGlobal('setTimeout', (fn: () => void, ms: number) => {
      if (ms === 500) {
        // Capture but don't schedule — prevents the reload
        capturedTimerCallback = fn;
        return 0 as unknown as ReturnType<typeof setTimeout>;
      }
      return originalSetTimeout(fn, ms);
    });

    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    await screen.getByRole('button', { name: 'Update SW' }).click();

    await vi.waitFor(() => {
      expect(mockRequestSWUpdate).toHaveBeenCalled();
    });

    // Verify the reload timer was scheduled (callback captured)
    expect(capturedTimerCallback).toBeTruthy();

    vi.unstubAllGlobals();
  });

  test('handles update failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRequestSWUpdate.mockRejectedValue(new Error('Update failed'));

    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    await screen.getByRole('button', { name: 'Update SW' }).click();

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('[DebugPWA] Update failed:', expect.any(Error));
    });
  });

  test('clears cache when clear cache button is clicked', async () => {
    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    await screen.getByRole('button', { name: 'Clear Cache' }).click();

    await vi.waitFor(() => {
      expect(mockClearSWCache).toHaveBeenCalled();
    });
  });

  test('handles clear cache failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockClearSWCache.mockRejectedValue(new Error('Clear failed'));

    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
    });

    await screen.getByRole('button', { name: 'Clear Cache' }).click();

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DebugPWA] Failed to clear cache:',
        expect.any(Error)
      );
    });
  });

  test('does not reset cache info when clearSWCache returns false', async () => {
    mockClearSWCache.mockResolvedValue(false);

    const screen = await render(<DebugPwa />);

    await openDebugPanel();

    await vi.waitFor(() => {
      expect(mockGetSWState).toHaveBeenCalled();
      expect(mockGetSWVersion).toHaveBeenCalled();
    });

    // Version info present before clear
    await expect.element(screen.getByText('Version')).toBeInTheDocument();

    await screen.getByRole('button', { name: 'Clear Cache' }).click();

    await vi.waitFor(() => {
      expect(mockClearSWCache).toHaveBeenCalled();
    });

    // Version info should still be present since clear returned false
    await expect.element(screen.getByText('Version')).toBeInTheDocument();
  });
});
