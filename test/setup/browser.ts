import './shared'

import { beforeAll } from 'vitest'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslations from '../../public/locales/en.json'
import { resetI18nInitialization } from '@/lib/i18n/i18n'

// Initialize i18n before all browser tests
beforeAll(async () => {
  // Reset any previous initialization state
  resetI18nInitialization()

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
