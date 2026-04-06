import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  changeLocale,
  getCurrentLocale,
  i18n,
  initializeI18n,
  resetI18nInitialization
} from '@/lib/i18n/i18n';
import { saveLocalePreference } from '@/lib/i18n/locale-storage';

describe('i18n initialization', () => {
  afterEach(async () => {
    await resetI18nInitialization();
    vi.unstubAllGlobals();
  });

  it('uses the bundled default locale without network fetches', async () => {
    const fetchSpy = vi.fn<() => Promise<unknown>>();

    vi.stubGlobal('fetch', fetchSpy);
    vi.stubGlobal('indexedDB', undefined);

    await resetI18nInitialization();
    await initializeI18n();

    expect(getCurrentLocale()).toBe('en');
    expect(i18n.t('common.retry')).toBe('Try again');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('applies a persisted non-default locale during initialization', async () => {
    const fakeIndexedDb = createFakeIndexedDb();

    vi.stubGlobal('indexedDB', fakeIndexedDb.factory);

    await saveLocalePreference('es');
    await resetI18nInitialization();
    await initializeI18n();

    expect(getCurrentLocale()).toBe('es');
    expect(i18n.t('common.retry')).toBe('Intentar de nuevo');
  });

  it('persists locale changes across reloads', async () => {
    const fakeIndexedDb = createFakeIndexedDb();

    vi.stubGlobal('indexedDB', fakeIndexedDb.factory);

    await changeLocale('pt');
    expect(getCurrentLocale()).toBe('pt');

    await resetI18nInitialization();
    await initializeI18n();

    expect(getCurrentLocale()).toBe('pt');
    expect(i18n.t('common.retry')).toBe('Tentar novamente');
  });
});

function createFakeIndexedDb() {
  const storage = new Map<string, unknown>();

  return {
    factory: {
      open: vi.fn<(_databaseName: string, _version?: number) => FakeOpenRequest<FakeDatabase>>(
        (_databaseName, _version?: number) => {
          const request = new FakeOpenRequest<FakeDatabase>();
          const database = new FakeDatabase(storage);

          queueMicrotask(() => {
            request.result = database;
            request.dispatchEvent(new Event('upgradeneeded'));
            request.dispatchEvent(new Event('success'));
          });

          return request;
        }
      )
    }
  };
}

class FakeOpenRequest<TResult> extends EventTarget {
  error: Error | null = null;
  result!: TResult;
}

class FakeRequest<TResult> extends EventTarget {
  error: Error | null = null;
  result!: TResult;
}

class FakeDatabase {
  private readonly stores = new Set<string>();

  constructor(private readonly storage: Map<string, unknown>) {}

  objectStoreNames = {
    contains: (name: string) => this.stores.has(name)
  };

  createObjectStore(name: string): Record<string, never> {
    this.stores.add(name);

    return {};
  }

  transaction(_name: string, _mode: string): FakeTransaction {
    return new FakeTransaction(this.storage);
  }

  close(): void {}
}

class FakeTransaction extends EventTarget {
  error: Error | null = null;

  constructor(private readonly storage: Map<string, unknown>) {
    super();
  }

  objectStore(_name: string) {
    return {
      get: (key: unknown) => {
        const request = new FakeRequest<unknown>();

        queueMicrotask(() => {
          request.result = this.storage.get(normalizeKey(key));
          request.dispatchEvent(new Event('success'));
          queueMicrotask(() => {
            this.dispatchEvent(new Event('complete'));
          });
        });

        return request;
      },
      put: (value: unknown, key?: unknown) => {
        this.storage.set(normalizeKey(key), value);
        queueMicrotask(() => {
          this.dispatchEvent(new Event('complete'));
        });

        return {};
      },
      delete: (key: unknown) => {
        this.storage.delete(normalizeKey(key));
        queueMicrotask(() => {
          this.dispatchEvent(new Event('complete'));
        });

        return {};
      }
    };
  }
}

function normalizeKey(key: unknown): string {
  if (typeof key !== 'string') {
    throw new Error('Fake IndexedDB only supports string keys in tests.');
  }

  return key;
}
