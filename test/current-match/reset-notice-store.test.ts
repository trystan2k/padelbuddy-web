import { afterEach, describe, expect, test } from 'vitest'

import currentMatchResetNoticeStore, {
  createCurrentMatchResetNoticeStore
} from '@/lib/current-match/reset-notice-store'

describe('current match reset notice store', () => {
  afterEach(() => {
    currentMatchResetNoticeStore.reset()
  })

  test('supports get set and clear operations', () => {
    expect(currentMatchResetNoticeStore.get()).toBeNull()

    currentMatchResetNoticeStore.set({
      reason: 'schema-version'
    })

    expect(currentMatchResetNoticeStore.get()).toEqual({
      reason: 'schema-version'
    })
    expect(currentMatchResetNoticeStore.clear()).toEqual({
      reason: 'schema-version'
    })
    expect(currentMatchResetNoticeStore.get()).toBeNull()
  })

  test('reset clears singleton state between runs', () => {
    currentMatchResetNoticeStore.set({
      reason: 'schema-version'
    })

    currentMatchResetNoticeStore.reset()

    expect(currentMatchResetNoticeStore.get()).toBeNull()
  })

  test('factory instances keep isolated state', () => {
    const firstStore = createCurrentMatchResetNoticeStore()
    const secondStore = createCurrentMatchResetNoticeStore()

    firstStore.set({
      reason: 'schema-version'
    })

    expect(firstStore.get()).toEqual({
      reason: 'schema-version'
    })
    expect(secondStore.get()).toBeNull()
  })
})
