import { afterEach, describe, expect, it, vi } from 'vitest'

import { createLocaleStorage } from '@/lib/i18n/locale-storage'
import type { SupportedLocale } from '@/lib/i18n/types'
import { sharedIndexedDbObjectStoreNames } from '@/lib/persistence/indexed-db'

describe('locale-storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves and loads locale preference', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createLocaleStorage({ databaseName: 'test-locale-db' })
    await storage.saveLocalePreference('pt' as SupportedLocale)
    const loaded = await storage.loadLocalePreference()
    expect(loaded).toBe('pt')
  })

  it('returns null when no preference stored', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createLocaleStorage({ databaseName: 'test-locale-empty-db' })
    const loaded = await storage.loadLocalePreference()
    expect(loaded).toBeNull()
  })

  it('clears locale preference', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createLocaleStorage({ databaseName: 'test-locale-clear-db' })
    await storage.saveLocalePreference('es' as SupportedLocale)
    await storage.clearLocalePreference()
    const loaded = await storage.loadLocalePreference()
    expect(loaded).toBeNull()
  })

  it('rejects when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)

    const storage = createLocaleStorage({ databaseName: 'missing-indexeddb' })
    await expect(storage.loadLocalePreference()).rejects.toThrowError(
      'IndexedDB is not available in this environment.'
    )
  })

  it('rejects when opening the database fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'error'
      }).factory
    )

    const storage = createLocaleStorage({ databaseName: 'open-error-db' })
    await expect(storage.loadLocalePreference()).rejects.toThrowError(
      'Unable to open the locale preference database.'
    )
  })

  it('rejects when opening the database is blocked', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'blocked'
      }).factory
    )

    const storage = createLocaleStorage({ databaseName: 'blocked-db' })
    await expect(storage.loadLocalePreference()).rejects.toThrowError(
      'Opening the locale preference database was blocked.'
    )
  })

  it('rejects when a read request fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        getOutcome: 'error'
      }).factory
    )

    const storage = createLocaleStorage({ databaseName: 'get-error-db' })
    await expect(storage.loadLocalePreference()).rejects.toThrowError('IndexedDB request failed.')
  })

  it('rejects when a write transaction errors', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        writeOutcome: 'error'
      }).factory
    )

    const storage = createLocaleStorage({ databaseName: 'write-error-db' })
    await expect(storage.saveLocalePreference('pt' as SupportedLocale)).rejects.toThrowError(
      'IndexedDB transaction failed.'
    )
  })

  it('rejects when a transaction aborts', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        writeOutcome: 'abort'
      }).factory
    )

    const storage = createLocaleStorage({ databaseName: 'write-abort-db' })
    await expect(storage.clearLocalePreference()).rejects.toThrowError(
      'IndexedDB transaction was aborted.'
    )
  })

  it('registers all shared object stores in explicit order during upgrade', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createLocaleStorage({ databaseName: 'new-shared-db' })
    await expect(storage.loadLocalePreference()).resolves.toBeNull()
    expect(fakeIndexedDb.createdObjectStores).toEqual([...sharedIndexedDbObjectStoreNames])
  })

  it('skips object-store creation when the store already exists', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      storeExists: true
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createLocaleStorage({ databaseName: 'existing-store-db' })
    await expect(storage.loadLocalePreference()).resolves.toBeNull()
    expect(fakeIndexedDb.createdObjectStores).toHaveLength(0)
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
  private readonly storeNames: Set<string>

  constructor(
    private readonly storage: Map<string, unknown>,
    private readonly options: {
      storeExists: boolean
      getOutcome: 'success' | 'error'
      writeOutcome: 'complete' | 'error' | 'abort'
    },
    private readonly createdObjectStores: string[]
  ) {
    this.storeNames = options.storeExists ? new Set(sharedIndexedDbObjectStoreNames) : new Set()
  }

  objectStoreNames = {
    contains: (name: string) => this.storeNames.has(name)
  }

  createObjectStore(name: string): Record<string, never> {
    this.storeNames.add(name)
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
