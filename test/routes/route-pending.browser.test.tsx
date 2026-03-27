/* oxlint-disable jsx-no-new-function-as-prop -- Test route harness keeps navigation handlers inline for readability. */

import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter
} from '@tanstack/react-router'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, cleanup } from 'vitest-browser-react'

import { routerPendingConfig } from '@/router'
import { RoutePendingBoundary } from '@/routes/-route-utils'
import { RoutePendingOverlay } from '@/routes/__root'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>['resolve']
  let reject!: Deferred<T>['reject']
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function TestRoot() {
  return (
    <>
      <RoutePendingOverlay />
      <Outlet />
    </>
  )
}

interface HomeScreenProps {
  onOpenNext: () => void
}

function HomeScreen({ onOpenNext }: HomeScreenProps) {
  return (
    <button type="button" onClick={onOpenNext}>
      Open next view
    </button>
  )
}

function NextScreen() {
  return <div>Next screen ready</div>
}

describe('RoutePendingOverlay', () => {
  const originalPathname = window.location.pathname

  afterEach(async () => {
    vi.useRealTimers()
    window.history.replaceState(null, '', originalPathname)
    await cleanup()
  })

  test('appears only after the pending threshold and clears after the transition resolves', async () => {
    vi.useFakeTimers()
    window.history.replaceState(null, '', '/')

    const nextRouteReady = createDeferred<void>()
    let router!: ReturnType<typeof createRouter>
    const openNext = () => void router.navigate({ to: '/next' as never })

    const rootRoute = createRootRoute({ component: TestRoot })
    const homeRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <HomeScreen onOpenNext={openNext} />
    })
    const nextRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/next',
      loader: async () => {
        await nextRouteReady.promise
        return null
      },
      component: NextScreen
    })

    router = createRouter({
      routeTree: rootRoute.addChildren([homeRoute, nextRoute]),
      defaultPendingComponent: RoutePendingBoundary,
      ...routerPendingConfig
    })

    const screen = await render(<RouterProvider router={router} />)

    await expect.element(screen.getByRole('button', { name: 'Open next view' })).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('Loading the next view')

    await screen.getByRole('button', { name: 'Open next view' }).click()
    await vi.advanceTimersByTimeAsync(routerPendingConfig.defaultPendingMs - 1)

    expect(document.body.textContent).not.toContain('Loading the next view')

    await vi.advanceTimersByTimeAsync(1)

    expect(document.body.textContent).toContain('Loading the next view')

    nextRouteReady.resolve()
    await vi.advanceTimersByTimeAsync(routerPendingConfig.defaultPendingMinMs)

    await expect.element(screen.getByText('Next screen ready')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('Loading the next view')
  })

  test('stays hidden when navigation resolves before the pending threshold', async () => {
    vi.useFakeTimers()
    window.history.replaceState(null, '', '/')

    let router!: ReturnType<typeof createRouter>
    const openNext = () => void router.navigate({ to: '/next' as never })

    const rootRoute = createRootRoute({ component: TestRoot })
    const homeRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <HomeScreen onOpenNext={openNext} />
    })
    const nextRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/next',
      loader: async () => null,
      component: NextScreen
    })

    router = createRouter({
      routeTree: rootRoute.addChildren([homeRoute, nextRoute]),
      defaultPendingComponent: RoutePendingBoundary,
      ...routerPendingConfig
    })

    const screen = await render(<RouterProvider router={router} />)

    await expect.element(screen.getByRole('button', { name: 'Open next view' })).toBeInTheDocument()
    await screen.getByRole('button', { name: 'Open next view' }).click()
    await vi.advanceTimersByTimeAsync(routerPendingConfig.defaultPendingMs)

    await expect.element(screen.getByText('Next screen ready')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('Loading the next view')
  })
})
