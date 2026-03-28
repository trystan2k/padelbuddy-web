import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  createRemoteControllerBindings,
  createRemoteControllerStorage,
  type RemoteControllerBindings
} from '@/lib/input'
import { sharedIndexedDbObjectStoreNames } from '@/lib/persistence/indexed-db'

describe('remote-controller-storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('saves and loads remote controller bindings', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createRemoteControllerStorage({ databaseName: 'test-remote-db' })
    const bindings = createRemoteControllerBindings({
      'add-team-1': 'q',
      'revert-team-1': 'z',
      'add-team-2': 'w',
      'revert-team-2': 'x'
    })

    await storage.saveRemoteControllerBindings(bindings)

    await expect(storage.loadRemoteControllerBindings()).resolves.toEqual(bindings)
  })

  test('clears remote controller bindings', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createRemoteControllerStorage({ databaseName: 'clear-remote-db' })

    await storage.saveRemoteControllerBindings(createRemoteControllerBindings())
    await storage.clearRemoteControllerBindings()

    await expect(storage.loadRemoteControllerBindings()).resolves.toBeNull()
  })

  test('returns null when the stored record is malformed', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      seedValue: {
        bindings: {
          'add-team-1': 'q',
          'revert-team-1': 'z',
          'add-team-2': 'w'
        },
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createRemoteControllerStorage({ databaseName: 'invalid-remote-db' })

    await expect(storage.loadRemoteControllerBindings()).resolves.toBeNull()
  })

  test('returns null when the stored metadata is invalid', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      seedValue: {
        bindings: createRemoteControllerBindings(),
        updatedAt: 123
      }
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createRemoteControllerStorage({ databaseName: 'invalid-remote-meta-db' })

    await expect(storage.loadRemoteControllerBindings()).resolves.toBeNull()
  })

  test('registers the shared IndexedDB stores during upgrade', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createRemoteControllerStorage({ databaseName: 'shared-remote-db' })

    await expect(storage.loadRemoteControllerBindings()).resolves.toBeNull()
    expect(fakeIndexedDb.createdObjectStores).toEqual([...sharedIndexedDbObjectStoreNames])
  })

  test('rejects when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)

    const storage = createRemoteControllerStorage({ databaseName: 'missing-indexeddb' })

    await expect(storage.loadRemoteControllerBindings()).rejects.toThrowError(
      'IndexedDB is not available in this environment.'
    )
  })
})

function createFakeIndexedDb(
  options: {
    seedValue?: unknown
  } = {}
) {
  const createdObjectStores: string[] = []
  const storage = new Map<string, unknown>()

  if (typeof options.seedValue !== 'undefined') {
    storage.set('remote-controller-bindings', options.seedValue)
  }

  const factory = {
    open: vi.fn((_databaseName: string, _version?: number) => {
      const request = new FakeOpenRequest<FakeDatabase>()
      const database = new FakeDatabase(storage, createdObjectStores)

      queueMicrotask(() => {
        request.result = database
        request.dispatchEvent(new Event('upgradeneeded'))
        request.dispatchEvent(new Event('success'))
      })

      return request
    })
  }

  return {
    factory,
    createdObjectStores
  }
}

class FakeOpenRequest<TResult> extends EventTarget {
  error: Error | null = null
  result!: TResult
}

class FakeRequest<TResult> extends EventTarget {
  error: Error | null = null
  result!: TResult
}

class FakeDatabase {
  private readonly storeNames = new Set<string>()

  constructor(
    private readonly storage: Map<string, unknown>,
    private readonly createdObjectStores: string[]
  ) {}

  objectStoreNames = {
    contains: (name: string) => this.storeNames.has(name)
  }

  createObjectStore(name: string): Record<string, never> {
    this.storeNames.add(name)
    this.createdObjectStores.push(name)

    return {}
  }

  transaction(_name: string, _mode: string): FakeTransaction {
    return new FakeTransaction(this.storage)
  }

  close(): void {}
}

class FakeTransaction extends EventTarget {
  error: Error | null = null

  constructor(private readonly storage: Map<string, unknown>) {
    super()
  }

  objectStore(_name: string) {
    return {
      get: (key: unknown) => {
        const request = new FakeRequest<RemoteControllerBindings | undefined>()

        queueMicrotask(() => {
          request.result = this.storage.get(String(key)) as RemoteControllerBindings | undefined
          request.dispatchEvent(new Event('success'))
          queueMicrotask(() => {
            this.dispatchEvent(new Event('complete'))
          })
        })

        return request
      },
      put: (value: unknown, key: unknown) => {
        this.storage.set(String(key), value)
        queueMicrotask(() => {
          this.dispatchEvent(new Event('complete'))
        })
      },
      delete: (key: unknown) => {
        this.storage.delete(String(key))
        queueMicrotask(() => {
          this.dispatchEvent(new Event('complete'))
        })
      }
    }
  }
}
