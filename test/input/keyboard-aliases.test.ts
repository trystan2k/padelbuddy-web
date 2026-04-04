import { describe, expect, test } from 'vitest'

import {
  assignRemoteControllerBinding,
  createRemoteControllerBindings,
  getActionFromKey,
  getKeyboardBindingDisplayLabel,
  type KeyboardAction
} from '@/lib/input/keyboard-aliases'

describe('keyboard-aliases', () => {
  test.each(['ArrowLeft', 'a', 'A', '1', 'Home', 'PageUp'])('maps %s to add-team-1', (key) => {
    expect(getActionFromKey(key)).toBe('add-team-1')
  })

  test.each(['ArrowRight', 'd', 'D', '2', 'End', 'PageDown'])('maps %s to add-team-2', (key) => {
    expect(getActionFromKey(key)).toBe('add-team-2')
  })

  test.each(['ArrowUp', 'Backspace', 'u', 'U', 'Delete', 'Escape', 'r', 'R'])(
    'maps %s to undo',
    (key) => {
      expect(getActionFromKey(key)).toBe('undo')
    }
  )

  test('prefers custom bindings before legacy defaults', () => {
    const bindings = createRemoteControllerBindings({
      'add-team-1': 'ArrowRight',
      'add-team-2': 'ArrowLeft',
      'revert-team-1': 'z',
      'revert-team-2': 'x'
    })

    expect(getActionFromKey('ArrowRight', bindings)).toBe('add-team-1')
    expect(getActionFromKey('ArrowLeft', bindings)).toBe('add-team-2')
    expect(getActionFromKey('z', bindings)).toBe('revert-team-1')
    expect(getActionFromKey('x', bindings)).toBe('revert-team-2')
  })

  test('falls back to legacy defaults when a custom binding is not configured', () => {
    const bindings = createRemoteControllerBindings({
      'revert-team-1': null,
      'revert-team-2': null
    })

    expect(getActionFromKey('PageUp', bindings)).toBe('add-team-1')
    expect(getActionFromKey('Escape', bindings)).toBe('undo')
  })

  test.each(['b', 'ArrowDown', 'Enter', 'Tab', 'Shift', '!', ''])(
    'maps %s to unknown when it has no binding',
    (key) => {
      expect(getActionFromKey(key)).toBe('unknown')
    }
  )

  test('returns the expected keyboard display labels', () => {
    expect(getKeyboardBindingDisplayLabel('ArrowLeft')).toBe('← Left')
    expect(getKeyboardBindingDisplayLabel('Escape')).toBe('Esc')
    expect(getKeyboardBindingDisplayLabel('a')).toBe('A')
    expect(getKeyboardBindingDisplayLabel(' ')).toBe('Space')
    expect(getKeyboardBindingDisplayLabel(null)).toBe('')
  })

  test('replaces duplicate custom bindings when a key is reassigned', () => {
    const bindings = createRemoteControllerBindings()
    const updatedBindings = assignRemoteControllerBinding(bindings, 'add-team-2', 'ArrowLeft')

    expect(updatedBindings['add-team-1']).toBeNull()
    expect(updatedBindings['add-team-2']).toBe('ArrowLeft')
  })

  test('treats duplicate custom bindings as case insensitive', () => {
    const bindings = createRemoteControllerBindings({
      'add-team-1': 'a',
      'revert-team-1': 'z',
      'add-team-2': 'w',
      'revert-team-2': 'x'
    })

    const updatedBindings = assignRemoteControllerBinding(bindings, 'add-team-2', 'A')

    expect(updatedBindings['add-team-1']).toBeNull()
    expect(updatedBindings['add-team-2']).toBe('A')
  })

  test('returns a valid keyboard action type', () => {
    const validActions: KeyboardAction[] = [
      'add-team-1',
      'revert-team-1',
      'add-team-2',
      'revert-team-2',
      'undo',
      'unknown'
    ]

    expect(validActions).toContain(getActionFromKey('a'))
  })
})
