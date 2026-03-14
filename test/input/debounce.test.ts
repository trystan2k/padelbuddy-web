import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createDebounce, type DebounceController } from '@/lib/input'

describe('debounce', () => {
  let debounce: DebounceController

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    debounce?.cleanup()
  })

  describe('isReady', () => {
    test('returns true initially before any trigger', () => {
      debounce = createDebounce()

      expect(debounce.isReady()).toBe(true)
    })

    test('returns false immediately after trigger', () => {
      debounce = createDebounce()

      debounce.trigger()

      expect(debounce.isReady()).toBe(false)
    })

    test('returns true after delay passes', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(299)
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(1)
      expect(debounce.isReady()).toBe(true)
    })

    test('respects custom delay value', () => {
      debounce = createDebounce({ delay: 500 })

      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(499)
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(1)
      expect(debounce.isReady()).toBe(true)
    })

    test('uses default delay of 300ms when not specified', () => {
      debounce = createDebounce()

      debounce.trigger()

      vi.advanceTimersByTime(299)
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(1)
      expect(debounce.isReady()).toBe(true)
    })
  })

  describe('trigger', () => {
    test('sets lastTriggerTime on call', () => {
      debounce = createDebounce()

      debounce.trigger()

      expect(debounce.isReady()).toBe(false)
    })

    test('rapid calls are properly debounced', () => {
      debounce = createDebounce({ delay: 300 })

      // First trigger
      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      // Second trigger before delay passes
      vi.advanceTimersByTime(100)
      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      // Third trigger before delay passes
      vi.advanceTimersByTime(100)
      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      // Wait for full delay after last trigger
      vi.advanceTimersByTime(300)
      expect(debounce.isReady()).toBe(true)
    })

    test('clears existing timer when called again', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      vi.advanceTimersByTime(150)
      debounce.trigger()
      vi.advanceTimersByTime(150)

      // Still not ready because timer was reset
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(150)
      expect(debounce.isReady()).toBe(true)
    })
  })

  describe('reset', () => {
    test('cancels pending timer', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      debounce.reset()

      // Timer should be cleared, but lastTriggerTime is not reset
      expect(debounce.isReady()).toBe(false)
    })

    test('allows immediate trigger after reset', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      debounce.reset()

      // Can trigger again
      debounce.trigger()
      expect(debounce.isReady()).toBe(false)
    })

    test('is safe to call when no timer exists', () => {
      debounce = createDebounce()

      expect(() => debounce.reset()).not.toThrow()
    })

    test('can be called multiple times safely', () => {
      debounce = createDebounce()

      debounce.trigger()
      debounce.reset()
      debounce.reset()
      debounce.reset()

      expect(() => debounce.reset()).not.toThrow()
    })
  })

  describe('cleanup', () => {
    test('clears everything including lastTriggerTime', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      debounce.cleanup()

      // Both timer and lastTriggerTime should be reset
      expect(debounce.isReady()).toBe(true)
    })

    test('resets state to initial conditions', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      vi.advanceTimersByTime(100)
      debounce.trigger()
      vi.advanceTimersByTime(100)

      debounce.cleanup()

      expect(debounce.isReady()).toBe(true)
    })

    test('is safe to call when no operations have been performed', () => {
      debounce = createDebounce()

      expect(() => debounce.cleanup()).not.toThrow()
      expect(debounce.isReady()).toBe(true)
    })

    test('can be called multiple times safely', () => {
      debounce = createDebounce()

      debounce.trigger()
      debounce.cleanup()
      debounce.cleanup()

      expect(() => debounce.cleanup()).not.toThrow()
    })
  })

  describe('integration scenarios', () => {
    test('simulates rapid button clicks with debounce protection', () => {
      debounce = createDebounce({ delay: 300 })

      // First click should succeed
      expect(debounce.isReady()).toBe(true)
      debounce.trigger()

      // Rapid second click should be blocked
      vi.advanceTimersByTime(50)
      expect(debounce.isReady()).toBe(false)

      // Wait for debounce to expire
      vi.advanceTimersByTime(250)
      expect(debounce.isReady()).toBe(true)

      // Third click should succeed
      debounce.trigger()
      expect(debounce.isReady()).toBe(false)
    })

    test('cleanup clears timer', () => {
      debounce = createDebounce({ delay: 300 })

      debounce.trigger()
      expect(debounce.isReady()).toBe(false)

      // Cleanup clears the timer
      debounce.cleanup()
      expect(debounce.isReady()).toBe(true)
    })
  })

  describe('delay edge cases', () => {
    test('handles zero delay', () => {
      debounce = createDebounce({ delay: 0 })

      debounce.trigger()

      // With zero delay, advancing any amount should make it ready
      vi.advanceTimersByTime(0)
      expect(debounce.isReady()).toBe(true)
    })

    test('handles very large delay', () => {
      debounce = createDebounce({ delay: 10000 })

      debounce.trigger()

      vi.advanceTimersByTime(9999)
      expect(debounce.isReady()).toBe(false)

      vi.advanceTimersByTime(1)
      expect(debounce.isReady()).toBe(true)
    })
  })
})
