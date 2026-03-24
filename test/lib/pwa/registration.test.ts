import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// ── Helpers ──────────────────────────────────────────────────────────────────

function createMockRegistration(overrides?: Partial<ServiceWorkerRegistration>) {
  return {
    unregister: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    active: { state: 'activated' } as ServiceWorker,
    installing: null as ServiceWorker | null,
    waiting: null as ServiceWorker | null,
    scope: '/',
    update: vi.fn().mockResolvedValue(undefined),
    ...overrides
  } as unknown as ServiceWorkerRegistration
}

interface StubResult {
  controllerPostMessage: Mock | null
  register: Mock
  getRegistrations: Mock
}

function stubServiceWorker(hasController = true): StubResult {
  const controllerPostMessage = hasController ? vi.fn() : null

  const sw: Record<string, unknown> = {
    controller: hasController ? { postMessage: controllerPostMessage } : null,
    register: vi.fn().mockResolvedValue(createMockRegistration()),
    getRegistrations: vi.fn().mockResolvedValue([])
  }

  vi.stubGlobal('navigator', { serviceWorker: sw })
  return {
    controllerPostMessage,
    register: sw.register as Mock,
    getRegistrations: sw.getRegistrations as Mock
  }
}

/** Helper: extract port2 from the transferables passed to controller.postMessage */
function getPort2FromCall(postMessageSpy: Mock): MessagePort {
  const callArgs = postMessageSpy.mock.calls[0]!
  const transferables = callArgs[1] as MessagePort[]
  return transferables[0]!
}

/** Helper: send a response through the MessageChannel port2 → port1 */
function respondViaPort(port2: MessagePort, data: unknown) {
  port2.postMessage(data)
}

