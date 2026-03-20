import './shared'

import { beforeAll } from 'vitest'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import from served path (public/ files are served at root, not /public/)
// oxlint-disable-next-line import/no-absolute-path
import enTranslationsUrl from '/locales/en.json?url'
import { resetI18nInitialization } from '@/lib/i18n/i18n'

// Initialize i18n before all browser tests
beforeAll(async () => {
  // Reset any previous initialization state
  resetI18nInitialization()

  // Fetch translations from the public URL (required for assets in public/)
  const response = await fetch(enTranslationsUrl)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enTranslations = (await response.json()) as Record<string, any>

  // Initialize i18n with test configuration using initReactI18next
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    resources: {
      en: {
        translation: enTranslations
      }
    }
  })
})
