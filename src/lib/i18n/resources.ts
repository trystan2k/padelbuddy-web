import type { ResourceLanguage } from 'i18next';

import enTranslation from './locales/en';
import type { SupportedLocale } from './types';

interface TranslationResource {
  [key: string]: string | TranslationResource;
}

const localeLoaders = {
  en: () => Promise.resolve(enTranslation),
  es: () => import('./locales/es').then((module) => module.default),
  pt: () => import('./locales/pt').then((module) => module.default)
} satisfies Record<SupportedLocale, () => Promise<TranslationResource>>;

export async function loadLocaleResource(locale: SupportedLocale): Promise<ResourceLanguage> {
  const translation = await localeLoaders[locale]();

  return {
    translation
  };
}
