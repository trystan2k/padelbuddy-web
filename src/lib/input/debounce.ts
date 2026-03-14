/**
 * Creates a debounce controller for rate-limiting function calls.
 * Default delay is 300ms but can be configured via options.
 */
export interface DebounceController {
  isReady: () => boolean
  trigger: () => void
  reset: () => void
  cleanup: () => void
}

export interface CreateDebounceOptions {
  /** Delay in milliseconds. Default is 300ms. */
  delay?: number
}

const DEFAULT_DELAY = 300

export function createDebounce(options: CreateDebounceOptions = {}): DebounceController {
  const delay = options.delay ?? DEFAULT_DELAY

  let timerId: ReturnType<typeof setTimeout> | null = null
  let lastTriggerTime = 0

  const isReady = (): boolean => {
    const now = Date.now()
    return now - lastTriggerTime >= delay
  }

  const trigger = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
    }

    lastTriggerTime = Date.now()
    timerId = setTimeout(() => {
      timerId = null
    }, delay)
  }

  const reset = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  const cleanup = (): void => {
    reset()
    lastTriggerTime = 0
  }

  return {
    isReady,
    trigger,
    reset,
    cleanup
  }
}
