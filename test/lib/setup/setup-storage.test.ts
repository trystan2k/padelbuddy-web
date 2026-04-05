import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  sharedIndexedDbObjectStoreNames,
  setupPreferenceObjectStoreName,
  speechPreferenceObjectStoreName
} from '@/lib/persistence/indexed-db'
import {
  createSetupStorage,
  defaultSetupPreferences,
  type SetupPreferences
} from '@/lib/setup/setup-storage'
import type { SpeechPreferences } from '@/lib/speech/types'

describe('setup-storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves and loads unified setup preferences', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'test-setup-db' })
    const preferences: SetupPreferences = {
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    }

    await storage.saveSetupPreferences(preferences)

    await expect(storage.loadSetupPreferences()).resolves.toEqual(preferences)
  })

  it('clears unified setup preferences', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'test-setup-clear-db' })

    await storage.saveSetupPreferences(defaultSetupPreferences)
    await storage.clearSetupPreferences()

    await expect(storage.loadSetupPreferences()).resolves.toBeNull()
  })

  it('keeps setup toggles when speech preferences are saved', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'test-speech-slice-db' })

    await storage.saveSetupPreferenceSlice({
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 60,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })

    await storage.saveSpeechPreferences({
      muted: true,
      verbosity: 'minimal',
      voiceName: 'Alex',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })

    await expect(storage.loadSetupPreferences()).resolves.toEqual({
      muted: true,
      verbosity: 'minimal',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 60,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })
    expect(fakeIndexedDb.getRecord(setupPreferenceObjectStoreName, 'setup-preference')).toEqual({
      muted: true,
      verbosity: 'minimal',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 60,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true,
      updatedAt: '2024-01-01T00:00:00.000Z'
    })
  })

  it('keeps speech preferences when setup toggles are saved', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'test-setup-slice-db' })

    await storage.saveSpeechPreferences({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })

    await storage.saveSetupPreferenceSlice({
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })

    await expect(storage.loadSpeechPreferences()).resolves.toEqual({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: expect.any(String)
    })
  })

  it('allows voiceName to be explicitly cleared by a slice save', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'test-voice-clear-db' })

    await storage.saveSpeechPreferences({
      muted: false,
      verbosity: 'standard',
      voiceName: 'Alex',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })

    await storage.saveSetupPreferenceSlice({ voiceName: null })

    await expect(storage.loadSpeechPreferences()).resolves.toEqual({
      muted: false,
      verbosity: 'standard',
      voiceName: null,
      updatedAt: expect.any(String)
    })
  })

  it('clears only the speech preference slice', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'test-clear-speech-slice-db' })

    await storage.saveSetupPreferences({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })

    await storage.clearSpeechPreferences()

    await expect(storage.loadSetupPreferences()).resolves.toEqual({
      ...defaultSetupPreferences,
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })
  })

  it('does not create a record when clearSpeechPreferences is called on a fresh database', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'clear-speech-fresh-db' })

    await storage.clearSpeechPreferences()

    await expect(storage.loadSetupPreferences()).resolves.toBeNull()
  })

  it('clears speech preferences while preserving setup fields and refreshing updatedAt', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'clear-speech-updated-at-db' })

    await storage.saveSetupPreferences({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })

    const beforeClear = fakeIndexedDb.getRecord(
      setupPreferenceObjectStoreName,
      'setup-preference'
    ) as SetupPreferences & { updatedAt: string }

    await storage.clearSpeechPreferences()

    expect(fakeIndexedDb.getRecord(setupPreferenceObjectStoreName, 'setup-preference')).toEqual({
      ...defaultSetupPreferences,
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true,
      updatedAt: expect.any(String)
    })

    const afterClear = fakeIndexedDb.getRecord(
      setupPreferenceObjectStoreName,
      'setup-preference'
    ) as SetupPreferences & { updatedAt: string }
    expect(afterClear.updatedAt >= beforeClear.updatedAt).toBe(true)
  })

  it('returns null when stored countdown duration is invalid', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      initialObjectStoreNames: [setupPreferenceObjectStoreName],
      initialRecords: [
        {
          storeName: setupPreferenceObjectStoreName,
          key: 'setup-preference',
          value: {
            ...defaultSetupPreferences,
            countdownTimerDuration: 30,
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        }
      ]
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'invalid-countdown-db' })

    await expect(storage.loadSetupPreferences()).resolves.toBeNull()
  })

  it('returns null when stored voiceName is invalid', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      initialObjectStoreNames: [setupPreferenceObjectStoreName],
      initialRecords: [
        {
          storeName: setupPreferenceObjectStoreName,
          key: 'setup-preference',
          value: {
            ...defaultSetupPreferences,
            voiceName: { name: 'Alex' },
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        }
      ]
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'invalid-voice-db' })

    await expect(storage.loadSetupPreferences()).resolves.toBeNull()
  })

  it('creates the new shared IndexedDB stores for fresh databases', async () => {
    const fakeIndexedDb = createFakeIndexedDb()
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'fresh-shared-db' })

    await expect(storage.loadSetupPreferences()).resolves.toBeNull()
    expect(fakeIndexedDb.createdObjectStores).toEqual([...sharedIndexedDbObjectStoreNames])
    expect(fakeIndexedDb.createdObjectStores).not.toContain(speechPreferenceObjectStoreName)
  })

  it('migrates legacy speech preferences into the unified setup store', async () => {
    const legacySpeechPreferences: SpeechPreferences = {
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    const fakeIndexedDb = createFakeIndexedDb({
      initialObjectStoreNames: [speechPreferenceObjectStoreName],
      initialRecords: [
        {
          storeName: speechPreferenceObjectStoreName,
          key: 'speech-preference',
          value: legacySpeechPreferences
        }
      ]
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'legacy-migration-db' })

    await expect(storage.loadSetupPreferences()).resolves.toEqual({
      ...defaultSetupPreferences,
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex'
    })

    expect(fakeIndexedDb.getRecord(setupPreferenceObjectStoreName, 'setup-preference')).toEqual({
      ...defaultSetupPreferences,
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: expect.any(String)
    })
    expect(fakeIndexedDb.getRecord(speechPreferenceObjectStoreName, 'speech-preference')).toEqual(
      legacySpeechPreferences
    )
  })

  it('migrates legacy speech preferences when loading the speech slice directly', async () => {
    const legacySpeechPreferences: SpeechPreferences = {
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
    const fakeIndexedDb = createFakeIndexedDb({
      initialObjectStoreNames: [speechPreferenceObjectStoreName],
      initialRecords: [
        {
          storeName: speechPreferenceObjectStoreName,
          key: 'speech-preference',
          value: legacySpeechPreferences
        }
      ]
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'legacy-speech-load-db' })

    const loadedPreferences = await storage.loadSpeechPreferences()

    expect(loadedPreferences).toEqual({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: expect.any(String)
    })
    expect(fakeIndexedDb.getRecord(setupPreferenceObjectStoreName, 'setup-preference')).toEqual({
      ...defaultSetupPreferences,
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      updatedAt: loadedPreferences?.updatedAt
    })
    expect(fakeIndexedDb.getRecord(speechPreferenceObjectStoreName, 'speech-preference')).toEqual(
      legacySpeechPreferences
    )
  })

  it('prefers an existing unified setup record over legacy speech data', async () => {
    const fakeIndexedDb = createFakeIndexedDb({
      initialObjectStoreNames: [setupPreferenceObjectStoreName, speechPreferenceObjectStoreName],
      initialRecords: [
        {
          storeName: setupPreferenceObjectStoreName,
          key: 'setup-preference',
          value: {
            ...defaultSetupPreferences,
            voiceName: 'Unified Voice',
            gameMode: 'golden-point',
            updatedAt: '2024-01-02T00:00:00.000Z'
          }
        },
        {
          storeName: speechPreferenceObjectStoreName,
          key: 'speech-preference',
          value: {
            muted: true,
            verbosity: 'verbose',
            voiceName: 'Legacy Voice',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        }
      ]
    })
    vi.stubGlobal('indexedDB', fakeIndexedDb.factory)

    const storage = createSetupStorage({ databaseName: 'unified-wins-db' })

    await expect(storage.loadSetupPreferences()).resolves.toEqual({
      ...defaultSetupPreferences,
      voiceName: 'Unified Voice',
      gameMode: 'golden-point'
    })
    expect(fakeIndexedDb.getRecord(speechPreferenceObjectStoreName, 'speech-preference')).toEqual({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Legacy Voice',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })
  })
})

function createFakeIndexedDb(
  options: {
    initialObjectStoreNames?: string[]
    initialRecords?: Array<{ storeName: string; key: string; value: unknown }>
    openOutcome?: 'success' | 'error' | 'blocked'
    getOutcome?: 'success' | 'error'
    writeOutcome?: 'complete' | 'error' | 'abort'
  } = {}
) {
  const createdObjectStores: string[] = []
  const stores = new Map<string, Map<string, unknown>>()

  for (const storeName of options.initialObjectStoreNames ?? []) {
    stores.set(storeName, new Map())
  }

  for (const record of options.initialRecords ?? []) {
    const store = stores.get(record.storeName) ?? new Map<string, unknown>()
    store.set(record.key, record.value)
    stores.set(record.storeName, store)
  }

  const config = {
    openOutcome: options.openOutcome ?? 'success',
    getOutcome: options.getOutcome ?? 'success',
    writeOutcome: options.writeOutcome ?? 'complete'
  }

  const factory = {
    open: vi.fn<(_databaseName: string, _version?: number) => FakeOpenRequest<FakeDatabase>>(
      (_databaseName, _version?: number) => {
        const request = new FakeOpenRequest<FakeDatabase>()
        const database = new FakeDatabase(
          stores,
          config,
          createdObjectStores,
          options.initialObjectStoreNames ?? []
        )

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
    createdObjectStores,
    getRecord: (storeName: string, key: string) => stores.get(storeName)?.get(key)
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
    private readonly stores: Map<string, Map<string, unknown>>,
    private readonly options: {
      getOutcome: 'success' | 'error'
      writeOutcome: 'complete' | 'error' | 'abort'
    },
    private readonly createdObjectStores: string[],
    initialObjectStoreNames: string[]
  ) {
    this.storeNames = new Set(initialObjectStoreNames)
  }

  objectStoreNames = {
    contains: (name: string) => this.storeNames.has(name)
  }

  createObjectStore(name: string): Record<string, never> {
    this.storeNames.add(name)
    this.createdObjectStores.push(name)
    this.stores.set(name, this.stores.get(name) ?? new Map())

    return {}
  }

  transaction(name: string | string[], _mode: string): FakeTransaction {
    const objectStoreNames = Array.isArray(name) ? name : [name]
    return new FakeTransaction(this.stores, this.options, objectStoreNames)
  }

  close(): void {}
}

class FakeTransaction extends EventTarget {
  error: Error | null = null
  private writeCompletionScheduled = false

  constructor(
    private readonly stores: Map<string, Map<string, unknown>>,
    private readonly options: {
      getOutcome: 'success' | 'error'
      writeOutcome: 'complete' | 'error' | 'abort'
    },
    private readonly objectStoreNames: string[]
  ) {
    super()
  }

  objectStore(name: string) {
    if (!this.objectStoreNames.includes(name)) {
      throw new Error(`Object store ${name} is not part of this fake transaction.`)
    }

    const store = this.stores.get(name) ?? new Map<string, unknown>()
    this.stores.set(name, store)

    return {
      get: (key: unknown) => {
        const request = new FakeRequest<unknown>()

        queueMicrotask(() => {
          if (this.options.getOutcome === 'error') {
            request.error = null
            request.dispatchEvent(new Event('error'))
            return
          }

          request.result = store.get(normalizeKey(key))
          request.dispatchEvent(new Event('success'))
          queueMicrotask(() => {
            this.dispatchEvent(new Event('complete'))
          })
        })

        return request
      },
      put: (value: unknown, key?: unknown) => {
        store.set(normalizeKey(key), value)
        this.scheduleWriteFinish()
        return {}
      },
      delete: (key: unknown) => {
        store.delete(normalizeKey(key))
        this.scheduleWriteFinish()
        return {}
      }
    }
  }

  private scheduleWriteFinish(): void {
    if (this.writeCompletionScheduled) {
      return
    }

    this.writeCompletionScheduled = true

    queueMicrotask(() => {
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
    })
  }
}

function normalizeKey(key: unknown): string {
  if (typeof key !== 'string') {
    throw new Error('Fake IndexedDB only supports string keys in tests.')
  }

  return key
}
