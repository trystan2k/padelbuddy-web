import { createRouter } from '@tanstack/react-router';

import { RoutePendingBoundary } from './routes/-route-utils';
import { routeTree } from './routeTree.gen';

export const routerPendingConfig = {
  defaultPendingMs: 180,
  defaultPendingMinMs: 120
} as const;

function createAppRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    ...routerPendingConfig,
    defaultPendingComponent: RoutePendingBoundary,
    scrollRestoration: true
  });
}

let router: ReturnType<typeof createAppRouter> | null = null;

export function getRouter() {
  if (router === null) {
    router = createAppRouter();
  }

  return router;
}
