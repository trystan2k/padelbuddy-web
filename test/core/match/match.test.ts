import { describe, expect, test } from 'vitest'

import { defaultMatchFormat, matchFormats } from '@/core/match'

describe('match exports', () => {
  test('exposes the supported formats baseline', () => {
    expect(matchFormats).toEqual(['best-of-3', 'best-of-5'])
    expect(defaultMatchFormat).toBe('best-of-3')
  })
})
