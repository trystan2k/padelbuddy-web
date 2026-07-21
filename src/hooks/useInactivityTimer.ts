import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInactivityTimerConfig {
  /** Enable/disable the timer. Defaults to true. */
  enabled?: boolean;
  /** Timeout in milliseconds. Defaults to 5000. */
  timeoutMs?: number;
  /** CSS selectors for elements whose interactions should be ignored. */
  ignoredTargetSelectors?: string[];
  /** Custom predicate to determine if an event should be ignored. */
  shouldIgnoreEvent?: (event: Event) => boolean;
}

interface UseInactivityTimerReturn {
  /** True = controls visible (active). False = controls hidden (inactive/expired). */
  isActive: boolean;
  /** Programmatically reset the timer to active state. */
  reset: () => void;
}

/**
 * Hook that tracks user inactivity with a configurable timeout.
 * Starts in the active state and transitions to inactive after the timeout.
 * Resetting happens on non-ignored interactions or via the reset() method.
 *
 * NOTE: This hook is designed to be stable across renders. The effect will NOT
 * restart when the caller re-renders with new callback/array references. Instead,
 * `ignoredTargetSelectors` and `shouldIgnoreEvent` are stored in refs and kept
 * synchronized via separate effects that don't trigger the main effect restart.
 */
export function useInactivityTimer(
  config: UseInactivityTimerConfig = {}
): UseInactivityTimerReturn {
  const {
    enabled = true,
    timeoutMs = 5000,
    ignoredTargetSelectors = [],
    shouldIgnoreEvent
  } = config;

  const [isActive, setIsActive] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the current enabled state so timeout callback can check it
  const enabledRef = useRef(enabled);

  // Store the unstable config values in refs so the main effect doesn't restart on every render
  const ignoredTargetSelectorsRef = useRef(ignoredTargetSelectors);
  const shouldIgnoreEventRef = useRef(shouldIgnoreEvent);

  // Keep refs synchronized with the latest config values
  // This effect does NOT restart the main timer effect
  useEffect(() => {
    ignoredTargetSelectorsRef.current = ignoredTargetSelectors;
  }, [ignoredTargetSelectors]);

  useEffect(() => {
    shouldIgnoreEventRef.current = shouldIgnoreEvent;
  }, [shouldIgnoreEvent]);

  // Keep enabledRef in sync
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    // Schedule timeout to set isActive to false after timeoutMs of inactivity
    // The isActive state is NOT set immediately - only when the timeout fires
    timeoutRef.current = setTimeout(() => {
      // Check if still enabled - the timeout might be from a previous enabled=true state
      // This prevents a stale timeout callback from overriding state after enabled=false
      if (!enabledRef.current) {
        return;
      }
      setIsActive(false);
    }, timeoutMs);
  }, [clearTimer, timeoutMs]);

  const resetTimer = useCallback(() => {
    if (!enabled) {
      return;
    }
    setIsActive(true);
    startTimer();
  }, [enabled, startTimer]);

  // This function is called by event listeners and reads from refs
  // to avoid needing the refs as dependencies
  const isIgnoredInteraction = useCallback(
    (event: Event): boolean => {
      // Check custom predicate first
      if (shouldIgnoreEventRef.current?.(event)) {
        return true;
      }

      // Check target selectors for ignored elements
      const selectors = ignoredTargetSelectorsRef.current;
      if (selectors.length > 0 && event.target instanceof Element) {
        const target = event.target;
        for (const selector of selectors) {
          try {
            if (target.closest(selector)) {
              return true;
            }
          } catch {
            // Invalid selector, skip
          }
        }
      }

      return false;
    },
    [] // No deps - reads from refs
  );

  // Main effect: sets up event listeners and timer
  // ONLY depends on stable values - will not restart when caller re-renders
  useEffect(() => {
    if (!enabled) {
      clearTimer();
      setIsActive(true);
      return undefined;
    }

    // Start the inactivity timer
    startTimer();

    const handlePointerDown = (event: PointerEvent) => {
      if (isIgnoredInteraction(event)) {
        return;
      }
      resetTimer();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isIgnoredInteraction(event)) {
        return;
      }
      resetTimer();
    };

    // Use capture phase for scroll to catch events from child elements
    const handleScroll = (event: Event) => {
      if (isIgnoredInteraction(event)) {
        return;
      }
      resetTimer();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, {
      capture: true,
      passive: true
    });

    return () => {
      clearTimer();
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
    // Intentionally omit isIgnoredInteraction from deps - it reads from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, clearTimer, resetTimer, startTimer]);

  // Expose reset method for programmatic reset (e.g., from "Exit fullscreen" button)
  const reset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return { isActive, reset };
}
