export const currentMatchPersistenceRouteLoaderOptions = {
  staleTime: 0,
  preloadStaleTime: 10_000
} as const

export const currentMatchRouteFreshnessMatrix = {
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
} as const

const currentMatchPersistenceRouteIds = ['/', '/match/$id', '/match/finish/$id'] as const

type CurrentMatchPersistenceRouteId = (typeof currentMatchPersistenceRouteIds)[number]

type CurrentMatchRouteLocation =
  | {
      to: '/'
    }
  | {
      to: '/match/$id'
      params: { id: string }
    }
  | {
      to: '/match/finish/$id'
      params: { id: string }
    }

interface CurrentMatchRouteMatch {
  routeId: string
}

interface CurrentMatchFlowRouter {
  invalidate: (options: {
    filter: (routeMatch: CurrentMatchRouteMatch) => boolean
  }) => Promise<unknown> | void
  preloadRoute: (location: CurrentMatchRouteLocation) => Promise<unknown> | void
}

export async function invalidateCurrentMatchPersistenceRoutes(
  router: CurrentMatchFlowRouter
): Promise<void> {
  await router.invalidate({
    filter: ({ routeId }) => isCurrentMatchPersistenceRouteId(routeId)
  })
}

export async function prepareCurrentMatchRouteNavigation(
  router: CurrentMatchFlowRouter,
  location: CurrentMatchRouteLocation,
  options?: {
    invalidate?: boolean
  }
): Promise<void> {
  if (options?.invalidate ?? false) {
    await invalidateCurrentMatchPersistenceRoutes(router)
  }

  await router.preloadRoute(location)
}

function isCurrentMatchPersistenceRouteId(
  routeId: string
): routeId is CurrentMatchPersistenceRouteId {
  return currentMatchPersistenceRouteIds.some((candidate) => candidate === routeId)
}
