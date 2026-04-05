import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  clearCurrentMatch,
  createCurrentMatchPersistence,
  loadCurrentMatch,
  saveCurrentMatch
} from '@/lib/current-match/indexed-db'

import { createTestSetup, scorePoints } from '../core/match/test-helpers'

describe('current match IndexedDB internals', () => {
  const testStartedAt = Date.now()

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('rejects when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'missing-indexeddb',
        objectStoreName: 'current-match'
      }).loadCurrentMatch()
    ).rejects.toThrowError('IndexedDB is not available in this environment.')
  })

  test('uses the default exported helpers with the default object store', async () => {
    const fakeIndexedDb = createFakeIndexedDb()

    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    await expect(
      saveCurrentMatch({
        setup: createTestSetup(),
        actions: scorePoints('team-1'),
        startedAt: testStartedAt
      })
    ).resolves.toMatchObject({
      actions: scorePoints('team-1')
    })
    await expect(loadCurrentMatch()).resolves.toMatchObject({
      status: 'ok'
    })
    await expect(clearCurrentMatch()).resolves.toBeUndefined()
    expect(fakeIndexedDb.createdObjectStores).toContain('current-match')
  })

  test('skips object-store creation when the store already exists', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      storeExists: true
    })

    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'existing-store-db',
        objectStoreName: 'current-match'
      }).loadCurrentMatch()
    ).resolves.toEqual({
      status: 'empty'
    })
    expect(fakeIndexedDb.createdObjectStores).toHaveLength(0)
  })

  test('rejects when opening the database fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'error'
      }).factory
    )

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'open-error-db',
        objectStoreName: 'current-match'
      }).loadCurrentMatch()
    ).rejects.toThrowError('Unable to open the current match database.')
  })

  test('rejects when opening the database is blocked', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'blocked'
      }).factory
    )

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'blocked-db',
        objectStoreName: 'current-match'
      }).loadCurrentMatch()
    ).rejects.toThrowError('Opening the current match database was blocked.')
  })

  test('rejects when a read request fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        getOutcome: 'error'
      }).factory
    )

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'get-error-db',
        objectStoreName: 'current-match'
      }).loadCurrentMatch()
    ).rejects.toThrowError('IndexedDB request failed.')
  })

  test('rejects when a write transaction errors', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        writeOutcome: 'error'
      }).factory
    )

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'write-error-db',
        objectStoreName: 'current-match'
      }).saveCurrentMatch({
        setup: createTestSetup(),
        actions: scorePoints('team-1')
      })
    ).rejects.toThrowError('IndexedDB transaction failed.')
  })

  test('rejects when a transaction aborts', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        writeOutcome: 'abort'
      }).factory
    )

    await expect(
      createCurrentMatchPersistence({
        databaseName: 'write-abort-db',
        objectStoreName: 'current-match'
      }).clearCurrentMatch()
    ).rejects.toThrowError('IndexedDB transaction was aborted.')
  })
})

function createFakeIndexedDb(
  options: {
    storeExists?: boolean
    openOutcome?: 'success' | 'error' | 'blocked'
    getOutcome?: 'success' | 'error'
    writeOutcome?: 'complete' | 'error' | 'abort'
  } = {}
) {
  const createdObjectStores: string[] = []
  const storage = new Map<string, unknown>()
  const config = {
    storeExists: options.storeExists ?? false,
    openOutcome: options.openOutcome ?? 'success',
    getOutcome: options.getOutcome ?? 'success',
    writeOutcome: options.writeOutcome ?? 'complete'
  }

  const factory = {
    open: vi.fn<(_databaseName: string, _version?: number) => FakeOpenRequest<FakeDatabase>>(
      (_databaseName, _version?: number) => {
        const request = new FakeOpenRequest<FakeDatabase>()
        const database = new FakeDatabase(storage, config, createdObjectStores)

        queueMicrotask(() => {
          if (config.openOutcome === 'error') {
            request.error = null
            request.dispatchEvent(new Event('error'))

            return
          }

          if (config.openOutcome === 'blocked') {
            request.dispatchEvent(new Event('blocked'))

            return
          }

          request.result = database
          request.dispatchEvent(new Event('upgradeneeded'))
          request.dispatchEvent(new Event('success'))
        })

        return request
      }
    )
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
  private hasStore: boolean

  constructor(
    private readonly storage: Map<string, unknown>,
    private readonly options: {
      storeExists: boolean
      getOutcome: 'success' | 'error'
      writeOutcome: 'complete' | 'error' | 'abort'
    },
    private readonly createdObjectStores: string[]
  ) {
    this.hasStore = options.storeExists
  }

  objectStoreNames = {
    contains: (_name: string) => this.hasStore
  }

  createObjectStore(name: string): Record<string, never> {
    this.hasStore = true
    this.createdObjectStores.push(name)

    return {}
  }

  transaction(_name: string, _mode: string): FakeTransaction {
    return new FakeTransaction(this.storage, this.options)
  }

  close(): void {}
}

class FakeTransaction extends EventTarget {
  error: Error | null = null

  constructor(
    private readonly storage: Map<string, unknown>,
    private readonly options: {
      getOutcome: 'success' | 'error'
      writeOutcome: 'complete' | 'error' | 'abort'
    }
  ) {
    super()
  }

  objectStore(_name: string) {
    return {
      get: (key: unknown) => {
        const request = new FakeRequest<unknown>()

        queueMicrotask(() => {
          if (this.options.getOutcome === 'error') {
            request.error = null
            request.dispatchEvent(new Event('error'))

            return
          }

          request.result = this.storage.get(normalizeKey(key))
          request.dispatchEvent(new Event('success'))
          queueMicrotask(() => {
            this.dispatchEvent(new Event('complete'))
          })
        })

        return request
      },
      put: (value: unknown, key?: unknown) => {
        this.storage.set(normalizeKey(key), value)
        queueMicrotask(() => {
          this.finishWrite()
        })

        return {}
      },
      delete: (key: unknown) => {
        this.storage.delete(normalizeKey(key))
        queueMicrotask(() => {
          this.finishWrite()
        })

        return {}
      }
    }
  }

  private finishWrite(): void {
    if (this.options.writeOutcome === 'error') {
      this.error = null
      this.dispatchEvent(new Event('error'))

      return
    }

    if (this.options.writeOutcome === 'abort') {
      this.error = null
      this.dispatchEvent(new Event('abort'))

      return
    }

    this.dispatchEvent(new Event('complete'))
  }
}

function normalizeKey(key: unknown): string {
  if (typeof key !== 'string') {
    throw new Error('Fake IndexedDB only supports string keys in tests.')
  }

  return key
}
