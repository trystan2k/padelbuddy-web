/* eslint-disable react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop */
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import wakeLockManager, { createWakeLockManager } from '@/lib/input/wake-lock-manager';
import { type UseWakeLockReturn, useWakeLock, resetWakeLockManager } from '@/lib/input/wake-lock';

// Test component to render the hook output
function WakeLockTestComponent({
  options,
  onStateChange
}: {
  options?: Parameters<typeof useWakeLock>[0];
  onStateChange?: (state: UseWakeLockReturn) => void;
}) {
  const state = useWakeLock(options);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  return (
    <div>
      <span data-testid="isSupported">{state.isSupported.toString()}</span>
      <span data-testid="isActive">{state.isActive.toString()}</span>
      <span data-testid="error">{state.error?.message ?? 'null'}</span>
      <button data-testid="request" type="button" onClick={() => state.request()}>
        Request
      </button>
      <button data-testid="release" type="button" onClick={() => state.release()}>
        Release
      </button>
    </div>
  );
}

describe('wake-lock browser', () => {
  let originalWakeLock: typeof navigator.wakeLock;
  let originalVisibilityStateDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Capture original values before each test
    originalWakeLock = navigator.wakeLock;
    originalVisibilityStateDescriptor = Object.getOwnPropertyDescriptor(
      document,
      'visibilityState'
    );
  });

  afterEach(() => {
    // Restore original values after each test to prevent cross-test leakage
    Object.defineProperty(navigator, 'wakeLock', {
      value: originalWakeLock,
      writable: true,
      configurable: true
    });

    // Restore the original property descriptor
    if (originalVisibilityStateDescriptor) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityStateDescriptor);
    } else {
      // If it wasn't an own property originally, try to restore the prototype chain
      // by defining it with the default descriptor
      try {
        delete (document as { visibilityState?: unknown }).visibilityState;
      } catch {
        // If delete fails (e.g., non-configurable), restore with undefined
        Object.defineProperty(document, 'visibilityState', {
          value: undefined,
          writable: true,
          configurable: true
        });
      }
    }
    vi.restoreAllMocks();
    resetWakeLockManager();
  });

  test('manager reset clears singleton state', async () => {
    const mockSentinel = {
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    };
    const mockWakeLock = {
      request: vi
        .fn<() => Promise<WakeLockSentinel>>()
        .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
    };

    Object.defineProperty(navigator, 'wakeLock', {
      value: mockWakeLock,
      writable: true,
      configurable: true
    });

    await wakeLockManager.request();
    expect(wakeLockManager.isActive()).toBe(true);

    wakeLockManager.reset();

    expect(wakeLockManager.isActive()).toBe(false);
  });

  test('manager factory keeps isolated state per instance', async () => {
    const firstManager = createWakeLockManager();
    const secondManager = createWakeLockManager();
    const mockSentinel = {
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    };
    const mockWakeLock = {
      request: vi
        .fn<() => Promise<WakeLockSentinel>>()
        .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
    };

    Object.defineProperty(navigator, 'wakeLock', {
      value: mockWakeLock,
      writable: true,
      configurable: true
    });

    await firstManager.request();

    expect(firstManager.isActive()).toBe(true);
    expect(secondManager.isActive()).toBe(false);
  });
  describe('request and release (not supported)', () => {
    test('does not request when API is not supported', async () => {
      const savedWakeLock = navigator.wakeLock;
      Object.defineProperty(navigator, 'wakeLock', {
        value: undefined,
        writable: true,
        configurable: true
      });

      try {
        // Setting wakeLock to undefined means the API check will fail
        const screen = await render(<WakeLockTestComponent />);

        // Try to request - should not throw but should not actually request
        await screen.getByTestId('request').click();

        // Should not be active since API is not supported
        await expect.element(screen.getByTestId('isActive')).toHaveTextContent('false');
      } finally {
        Object.defineProperty(navigator, 'wakeLock', {
          value: savedWakeLock,
          writable: true,
          configurable: true
        });
      }
    });
  });

  describe('isSupported', () => {
    test('returns true when Wake Lock API is available', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const screen = await render(<WakeLockTestComponent />);

      await expect.element(screen.getByTestId('isSupported')).toHaveTextContent('true');
    });
  });

  describe('request and release (supported)', () => {
    test('requests wake lock successfully', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const screen = await render(<WakeLockTestComponent />);

      // Request wake lock
      await screen.getByTestId('request').click();

      // Should be active
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true');
      await expect.element(screen.getByTestId('error')).toHaveTextContent('null');
      expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
    });

    test('releases wake lock successfully', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const screen = await render(<WakeLockTestComponent />);

      // Request wake lock
      await screen.getByTestId('request').click();
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true');

      // Release wake lock
      await screen.getByTestId('release').click();

      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('false');
      expect(mockSentinel.release).toHaveBeenCalled();
    });

    test('does not request wake lock if already active', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const screen = await render(<WakeLockTestComponent />);

      // Request wake lock twice
      await screen.getByTestId('request').click();
      await screen.getByTestId('request').click();

      // Should only call request once
      expect(mockWakeLock.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled option', () => {
    test('does not request wake lock when enabled is false', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
      await render(<WakeLockTestComponent options={{ enabled: false }} />);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockWakeLock.request).not.toHaveBeenCalled();
    });
  });

  describe('visibility change handling', () => {
    test('does not re-request wake lock when already active', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const screen = await render(<WakeLockTestComponent />);

      // Request wake lock
      await screen.getByTestId('request').click();
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true');

      // Simulate visibility change to visible (but wake lock is already active)
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));

      // Request should not be called again since wake lock is already active
      expect(mockWakeLock.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    test('handles release error gracefully', async () => {
      const releaseFn = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('Release failed'));
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: releaseFn
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const onError = vi.fn<(error: Error) => void>();
      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
      const wakeLockOptions = { onError };
      const screen = await render(<WakeLockTestComponent options={wakeLockOptions} />);

      // Request wake lock
      await screen.getByTestId('request').click();
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true');

      // Release - should handle error gracefully and call onError callback
      await screen.getByTestId('release').click();

      // The release function should have been called
      expect(releaseFn).toHaveBeenCalled();
      // onError callback should be called with the error
      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    test('handles request error and calls onError callback', async () => {
      const onError = vi.fn<(error: Error) => void>();
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockRejectedValue(new Error('Request failed'))
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      await render(<WakeLockTestComponent onStateChange={() => {}} options={{ onError }} />);

      // Wait for the request to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('return value', () => {
    test('returns correct interface shape', async () => {
      const mockSentinel = {
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        release: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
      };
      const mockWakeLock = {
        request: vi
          .fn<() => Promise<WakeLockSentinel>>()
          .mockResolvedValue(mockSentinel as unknown as WakeLockSentinel)
      };

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      });

      const screen = await render(<WakeLockTestComponent />);

      // Check all properties are rendered
      await expect.element(screen.getByTestId('isSupported')).toBeVisible();
      await expect.element(screen.getByTestId('isActive')).toBeVisible();
      await expect.element(screen.getByTestId('error')).toBeVisible();
      await expect.element(screen.getByTestId('request')).toBeVisible();
      await expect.element(screen.getByTestId('release')).toBeVisible();
    });
  });
});
