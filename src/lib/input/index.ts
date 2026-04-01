/**
 * Input Module
 *
 * This module provides utilities for handling user input including keyboard
 * aliases, wake lock, remote controller persistence, and input handlers.
 *
 * @module input
 */

export type {
  ConfigurableKeyboardAction,
  KeyboardAction,
  KeyboardAliasMap,
  RemoteControllerBindings
} from './keyboard-aliases'
export {
  assignRemoteControllerBinding,
  configurableKeyboardActions,
  createEmptyRemoteControllerBindings,
  createRemoteControllerBindings,
  defaultRemoteControllerBindings,
  getActionFromKey,
  getKeyboardBindingDisplayLabel,
  normalizeKeyboardBindingKey
} from './keyboard-aliases'

export type { DebounceController, CreateDebounceOptions } from './debounce'
export { createDebounce } from './debounce'

export {
  _resetModuleWakeLockRef,
  isScreenWakeLockActive,
  requestScreenWakeLock,
  useWakeLock
} from './wake-lock'
export type { UseWakeLockOptions, UseWakeLockReturn } from './wake-lock'

export {
  clearRemoteControllerBindings,
  createRemoteControllerStorage,
  loadRemoteControllerBindings,
  loadRemoteControllerBindingsWithFallback,
  parseStoredRemoteControllerBindings,
  remoteControllerStorage,
  sanitizeRemoteControllerBindings,
  saveRemoteControllerBindings
} from './remote-controller-storage'
export type {
  RemoteControllerStorage,
  RemoteControllerStorageOptions,
  StoredRemoteControllerBindings
} from './remote-controller-storage'

export { useInputHandler } from './use-input-handler'
export type {
  UseInputHandlerOptions,
  UseInputHandlerCallbacks,
  UseInputHandlerReturn
} from './use-input-handler'
