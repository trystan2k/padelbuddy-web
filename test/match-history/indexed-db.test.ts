import { afterEach, describe, expect, test, vi } from 'vitest';

import { deleteMatchHistory, listMatchHistory } from '@/lib/match-history/indexed-db';

describe('match history IndexedDB internals', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('rejects when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined);

    await expect(listMatchHistory()).rejects.toThrowError(
      'IndexedDB is not available in this environment.'
    );
  });

  test('rejects when opening the database fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'error'
      }).factory
    );

    await expect(listMatchHistory()).rejects.toThrowError(
      'Unable to open the match history database.'
    );
  });

  test('rejects when opening the database is blocked', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        openOutcome: 'blocked'
      }).factory
    );

    await expect(listMatchHistory()).rejects.toThrowError(
      'Opening the match history database was blocked.'
    );
  });

  test('rejects when a read request fails', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        getOutcome: 'error'
      }).factory
    );

    await expect(listMatchHistory()).rejects.toThrowError('IndexedDB request failed.');
  });

  test('rejects when a write transaction aborts', async () => {
    vi.stubGlobal(
      'indexedDB',
      createFakeIndexedDb({
        writeOutcome: 'abort'
      }).factory
    );

    await expect(deleteMatchHistory('history-1')).rejects.toThrowError(
      'IndexedDB transaction was aborted.'
    );
  });
});

function createFakeIndexedDb(
  options: {
    storeExists?: boolean;
    openOutcome?: 'success' | 'error' | 'blocked';
    getOutcome?: 'success' | 'error';
    writeOutcome?: 'complete' | 'error' | 'abort';
  } = {}
) {
  const createdObjectStores: string[] = [];
  const storage = new Map<string, unknown>();
  const config = {
    storeExists: options.storeExists ?? false,
    openOutcome: options.openOutcome ?? 'success',
    getOutcome: options.getOutcome ?? 'success',
    writeOutcome: options.writeOutcome ?? 'complete'
  };

  const factory = {
    open: vi.fn<() => FakeOpenRequest>(() => {
      const request = new FakeOpenRequest();
      const database = new FakeDatabase(storage, config, createdObjectStores);

      queueMicrotask(() => {
        if (config.openOutcome === 'error') {
          request.error = null;
          request.dispatchEvent(new Event('error'));

          return;
        }

        if (config.openOutcome === 'blocked') {
          request.dispatchEvent(new Event('blocked'));

          return;
        }

        request.result = database;
        request.dispatchEvent(new Event('upgradeneeded'));
        request.dispatchEvent(new Event('success'));
      });

      return request;
    })
  };

  return {
    factory,
    createdObjectStores
  };
}

class FakeOpenRequest extends EventTarget {
  error: Error | null = null;
  result!: unknown;
}

class FakeRequest extends EventTarget {
  error: Error | null = null;
  result!: unknown;
}

class FakeDatabase {
  private hasStore: boolean;

  constructor(
    private readonly storage: Map<string, unknown>,
    private readonly options: {
      storeExists: boolean;
      getOutcome: 'success' | 'error';
      writeOutcome: 'complete' | 'error' | 'abort';
    },
    private readonly createdObjectStores: string[]
  ) {
    this.hasStore = options.storeExists;
  }

  objectStoreNames = {
    contains: (_name: string) => this.hasStore
  };

  createObjectStore(name: string): Record<string, never> {
    this.hasStore = true;
    this.createdObjectStores.push(name);

    return {};
  }

  transaction(_name: string, _mode: string): FakeTransaction {
    return new FakeTransaction(this.storage, this.options);
  }

  close(): void {}
}

class FakeTransaction extends EventTarget {
  error: Error | null = null;

  constructor(
    private readonly storage: Map<string, unknown>,
    private readonly options: {
      getOutcome: 'success' | 'error';
      writeOutcome: 'complete' | 'error' | 'abort';
    }
  ) {
    super();
  }

  objectStore(_name: string) {
    return {
      get: (key: unknown) => this.createReadRequest(() => this.storage.get(normalizeKey(key))),
      getAll: () => this.createReadRequest(() => [...this.storage.values()]),
      put: (value: unknown, key?: unknown) => {
        this.storage.set(normalizeKey(key), value);
        queueMicrotask(() => {
          this.finishWrite();
        });

        return {};
      },
      delete: (key: unknown) => {
        this.storage.delete(normalizeKey(key));
        queueMicrotask(() => {
          this.finishWrite();
        });

        return {};
      }
    };
  }

  private createReadRequest(resolveValue: () => unknown): FakeRequest {
    const request = new FakeRequest();

    queueMicrotask(() => {
      if (this.options.getOutcome === 'error') {
        request.error = null;
        request.dispatchEvent(new Event('error'));

        return;
      }

      request.result = resolveValue();
      request.dispatchEvent(new Event('success'));
      queueMicrotask(() => {
        this.dispatchEvent(new Event('complete'));
      });
    });

    return request;
  }

  private finishWrite(): void {
    if (this.options.writeOutcome === 'error') {
      this.error = null;
      this.dispatchEvent(new Event('error'));

      return;
    }

    if (this.options.writeOutcome === 'abort') {
      this.error = null;
      this.dispatchEvent(new Event('abort'));

      return;
    }

    this.dispatchEvent(new Event('complete'));
  }
}

function normalizeKey(key: unknown): string {
  if (typeof key !== 'string') {
    throw new Error('Fake IndexedDB only supports string keys in tests.');
  }

  return key;
}
