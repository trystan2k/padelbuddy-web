import { describe, expect, test } from 'vitest'

import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow'
import { getRouter } from '@/router'
import { Route as HomeRoute } from '@/routes/index'
import { Route as MatchRoute } from '@/routes/match.$id'
import { Route as MatchFinishRoute } from '@/routes/match.finish.$id'

describe('getRouter', () => {
  test('creates and caches the application router', () => {
    const firstRouter = getRouter()
    const secondRouter = getRouter()

    expect(secondRouter).toBe(firstRouter)
    expect(firstRouter.options.defaultPreload).toBe('intent')
    expect(firstRouter.options.scrollRestoration).toBe(true)
  })

  test('keeps persistence-backed current match routes fresh on entry', () => {
    expect(HomeRoute.options.staleTime).toBe(currentMatchPersistenceRouteLoaderOptions.staleTime)
    expect(HomeRoute.options.preloadStaleTime).toBe(
      currentMatchPersistenceRouteLoaderOptions.preloadStaleTime
    )
    expect(MatchRoute.options.staleTime).toBe(currentMatchPersistenceRouteLoaderOptions.staleTime)
    expect(MatchRoute.options.preloadStaleTime).toBe(
      currentMatchPersistenceRouteLoaderOptions.preloadStaleTime
    )
    expect(MatchFinishRoute.options.staleTime).toBe(
      currentMatchPersistenceRouteLoaderOptions.staleTime
    )
    expect(MatchFinishRoute.options.preloadStaleTime).toBe(
      currentMatchPersistenceRouteLoaderOptions.preloadStaleTime
    )
  })
})
