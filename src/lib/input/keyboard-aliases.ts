export type KeyboardAction = 'score-team-1' | 'score-team-2' | 'undo' | 'unknown'

export interface KeyboardAliasMap {
  [key: string]: KeyboardAction
}

const defaultKeyboardAliases: KeyboardAliasMap = {
  ArrowLeft: 'score-team-1',
  a: 'score-team-1',
  1: 'score-team-1',
  Home: 'score-team-1',
  PageUp: 'score-team-1',
  ArrowRight: 'score-team-2',
  d: 'score-team-2',
  2: 'score-team-2',
  End: 'score-team-2',
  PageDown: 'score-team-2',
  ArrowUp: 'undo',
  Backspace: 'undo',
  u: 'undo',
  Delete: 'undo',
  Escape: 'undo',
  r: 'undo'
}

export function getActionFromKey(key: string): KeyboardAction {
  const normalizedKey = key.toLowerCase()
  const action = defaultKeyboardAliases[key] ?? defaultKeyboardAliases[normalizedKey]
  return action ?? 'unknown'
}
