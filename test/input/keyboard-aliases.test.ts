import { describe, expect, test } from 'vitest'

import { getActionFromKey, type KeyboardAction } from '@/lib/input'

describe('keyboard-aliases', () => {
  describe('team-1 aliases', () => {
    const team1Keys = ['ArrowLeft', 'a', '1', 'Home', 'PageUp']

    test.each(team1Keys)('maps "%s" to score-team-1', (key) => {
      expect(getActionFromKey(key)).toBe('score-team-1')
    })
  })

  describe('team-2 aliases', () => {
    const team2Keys = ['ArrowRight', 'd', '2', 'End', 'PageDown']

    test.each(team2Keys)('maps "%s" to score-team-2', (key) => {
      expect(getActionFromKey(key)).toBe('score-team-2')
    })
  })

  describe('undo aliases', () => {
    const undoKeys = ['ArrowUp', 'Backspace', 'u', 'Delete', 'Escape', 'r']

    test.each(undoKeys)('maps "%s" to undo', (key) => {
      expect(getActionFromKey(key)).toBe('undo')
    })
  })

  describe('case insensitivity', () => {
    test('maps "A" (uppercase) to score-team-1', () => {
      expect(getActionFromKey('A')).toBe('score-team-1')
    })

    test('maps "D" (uppercase) to score-team-2', () => {
      expect(getActionFromKey('D')).toBe('score-team-2')
    })

    test('maps "U" (uppercase) to undo', () => {
      expect(getActionFromKey('U')).toBe('undo')
    })

    test('maps "R" (uppercase) to undo', () => {
      expect(getActionFromKey('R')).toBe('undo')
    })
  })

  describe('unknown keys', () => {
    const unknownKeys = [
      'b',
      'c',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      's',
      't',
      'v',
      'w',
      'x',
      'y',
      'z',
      '0',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'ArrowDown',
      'Enter',
      'Space',
      'Tab',
      'Shift',
      'Control',
      'Alt',
      'Meta',
      'CapsLock',
      'F1',
      'F12',
      ''
    ]

    test.each(unknownKeys)('maps "%s" to unknown', (key) => {
      expect(getActionFromKey(key)).toBe('unknown')
    })

    test('returns unknown for empty string', () => {
      expect(getActionFromKey('')).toBe('unknown')
    })

    test('returns unknown for special characters', () => {
      expect(getActionFromKey('!')).toBe('unknown')
      expect(getActionFromKey('@')).toBe('unknown')
      expect(getActionFromKey('#')).toBe('unknown')
    })
  })

  describe('return type', () => {
    test('returns valid KeyboardAction type for all known keys', () => {
      const validActions: KeyboardAction[] = ['score-team-1', 'score-team-2', 'undo', 'unknown']
      const result = getActionFromKey('a')

      expect(validActions).toContain(result)
    })
  })

  describe('edge cases', () => {
    test('handles keys with whitespace', () => {
      expect(getActionFromKey(' a ')).toBe('unknown')
      expect(getActionFromKey('\ta')).toBe('unknown')
    })

    test('handles numeric string keys', () => {
      expect(getActionFromKey('1')).toBe('score-team-1')
      expect(getActionFromKey('2')).toBe('score-team-2')
      expect(getActionFromKey('3')).toBe('unknown')
    })
  })
})
