import { describe, expect, test, vi } from 'vitest'

import {
  currentMatchRouteFreshnessMatrix,
  invalidateCurrentMatchPersistenceRoutes,
  prepareCurrentMatchRouteNavigation
} from '@/lib/router/current-match-route-flow'

describe('current match route flow helpers', () => {
  test('documents the persistence-backed route freshness matrix', () => {
    expect(currentMatchRouteFreshnessMatrix).toEqual({
      '/': {
        revalidateOnEntry: 'always',
        preload: 'explicit-after-clear-current-match',
        invalidatedAfterMutation: true
      },
      '/match/$id': {
        revalidateOnEntry: 'always',
        preload: 'explicit-after-start-resume-continue',
        invalidatedAfterMutation: true
      },
      '/match/finish/$id': {
        revalidateOnEntry: 'always',
        preload: 'explicit-after-finish-match',
        invalidatedAfterMutation: true
      }
    })
  })

  test('invalidates only persistence-backed routes', async () => {
    const invalidate = vi.fn(async () => undefined)
    const preloadRoute = vi.fn(async () => undefined)

    await invalidateCurrentMatchPersistenceRoutes({
      invalidate,
      preloadRoute
    })

    expect(invalidate).toHaveBeenCalledTimes(1)
    const invalidateArgs = invalidate.mock.calls.at(0)?.at(0) as
      | {
          filter: (routeMatch: { routeId: string }) => boolean
        }
      | undefined

    expect(invalidateArgs?.filter({ routeId: '/' })).toBe(true)
    expect(invalidateArgs?.filter({ routeId: '/match/$id' })).toBe(true)
    expect(invalidateArgs?.filter({ routeId: '/match/finish/$id' })).toBe(true)
    expect(invalidateArgs?.filter({ routeId: '/settings' })).toBe(false)
  })

  test('preloads route navigation without invalidating by default', async () => {
    const callOrder: string[] = []
    const invalidate = vi.fn(async () => {
      callOrder.push('invalidate')
    })
    const preloadRoute = vi.fn(async () => {
      callOrder.push('preload')
    })

    await prepareCurrentMatchRouteNavigation(
      {
        invalidate,
        preloadRoute
      },
      {
        to: '/match/$id',
        params: { id: 'match-1' }
      }
    )

    expect(invalidate).not.toHaveBeenCalled()
    expect(preloadRoute).toHaveBeenCalledWith({
      to: '/match/$id',
      params: { id: 'match-1' }
    })
    expect(callOrder).toEqual(['preload'])
  })

  test('invalidates before preloading when the navigation opts in', async () => {
    const callOrder: string[] = []
    const invalidate = vi.fn(async () => {
      callOrder.push('invalidate')
    })
    const preloadRoute = vi.fn(async () => {
      callOrder.push('preload')
    })

    await prepareCurrentMatchRouteNavigation(
      {
        invalidate,
        preloadRoute
      },
      {
        to: '/match/finish/$id',
        params: { id: 'match-2' }
      },
      { invalidate: true }
    )

    expect(invalidate).toHaveBeenCalledTimes(1)
    expect(preloadRoute).toHaveBeenCalledWith({
      to: '/match/finish/$id',
      params: { id: 'match-2' }
    })
    expect(callOrder).toEqual(['invalidate', 'preload'])
  })
})
