import './shared'

import { beforeAll } from 'vitest'

import { i18n, initializeI18n, resetI18nInitialization } from '@/lib/i18n'

beforeAll(async () => {
  resetI18nInitialization()
  await initializeI18n({ skipBackend: true })
  await i18n.changeLanguage('en')
})
