import { afterEach, describe, expect, it, vi } from 'vitest'

import { createSpeechStorage } from '@/lib/speech/speech-storage'
import type { SpeechPreferences } from '@/lib/speech/types'

describe('speech-storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves and loads speech preferences', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSpeechStorage({ databaseName: 'test-speech-db' })
    const prefs: SpeechPreferences = {
      muted: true,
      verbosity: 'verbose',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    await storage.saveSpeechPreferences(prefs)
    const loaded = await storage.loadSpeechPreferences()
    expect(loaded).toEqual(prefs)
  })

  it('returns null when no preference stored', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSpeechStorage({ databaseName: 'test-speech-empty-db' })
    const loaded = await storage.loadSpeechPreferences()
    expect(loaded).toBeNull()
  })

  it('clears speech preferences', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSpeechStorage({ databaseName: 'test-speech-clear-db' })
    const prefs: SpeechPreferences = {
      muted: false,
      verbosity: 'standard',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    await storage.saveSpeechPreferences(prefs)
    await storage.clearSpeechPreferences()
    const loaded = await storage.loadSpeechPreferences()
    expect(loaded).toBeNull()
  })

  it('rejects when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)

    const storage = createSpeechStorage({ databaseName: 'missing-indexeddb' })
    await expect(storage.loadSpeechPreferences()).rejects.toThrowError(
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

    const storage = createSpeechStorage({ databaseName: 'open-error-db' })
    await expect(storage.loadSpeechPreferences()).rejects.toThrowError(
      'Unable to open the speech preference database.'
    )
  })

  it('rejects when opening the database is blocked', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'blocked'
      }).factory
    )

    const storage = createSpeechStorage({ databaseName: 'blocked-db' })
    await expect(storage.loadSpeechPreferences()).rejects.toThrowError(
      'Opening the speech preference database was blocked.'
    )
  })

  it('rejects when a read request fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        getOutcome: 'error'
      }).factory
    )

    const storage = createSpeechStorage({ databaseName: 'get-error-db' })
    await expect(storage.loadSpeechPreferences()).rejects.toThrowError('IndexedDB request failed.')
  })

  it('rejects when a write transaction errors', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        writeOutcome: 'error'
      }).factory
    )

    const storage = createSpeechStorage({ databaseName: 'write-error-db' })
    const prefs: SpeechPreferences = {
      muted: true,
      verbosity: 'minimal',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    await expect(storage.saveSpeechPreferences(prefs)).rejects.toThrowError(
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

    const storage = createSpeechStorage({ databaseName: 'write-abort-db' })
    await expect(storage.clearSpeechPreferences()).rejects.toThrowError(
      'IndexedDB transaction was aborted.'
    )
  })

  it('skips object-store creation when the store already exists', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      storeExists: true
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSpeechStorage({ databaseName: 'existing-store-db' })
    await expect(storage.loadSpeechPreferences()).resolves.toBeNull()
    expect(fakeIndexedDb.createdObjectStores).toHaveLength(0)
  })

  it('saves with different verbosity levels', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSpeechStorage({ databaseName: 'test-verbosity-db' })

    // Test minimal verbosity
    const minimalPrefs: SpeechPreferences = {
      muted: false,
      verbosity: 'minimal',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    await storage.saveSpeechPreferences(minimalPrefs)
    let loaded = await storage.loadSpeechPreferences()
    expect(loaded).toEqual(minimalPrefs)

    // Test standard verbosity
    const standardPrefs: SpeechPreferences = {
      muted: false,
      verbosity: 'standard',
      updatedAt: '2024-01-01T00:01:00.000Z'
    }
    await storage.saveSpeechPreferences(standardPrefs)
    loaded = await storage.loadSpeechPreferences()
    expect(loaded).toEqual(standardPrefs)

    // Test verbose verbosity
    const verbosePrefs: SpeechPreferences = {
      muted: false,
      verbosity: 'verbose',
      updatedAt: '2024-01-01T00:02:00.000Z'
    }
    await storage.saveSpeechPreferences(verbosePrefs)
    loaded = await storage.loadSpeechPreferences()
    expect(loaded).toEqual(verbosePrefs)
  })

  it('overwrites existing preferences', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSpeechStorage({ databaseName: 'test-overwrite-db' })

    const initialPrefs: SpeechPreferences = {
      muted: false,
      verbosity: 'standard',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    await storage.saveSpeechPreferences(initialPrefs)

    const updatedPrefs: SpeechPreferences = {
      muted: true,
      verbosity: 'minimal',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }
    await storage.saveSpeechPreferences(updatedPrefs)

    const loaded = await storage.loadSpeechPreferences()
    expect(loaded).toEqual(updatedPrefs)
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
    open: vi.fn((_databaseName: string, _version?: number) => {
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