// Dynamic import helper to get fresh module state
async function importRegistration() {
  return import('@/lib/pwa/registration')
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('PWA registration module', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  // ── isServiceWorkerSupported ─────────────────────────────────────────────

  describe('isServiceWorkerSupported', () => {
    it('returns true when navigator.serviceWorker exists', async () => {
      stubServiceWorker()
      const { isServiceWorkerSupported } = await importRegistration()
      expect(isServiceWorkerSupported()).toBe(true)
    })

    it('returns false when navigator.serviceWorker is missing', async () => {
      vi.stubGlobal('navigator', {})
      const { isServiceWorkerSupported } = await importRegistration()
      expect(isServiceWorkerSupported()).toBe(false)
    })
  })

  // ── registerSW ──────────────────────────────────────────────────────────

  describe('registerSW', () => {
    it('registers service worker with correct options', async () => {
      const { register } = stubServiceWorker()
      const { registerSW } = await importRegistration()

      const result = await registerSW()

      expect(result).not.toBeNull()
      expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    })

    it('returns null when service workers are not supported', async () => {
      vi.stubGlobal('navigator', {})
      const { registerSW } = await importRegistration()

      const result = await registerSW()

      expect(result).toBeNull()
    })

    it('returns null and logs error when registration throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { register } = stubServiceWorker()
      register.mockRejectedValue(new Error('Network error'))
      const { registerSW } = await importRegistration()

      const result = await registerSW()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SW] Registration failed'),
        expect.any(Error)
      )
    })

    it('sets up updatefound listener on the registration', async () => {
      const addEventListenerSpy = vi.fn()
      const mockRegistration = createMockRegistration({ addEventListener: addEventListenerSpy })
      const { register } = stubServiceWorker()
      register.mockResolvedValue(mockRegistration)
      const { registerSW } = await importRegistration()

      await registerSW()

      expect(addEventListenerSpy).toHaveBeenCalledWith('updatefound', expect.any(Function))
    })

    it('updatefound handler logs warning when new worker installs and controller exists', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const installingAddEventListener = vi.fn()
      const mockInstalling = {
        state: 'installed',
        addEventListener: installingAddEventListener
      } as unknown as ServiceWorker
      const regAddEventListener = vi.fn()
      const mockRegistration = createMockRegistration({
        installing: mockInstalling,
        addEventListener: regAddEventListener
      })
      const { register } = stubServiceWorker()
      register.mockResolvedValue(mockRegistration)
      const { registerSW } = await importRegistration()

      await registerSW()

      // Grab the updatefound handler
      const updatefoundCalls = (regAddEventListener as Mock).mock.calls
      const updatefoundHandler = updatefoundCalls.find(
        (call: unknown[]) => call[0] === 'updatefound'
      )![1] as EventListener

      // Simulate updatefound event
      updatefoundHandler(new Event('updatefound'))

      // Grab the statechange handler on the installing worker
      expect(installingAddEventListener).toHaveBeenCalledWith('statechange', expect.any(Function))
      const statechangeHandler = (installingAddEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'statechange'
      )![1] as EventListener

      // Simulate statechange to installed while controller exists
      ;(mockInstalling as unknown as Record<string, unknown>).state = 'installed'
      statechangeHandler(new Event('statechange'))

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('New version available'))
    })

    it('updatefound handler does nothing when no installing worker', async () => {
      const mockRegistration = createMockRegistration({ installing: null })
      const { register } = stubServiceWorker()
      register.mockResolvedValue(mockRegistration)
      const { registerSW } = await importRegistration()

      await registerSW()

      const updatefoundCalls = (mockRegistration.addEventListener as Mock).mock.calls
      const updatefoundHandler = updatefoundCalls.find(
        (call: unknown[]) => call[0] === 'updatefound'
      )![1] as EventListener

      // Should not throw when installing is null
      expect(() => updatefoundHandler(new Event('updatefound'))).not.toThrow()
    })

    it('updatefound handler does not warn when no controller exists', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const mockInstalling = {
        state: 'installed',
        addEventListener: vi.fn()
      } as unknown as ServiceWorker
      const mockRegistration = createMockRegistration({
        installing: mockInstalling
      })
      // No controller - first page load scenario
      const { register } = stubServiceWorker(false)
      register.mockResolvedValue(mockRegistration)
      const { registerSW } = await importRegistration()

      await registerSW()

      const updatefoundCalls = (mockRegistration.addEventListener as Mock).mock.calls
      const updatefoundHandler = updatefoundCalls.find(
        (call: unknown[]) => call[0] === 'updatefound'
      )![1] as EventListener

      updatefoundHandler(new Event('updatefound'))

      const statechangeHandler = (mockInstalling.addEventListener as Mock).mock.calls.find(
        (call: unknown[]) => call[0] === 'statechange'
      )![1] as EventListener

      ;(mockInstalling as unknown as Record<string, unknown>).state = 'installed'
      statechangeHandler(new Event('statechange'))

      // Should NOT warn because no controller exists (first visit)
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  // ── unregisterSW ────────────────────────────────────────────────────────

  describe('unregisterSW', () => {
    it('does nothing when service workers are not supported', async () => {
      vi.stubGlobal('navigator', {})
      const { unregisterSW } = await importRegistration()
      await expect(unregisterSW()).resolves.toBeUndefined()
    })

    it('unregisters all registrations when no cached registration exists', async () => {
      const unregister1 = vi.fn().mockResolvedValue(undefined)
      const unregister2 = vi.fn().mockResolvedValue(undefined)
      const mockReg1 = createMockRegistration({ unregister: unregister1 })
      const mockReg2 = createMockRegistration({ unregister: unregister2 })
      const { getRegistrations } = stubServiceWorker()
      getRegistrations.mockResolvedValue([mockReg1, mockReg2])
      const { unregisterSW } = await importRegistration()

      await unregisterSW()

      expect(unregister1).toHaveBeenCalled()
      expect(unregister2).toHaveBeenCalled()
    })

    it('unregisters the cached registration directly', async () => {
      const unregisterSpy = vi.fn().mockResolvedValue(undefined)
      const mockRegistration = createMockRegistration({ unregister: unregisterSpy })
      const { register } = stubServiceWorker()
      register.mockResolvedValue(mockRegistration)
      const { registerSW, unregisterSW } = await importRegistration()

      await registerSW()
      await unregisterSW()

      expect(unregisterSpy).toHaveBeenCalled()
    })

    it('sets cached registration to null after unregister', async () => {
      const mockRegistration = createMockRegistration()
      const { register, getRegistrations } = stubServiceWorker()
      register.mockResolvedValue(mockRegistration)
      const { registerSW, unregisterSW } = await importRegistration()

      await registerSW()
      await unregisterSW()

      // After unregister, the module-level registration should be null
      // which means next call should go through getRegistrations path
      getRegistrations.mockResolvedValue([])
      await unregisterSW()
      expect(getRegistrations).toHaveBeenCalled()
    })
  })

  // ── getSWState ──────────────────────────────────────────────────────────

  describe('getSWState', () => {
    it('returns not-supported state when SW is not supported', async () => {
      vi.stubGlobal('navigator', {})
      const { getSWState } = await importRegistration()

      const state = await getSWState()

      expect(state).toEqual({
        supported: false,
        registered: false,
        ready: false
      })
    })

    it('returns supported-but-not-registered when no registrations exist', async () => {
      const { getRegistrations } = stubServiceWorker()
      getRegistrations.mockResolvedValue([])
      const { getSWState } = await importRegistration()

      const state = await getSWState()

      expect(state).toEqual({
        supported: true,
        registered: false,
        ready: false
      })
    })

    it('returns registered with ready=true when active SW exists', async () => {
      const activeReg = createMockRegistration({ active: { state: 'activated' } as ServiceWorker })
      const { getRegistrations } = stubServiceWorker()
      getRegistrations.mockResolvedValue([activeReg])
      const { getSWState } = await importRegistration()

      const state = await getSWState()

      expect(state).toEqual({
        supported: true,
        registered: true,
        ready: true
      })
    })

    it('returns registered with ready=false when active is null', async () => {
      const regWithoutActive = createMockRegistration({ active: null })
      const { getRegistrations } = stubServiceWorker()
      getRegistrations.mockResolvedValue([regWithoutActive])
      const { getSWState } = await importRegistration()

      const state = await getSWState()

      expect(state).toEqual({
        supported: true,
        registered: true,
        ready: false
      })
    })

    it('returns error state when getRegistrations throws', async () => {
      const { getRegistrations } = stubServiceWorker()
      getRegistrations.mockRejectedValue(new Error('Permission denied'))
      const { getSWState } = await importRegistration()

      const state = await getSWState()

      expect(state.supported).toBe(true)
      expect(state.registered).toBe(false)
      expect(state.ready).toBe(false)
      expect(state.error).toBeInstanceOf(Error)
      expect(state.error?.message).toBe('Permission denied')
    })

    it('wraps non-Error throws in Error instance', async () => {
      const { getRegistrations } = stubServiceWorker()
      getRegistrations.mockRejectedValue('string error')
      const { getSWState } = await importRegistration()

      const state = await getSWState()

      expect(state.error).toBeInstanceOf(Error)
      expect(state.error?.message).toBe('string error')
    })
  })

  // ── sendSWMessage ───────────────────────────────────────────────────────

  describe('sendSWMessage', () => {
    it('rejects when no active service worker controller', async () => {
      stubServiceWorker(false)
      const { sendSWMessage } = await importRegistration()

      await expect(sendSWMessage({ type: 'TEST' })).rejects.toThrow('No active service worker')
    })

    it('resolves with data when service worker responds', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { sendSWMessage } = await importRegistration()

      const messagePromise = sendSWMessage({ type: 'GET_VERSION' })
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { version: '1.0.0', cacheName: 'cache-v1' })

      await vi.advanceTimersByTimeAsync(0)

      const result = await messagePromise
      expect(result).toEqual({ version: '1.0.0', cacheName: 'cache-v1' })
    })

    it('rejects with error when SW response contains error', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { sendSWMessage } = await importRegistration()

      const messagePromise = sendSWMessage({ type: 'BAD_OP' })
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { error: 'Something went wrong' })

      await vi.advanceTimersByTimeAsync(0)

      await expect(messagePromise).rejects.toThrow('Something went wrong')
    })

    it('rejects when message times out', async () => {
      stubServiceWorker()
      const { sendSWMessage } = await importRegistration()

      const messagePromise = sendSWMessage({ type: 'SLOW_OP' }, 1000)

      // Set up the rejection handler before advancing timers to avoid unhandled rejection
      const assertion = expect(messagePromise).rejects.toThrow(
        "SW message 'SLOW_OP' timed out after 1000ms"
      )
      await vi.advanceTimersByTimeAsync(1000)
      await assertion
    })

    it('uses default timeout of 5000ms', async () => {
      stubServiceWorker()
      const { sendSWMessage } = await importRegistration()

      const messagePromise = sendSWMessage({ type: 'DEFAULT_TIMEOUT' })

      // Set up the rejection handler before advancing timers to avoid unhandled rejection
      const assertion = expect(messagePromise).rejects.toThrow(
        "SW message 'DEFAULT_TIMEOUT' timed out after 5000ms"
      )
      await vi.advanceTimersByTimeAsync(5000)
      await assertion
    })

    it('clears timeout when response arrives', async () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
      const { controllerPostMessage } = stubServiceWorker()
      const { sendSWMessage } = await importRegistration()

      const messagePromise = sendSWMessage({ type: 'QUICK_OP' })
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { ok: true })

      await vi.advanceTimersByTimeAsync(0)
      await messagePromise

      expect(clearTimeoutSpy).toHaveBeenCalled()
    })

    it('passes message and transferables to controller.postMessage', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { sendSWMessage } = await importRegistration()

      const messagePromise = sendSWMessage({ type: 'CUSTOM' })

      expect(controllerPostMessage!).toHaveBeenCalledWith(
        { type: 'CUSTOM' },
        expect.arrayContaining([expect.any(MessagePort)])
      )

      // Clean up - respond to avoid hanging
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { ok: true })
      await vi.advanceTimersByTimeAsync(0)
      await messagePromise
    })
  })

  // ── requestSWUpdate ─────────────────────────────────────────────────────

  describe('requestSWUpdate', () => {
    it('sends SKIP_WAITING message', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { requestSWUpdate } = await importRegistration()

      const messagePromise = requestSWUpdate()

      expect(controllerPostMessage!).toHaveBeenCalledWith(
        { type: 'SKIP_WAITING' },
        expect.arrayContaining([expect.any(MessagePort)])
      )

      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { ok: true })
      await vi.advanceTimersByTimeAsync(0)
      await messagePromise
    })
  })

  // ── getSWVersion ────────────────────────────────────────────────────────

  describe('getSWVersion', () => {
    it('returns version and cacheName when SW responds with valid data', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { version: '2.1.0', cacheName: 'pwa-cache-v2' })

      await vi.advanceTimersByTimeAsync(0)

      const result = await versionPromise
      expect(result).toEqual({ version: '2.1.0', cacheName: 'pwa-cache-v2' })
    })

    it('returns null when response shape is invalid (missing cacheName)', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { version: '1.0.0' })

      await vi.advanceTimersByTimeAsync(0)

      const result = await versionPromise
      expect(result).toBeNull()
    })

    it('returns null when version is not a string', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { version: 123, cacheName: 'cache' })

      await vi.advanceTimersByTimeAsync(0)

      const result = await versionPromise
      expect(result).toBeNull()
    })

    it('returns null when cacheName is not a string', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { version: '1.0.0', cacheName: 42 })

      await vi.advanceTimersByTimeAsync(0)

      const result = await versionPromise
      expect(result).toBeNull()
    })

    it('returns null when response is null', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, null)

      await vi.advanceTimersByTimeAsync(0)

      const result = await versionPromise
      expect(result).toBeNull()
    })

    it('returns null when response is a string (not object)', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, 'not-an-object')

      await vi.advanceTimersByTimeAsync(0)

      const result = await versionPromise
      expect(result).toBeNull()
    })

    it('returns null when sendSWMessage throws (no controller)', async () => {
      stubServiceWorker(false)
      const { getSWVersion } = await importRegistration()

      const result = await getSWVersion()
      expect(result).toBeNull()
    })

    it('sends GET_VERSION message type', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { getSWVersion } = await importRegistration()

      const versionPromise = getSWVersion()

      expect(controllerPostMessage!).toHaveBeenCalledWith(
        { type: 'GET_VERSION' },
        expect.arrayContaining([expect.any(MessagePort)])
      )

      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { version: '1.0.0', cacheName: 'cache' })
      await vi.advanceTimersByTimeAsync(0)
      await versionPromise
    })
  })

  // ── clearSWCache ────────────────────────────────────────────────────────

  describe('clearSWCache', () => {
    it('returns true when cache cleared successfully', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { clearSWCache } = await importRegistration()

      const cachePromise = clearSWCache()
      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { success: true })

      await vi.advanceTimersByTimeAsync(0)

      const result = await cachePromise
      expect(result).toBe(true)
    })

    it('returns false when sendSWMessage throws (no controller)', async () => {
      stubServiceWorker(false)
      const { clearSWCache } = await importRegistration()

      const result = await clearSWCache()
      expect(result).toBe(false)
    })

    it('sends CLEAR_CACHE message type', async () => {
      const { controllerPostMessage } = stubServiceWorker()
      const { clearSWCache } = await importRegistration()

      const cachePromise = clearSWCache()

      expect(controllerPostMessage!).toHaveBeenCalledWith(
        { type: 'CLEAR_CACHE' },
        expect.arrayContaining([expect.any(MessagePort)])
      )

      const port2 = getPort2FromCall(controllerPostMessage!)
      respondViaPort(port2, { success: true })
      await vi.advanceTimersByTimeAsync(0)
      await cachePromise
    })
  })
})
