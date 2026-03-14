/**
 * Input Module
 *
 * This module provides utilities for handling user input including keyboard
 * aliases, debouncing, wake lock, and input handlers.
 *
 * @module input
 */

// Re-export keyboard aliases
export type { KeyboardAction, KeyboardAliasMap } from './keyboard-aliases'
export { getActionFromKey } from './keyboard-aliases'

// Re-export debounce utilities
export type { DebounceController, CreateDebounceOptions } from './debounce'
export { createDebounce } from './debounce'

// Re-export wake lock hook
export { useWakeLock } from './wake-lock'
export type { UseWakeLockOptions, UseWakeLockReturn } from './wake-lock'

// Re-export input handler hook
export { useInputHandler } from './use-input-handler'
export type {
  UseInputHandlerOptions,
  UseInputHandlerCallbacks,
  UseInputHandlerReturn
} from './use-input-handler'
