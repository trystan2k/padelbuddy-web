// oxlint-disable-next-line import/no-unassigned-import
import './shared'

import { beforeAll } from 'vitest'

import { i18n, initializeI18n, resetI18nInitialization } from '@/lib/i18n/i18n'

beforeAll(async () => {
  await resetI18nInitialization()
  await initializeI18n()
  await i18n.changeLanguage('en')
})
