import { describe, expect, it, vi } from 'vitest'

import {
  getViewTransitionNavigationOptions,
  supportsViewTransitions
} from '@/lib/utils/view-transitions'

describe('view-transitions', () => {
  describe('supportsViewTransitions', () => {
    it('returns false when document is undefined (SSR)', () => {
      const originalDocument = globalThis.document
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).document = undefined

      expect(supportsViewTransitions()).toBe(false)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).document = originalDocument
    })

    it('returns false when startViewTransition is not a function', () => {
      const mockDoc = {
        get body() {
          return { appendChild: vi.fn(), removeChild: vi.fn() }
        },
        startViewTransition: undefined
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).document = mockDoc

      expect(supportsViewTransitions()).toBe(false)
    })

    it('returns true when startViewTransition is a function', () => {
      const mockDoc = {
        get body() {
          return { appendChild: vi.fn(), removeChild: vi.fn() }
        },
        startViewTransition: () => ({})
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).document = mockDoc

      expect(supportsViewTransitions()).toBe(true)
    })
  })

  describe('getViewTransitionNavigationOptions', () => {
    it('returns empty object when view transitions are not supported', () => {
      const mockDoc = {
        get body() {
          return { appendChild: vi.fn(), removeChild: vi.fn() }
        },
        startViewTransition: undefined
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).document = mockDoc

      const result = getViewTransitionNavigationOptions()
      expect(result).toEqual({})
    })

    it('returns viewTransition true when supported', () => {
      const mockDoc = {
        get body() {
          return { appendChild: vi.fn(), removeChild: vi.fn() }
        },
        startViewTransition: () => ({})
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(globalThis as any).document = mockDoc

      const result = getViewTransitionNavigationOptions()
      expect(result).toEqual({ viewTransition: true })
    })
  })
})
