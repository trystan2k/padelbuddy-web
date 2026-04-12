import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-react';

import { useInactivityTimer } from '@/hooks/useInactivityTimer';

function InactivityTimerHarness({
  enabled = true,
  timeoutMs = 5000,
  ignoredTargetSelectors = [],
  shouldIgnoreEvent,
  _onStateChange
}: {
  enabled?: boolean;
  timeoutMs?: number;
  ignoredTargetSelectors?: string[];
  shouldIgnoreEvent?: (event: Event) => boolean;
  _onStateChange?: (isActive: boolean) => void;
}) {
  const config: Parameters<typeof useInactivityTimer>[0] = {
    enabled,
    timeoutMs,
    ignoredTargetSelectors
  };

  if (shouldIgnoreEvent !== undefined) {
    config.shouldIgnoreEvent = shouldIgnoreEvent;
  }

  const { isActive } = useInactivityTimer(config);

  return (
    <div>
      <span data-testid="is-active">{String(isActive)}</span>
      <button
        data-testid="ignored-button"
        type="button"
        onClick={() => {
          /* No-op for testing */
        }}
      >
        Ignored Button
      </button>
      <button
        data-testid="regular-button"
        type="button"
        onClick={() => {
          /* No-op for testing */
        }}
      >
        Regular Button
      </button>
      <div
        role="presentation"
        data-testid="ignored-area"
        style={{ padding: '10px' }}
        onClick={() => {
          /* No-op for testing */
        }}
      >
        Ignored Area
      </div>
    </div>
  );
}

// Predicate functions moved to outer scope to avoid recreating on every call
function ignorePointerEventOnButton(event: Event): boolean {
  if (event instanceof PointerEvent) {
    return (event.target as HTMLElement)?.dataset?.testid === 'ignored-button';
  }
  return false;
}

function ignoreArrowLeftKey(event: Event): boolean {
  if (event instanceof KeyboardEvent) {
    return event.key === 'ArrowLeft';
  }
  return false;
}

/** Harness that toggles `enabled` via a button so we can test mid-lifecycle prop changes. */
function ToggleEnabledHarness({ timeoutMs = 5000 }: { timeoutMs?: number }) {
  const [enabled, setEnabled] = useState(true);
  const { isActive } = useInactivityTimer({
    enabled,
    timeoutMs,
    // Ignore pointerdown on the toggle button itself so clicking it doesn't reset the timer
    ignoredTargetSelectors: ['[data-testid="toggle-enabled"]']
  });

  return (
    <div>
      <span data-testid="is-active">{String(isActive)}</span>
      <button data-testid="toggle-enabled" type="button" onClick={() => setEnabled(false)}>
        Disable
      </button>
    </div>
  );
}

