export interface SWRegistrationState {
  supported: boolean
  registered: boolean
  ready: boolean
  error?: Error
}

interface SWMessage {
  type: string
  port?: MessagePort
}

let registration: ServiceWorkerRegistration | null = null

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

/**
 * Register the service worker
 * Gracefully handles errors to prevent app breakage
 */
export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn('[SW] Service workers not supported')
    return null
  }

  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const reg = registration
      const newWorker = reg?.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.warn('[SW] New version available, will activate on next visit')
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('[SW] Registration failed:', error)
    return null
  }
}

/**
 * Unregister the service worker
 * Useful for testing/development
 */
export async function unregisterSW(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return
  }

  if (!registration) {
    const sws = await navigator.serviceWorker.getRegistrations()
    await Promise.all(sws.map((sw) => sw.unregister()))
    return
  }

  await registration.unregister()
  registration = null
}

/**
 * Get the current service worker state
 */
export async function getSWState(): Promise<SWRegistrationState> {
  const supported = isServiceWorkerSupported()

  if (!supported) {
    return { supported: false, registered: false, ready: false }
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    const expectedScope = typeof location !== 'undefined' ? location.origin + '/' : undefined

    let reg: ServiceWorkerRegistration | undefined

    if (expectedScope) {
      reg = registrations.find((r) => r.scope === expectedScope)
    }

    if (!reg) {
      reg = registrations.find((r) => r.active?.scriptURL?.endsWith('/sw.js'))
    }

    if (!reg) {
      reg = registrations[0]
    }

    if (!reg) {
      return { supported: true, registered: false, ready: false }
    }

    return {
      supported: true,
      registered: true,
      ready: !!reg.active
    }
  } catch (error) {
    return {
      supported: true,
      registered: false,
      ready: false,
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * Send a message to the service worker
 */
export function sendSWMessage(message: SWMessage, timeoutMs = 5000): Promise<unknown> {
  if (!isServiceWorkerSupported()) {
    return Promise.reject(new Error('Service workers not supported'))
  }

  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No active service worker'))
      return
    }

    const channel = new MessageChannel()
    const timer = setTimeout(() => {
      channel.port1.close()
      channel.port2.close()
      reject(new Error(`SW message '${message.type}' timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    // eslint-disable-next-line unicorn/prefer-add-event-listener -- MessagePort uses onmessage pattern
    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      channel.port1.close()
      channel.port2.close()
      if (event.data?.error) {
        reject(new Error(event.data.error))
      } else {
        resolve(event.data)
      }
    }

    navigator.serviceWorker.controller.postMessage(message, [channel.port2])
    channel.port1.start()
  })
}

/**
 * Request the service worker to skip waiting and activate
 */
export async function requestSWUpdate(): Promise<void> {
  await sendSWMessage({ type: 'SKIP_WAITING' })
}

/**
 * Get SW version info
 */
export async function getSWVersion(): Promise<{ version: string; cacheName: string } | null> {
  try {
    const raw = await sendSWMessage({ type: 'GET_VERSION' })
    // Type guard to validate the response shape
    if (
      raw !== null &&
      typeof raw === 'object' &&
      'version' in raw &&
      'cacheName' in raw &&
      typeof raw.version === 'string' &&
      typeof raw.cacheName === 'string'
    ) {
      return { version: raw.version, cacheName: raw.cacheName }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Clear the SW cache
 */
export async function clearSWCache(): Promise<boolean> {
  try {
    const raw = await sendSWMessage({ type: 'CLEAR_CACHE' })
    // Validate response shape - only return true if success is explicitly true
    if (raw !== null && typeof raw === 'object' && 'success' in raw && raw.success === true) {
      return true
    }
    return false
  } catch {
    return false
  }
}
