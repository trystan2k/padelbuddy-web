import { supportedLocales, type LocalePreference, type SupportedLocale } from './types';
import {
  localePreferenceObjectStoreName,
  resolveIndexedDbStorageConfig,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '@/lib/persistence/indexed-db';

const defaultObjectStoreName = localePreferenceObjectStoreName;
const localePreferenceKey = 'locale-preference';

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the locale preference database was blocked.',
  openFailed: 'Unable to open the locale preference database.'
};

export interface LocaleStorageOptions {
  databaseName?: string;
  databaseVersion?: number;
  objectStoreName?: string;
}

export interface LocaleStorage {
  saveLocalePreference(locale: SupportedLocale): Promise<void>;
  loadLocalePreference(): Promise<SupportedLocale | null>;
  clearLocalePreference(): Promise<void>;
}

export function createLocaleStorage(options: LocaleStorageOptions = {}): LocaleStorage {
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName);

  const saveLocalePreference = async (locale: SupportedLocale): Promise<void> => {
    const preference: LocalePreference = {
      locale,
      updatedAt: new Date().toISOString()
    };

    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).put(preference, localePreferenceKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  const loadLocalePreference = async (): Promise<SupportedLocale | null> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readonly');
      const request = transaction.objectStore(config.objectStoreName).get(localePreferenceKey);
      const storedPreference = await waitForIndexedDbRequest<LocalePreference | undefined>(request);

      await waitForIndexedDbTransaction(transaction);

      if (!storedPreference) {
        return null;
      }

      if (supportedLocales.includes(storedPreference.locale)) {
        return storedPreference.locale;
      }

      return null;
    });
  };

  const clearLocalePreference = async (): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).delete(localePreferenceKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  return {
    saveLocalePreference,
    loadLocalePreference,
    clearLocalePreference
  };
}

export const localeStorage = createLocaleStorage();
export const saveLocalePreference = (locale: SupportedLocale) =>
  localeStorage.saveLocalePreference(locale);
export const loadLocalePreference = () => localeStorage.loadLocalePreference();
export const clearLocalePreference = () => localeStorage.clearLocalePreference();
