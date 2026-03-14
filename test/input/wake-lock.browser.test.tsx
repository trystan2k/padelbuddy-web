import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useEffect } from 'react'

import { useWakeLock, type UseWakeLockReturn } from '@/lib/input'

// Test component to render the hook output
function WakeLockTestComponent({
  options,
  onStateChange
}: {
  options?: Parameters<typeof useWakeLock>[0]
  onStateChange?: (state: UseWakeLockReturn) => void
}) {
  const state = useWakeLock(options)

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  return (
    <div>
      <span data-testid="isSupported">{state.isSupported.toString()}</span>
      <span data-testid="isActive">{state.isActive.toString()}</span>
      <span data-testid="error">{state.error?.message ?? 'null'}</span>
      {/* eslint-disable-next-line react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop */}
      <button data-testid="request" type="button" onClick={() => state.request()}>
        Request
      </button>
      {/* eslint-disable-next-line react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop */}
      <button data-testid="release" type="button" onClick={() => state.release()}>
        Release
      </button>
    </div>
  )
}

describe('wake-lock browser', () => {
  describe('request and release', () => {
    test('does not request when API is not supported', async () => {
      const originalWakeLock = navigator.wakeLock
      Object.defineProperty(navigator, 'wakeLock', {
        value: undefined,
        writable: true,
        configurable: true
      })

      try {
        // We need to ensure the check for 'wakeLock' in navigator returns false
        // Since we've set it to undefined, 'wakeLock' in navigator should be false
        const screen = await render(<WakeLockTestComponent />)

        // Try to request - should not throw but should not actually request
        await screen.getByTestId('request').click()

        // Should not be active since API is not supported
        await expect.element(screen.getByTestId('isActive')).toHaveTextContent('false')
      } finally {
        Object.defineProperty(navigator, 'wakeLock', {
          value: originalWakeLock,
          writable: true,
          configurable: true
        })
      }
    })
  })

  describe('isSupported', () => {
    test('returns true when Wake Lock API is available', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      await expect.element(screen.getByTestId('isSupported')).toHaveTextContent('true')
    })
  })

  describe('request and release', () => {
    test('requests wake lock successfully', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      // Request wake lock
      await screen.getByTestId('request').click()

      // Should be active
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true')
      await expect.element(screen.getByTestId('error')).toHaveTextContent('null')
      expect(mockWakeLock.request).toHaveBeenCalledWith('screen')
    })

    test('releases wake lock successfully', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      // Request wake lock
      await screen.getByTestId('request').click()
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true')

      // Release wake lock
      await screen.getByTestId('release').click()

      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('false')
      expect(mockSentinel.release).toHaveBeenCalled()
    })

    test('does not request wake lock if already active', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      // Request wake lock twice
      await screen.getByTestId('request').click()
      await screen.getByTestId('request').click()

      // Should only call request once
      expect(mockWakeLock.request).toHaveBeenCalledTimes(1)
    })
  })

  describe('enabled option', () => {
    test('does not request wake lock when enabled is false', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
      await render(<WakeLockTestComponent options={{ enabled: false }} />)

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockWakeLock.request).not.toHaveBeenCalled()
    })
  })

  describe('visibility change handling', () => {
    test('does not re-request wake lock when already active', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      // Request wake lock
      await screen.getByTestId('request').click()
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true')

      // Simulate visibility change to visible (but wake lock is already active)
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true
      })
      document.dispatchEvent(new Event('visibilitychange'))

      // Request should not be called again since wake lock is already active
      expect(mockWakeLock.request).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    test('handles release error gracefully', async () => {
      const releaseFn = vi.fn().mockRejectedValue(new Error('Release failed'))
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: releaseFn
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      // Request wake lock
      await screen.getByTestId('request').click()
      await expect.element(screen.getByTestId('isActive')).toHaveTextContent('true')

      // Release - should handle error gracefully
      // The error is caught but isActive becomes false after release is called
      // Even if release throws, we try to clean up the ref
      await screen.getByTestId('release').click()

      // The release function should have been called
      expect(releaseFn).toHaveBeenCalled()
    })

    test('handles request error and calls onError callback', async () => {
      const onError = vi.fn()
      const mockWakeLock = {
        request: vi.fn().mockRejectedValue(new Error('Request failed'))
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-function-as-prop, unicorn/consistent-function-scoping
      await render(<WakeLockTestComponent onStateChange={() => {}} options={{ onError }} />)

      // Wait for the request to complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('return value', () => {
    test('returns correct interface shape', async () => {
      const mockSentinel = {
        addEventListener: vi.fn(),
        release: vi.fn().mockResolvedValue(undefined)
      }
      const mockWakeLock = {
        request: vi.fn().mockResolvedValue(mockSentinel)
      }

      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true
      })

      const screen = await render(<WakeLockTestComponent />)

      // Check all properties are rendered
      await expect.element(screen.getByTestId('isSupported')).toBeVisible()
      await expect.element(screen.getByTestId('isActive')).toBeVisible()
      await expect.element(screen.getByTestId('error')).toBeVisible()
      await expect.element(screen.getByTestId('request')).toBeVisible()
      await expect.element(screen.getByTestId('release')).toBeVisible()
    })
  })
})