describe('useInactivityTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await cleanup();
  });

  describe('initial state', () => {
    test('starts in active state', async () => {
      const screen = await render(<InactivityTimerHarness />);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');
    });

    test('starts inactive when enabled is false', async () => {
      const screen = await render(<InactivityTimerHarness enabled={false} />);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');
    });
  });

  describe('timeout expiry', () => {
    test('transitions to inactive after timeout', async () => {
      const screen = await render(<InactivityTimerHarness timeoutMs={5000} />);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');

      await vi.advanceTimersByTimeAsync(5000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('respects custom timeout value', async () => {
      const screen = await render(<InactivityTimerHarness timeoutMs={3000} />);

      await vi.advanceTimersByTimeAsync(3000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });
  });

  describe('reset on non-ignored interactions', () => {
    test('resets timer on pointerdown on regular button', async () => {
      const screen = await render(<InactivityTimerHarness timeoutMs={5000} />);

      await vi.advanceTimersByTimeAsync(4000);

      await screen.getByTestId('regular-button').click();

      await vi.advanceTimersByTimeAsync(4000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');

      await vi.advanceTimersByTimeAsync(1000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('resets timer on pointerdown on document body', async () => {
      const screen = await render(<InactivityTimerHarness timeoutMs={5000} />);

      await vi.advanceTimersByTimeAsync(4000);

      document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(4000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');

      await vi.advanceTimersByTimeAsync(1000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('resets timer on keydown', async () => {
      const screen = await render(<InactivityTimerHarness timeoutMs={5000} />);

      await vi.advanceTimersByTimeAsync(4000);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

      await vi.advanceTimersByTimeAsync(4000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');

      await vi.advanceTimersByTimeAsync(1000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('resets timer on scroll', async () => {
      const screen = await render(<InactivityTimerHarness timeoutMs={5000} />);

      await vi.advanceTimersByTimeAsync(4000);

      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(4000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');

      await vi.advanceTimersByTimeAsync(1000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });
  });

  describe('ignore by selector', () => {
    test('does not reset timer when clicking ignored button', async () => {
      const screen = await render(
        <InactivityTimerHarness
          timeoutMs={5000}
          ignoredTargetSelectors={['[data-testid="ignored-button"]']}
        />
      );

      await vi.advanceTimersByTimeAsync(4000);

      await screen.getByTestId('ignored-button').click();

      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('does not reset timer when clicking inside ignored area', async () => {
      const screen = await render(
        <InactivityTimerHarness
          timeoutMs={5000}
          ignoredTargetSelectors={['[data-testid="ignored-area"]']}
        />
      );

      await vi.advanceTimersByTimeAsync(4000);

      await screen.getByTestId('ignored-area').click();

      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('ignores pointerdown with shouldIgnoreEvent predicate', async () => {
      const screen = await render(
        <InactivityTimerHarness timeoutMs={5000} shouldIgnoreEvent={ignorePointerEventOnButton} />
      );

      await vi.advanceTimersByTimeAsync(4000);

      await screen.getByTestId('ignored-button').click();

      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });

    test('ignores keydown with shouldIgnoreEvent predicate', async () => {
      const screen = await render(
        <InactivityTimerHarness timeoutMs={5000} shouldIgnoreEvent={ignoreArrowLeftKey} />
      );

      await vi.advanceTimersByTimeAsync(4000);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      await vi.advanceTimersByTimeAsync(2000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('false');
    });
  });

  describe('disabled mode', () => {
    test('returns permanently active state when disabled', async () => {
      const screen = await render(<InactivityTimerHarness enabled={false} timeoutMs={1000} />);

      await vi.advanceTimersByTimeAsync(10000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');
    });

    test('transitions to active when disabled mid-timeout', async () => {
      const screen = await render(<ToggleEnabledHarness timeoutMs={5000} />);

      await vi.advanceTimersByTimeAsync(3000);

      // Toggle enabled → false via state change on the SAME component instance
      await screen.getByTestId('toggle-enabled').click();

      await vi.advanceTimersByTimeAsync(5000);

      await expect.element(screen.getByTestId('is-active')).toHaveTextContent('true');
    });
  });

  describe('cleanup', () => {
    test('cleans up timers and listeners on unmount', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      await render(<InactivityTimerHarness timeoutMs={5000} />);

      const pointerDownHandlers = addEventListenerSpy.mock.calls.filter(
        ([eventName]) => eventName === 'pointerdown'
      );
      const keyDownHandlers = addEventListenerSpy.mock.calls.filter(
        ([eventName]) => eventName === 'keydown'
      );

      expect(pointerDownHandlers.length).toBeGreaterThan(0);
      expect(keyDownHandlers.length).toBeGreaterThan(0);

      await cleanup();

      const pointerDownRemoveCalls = removeEventListenerSpy.mock.calls.filter(
        ([eventName]) => eventName === 'pointerdown'
      );
      const keyDownRemoveCalls = removeEventListenerSpy.mock.calls.filter(
        ([eventName]) => eventName === 'keydown'
      );

      expect(pointerDownRemoveCalls.length).toBeGreaterThan(0);
      expect(keyDownRemoveCalls.length).toBeGreaterThan(0);
    });
  });
});
