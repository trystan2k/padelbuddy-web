import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

function createAppRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPendingMs: 200,
    defaultPendingMinMs: 300,
    scrollRestoration: true
  })
}

let router: ReturnType<typeof createAppRouter> | null = null

export function getRouter() {
  if (router === null) {
    router = createAppRouter()
  }

  return router
}
