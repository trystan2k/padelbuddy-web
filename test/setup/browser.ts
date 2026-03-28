import './shared'

import { beforeAll } from 'vitest'

import { i18n, initializeI18n, resetI18nInitialization } from '@/lib/i18n'

beforeAll(async () => {
  await resetI18nInitialization()
  await initializeI18n()
  await i18n.changeLanguage('en')
})
