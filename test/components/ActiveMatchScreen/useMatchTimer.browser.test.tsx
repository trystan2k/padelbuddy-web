/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useEffect, useState } from 'react'

import { useMatchTimer } from '@/components/ActiveMatchScreen/useMatchTimer'

// Test component to render the hook output
function TimerTestComponent({
  startedAt,
  isMatchCompleted,
  onStateChange
}: {
  startedAt: number | null
  isMatchCompleted: boolean
  onStateChange?: (state: ReturnType<typeof useMatchTimer>) => void
}) {
  const state = useMatchTimer({
    startedAt,
    isMatchCompleted
  })

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  return (
    <div>
      <span data-testid="elapsedSeconds">{state.elapsedSeconds}</span>
      <span data-testid="formattedTime">{state.formattedTime}</span>
      <span data-testid="isRunning">{state.isRunning.toString()}</span>
    </div>
  )
}

describe('useMatchTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('returns 0 elapsed seconds when startedAt is null', async () => {
    const screen = await render(<TimerTestComponent startedAt={null} isMatchCompleted={false} />)

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('0')
    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('0 min')
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')
  })

  test('returns elapsed time from startedAt', async () => {
    const startedAt = Date.now() - 5 * 60 * 1000 // 5 minutes ago

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={false} />
    )

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('300')
    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('5 min')
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('true')
  })

  test('formats minutes correctly', async () => {
    const startedAt = Date.now() - 15 * 60 * 1000 // 15 minutes ago

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={false} />
    )

    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('15 min')
  })

  test('formats hours and minutes correctly', async () => {
    const startedAt = Date.now() - 90 * 60 * 1000 // 1 hour 30 minutes ago

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={false} />
    )

    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('1h 30m')
  })

  test('formats 1 hour exactly', async () => {
    const startedAt = Date.now() - 60 * 60 * 1000 // 1 hour ago

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={false} />
    )

    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('1h 0m')
  })

  test('isRunning is false when match is completed', async () => {
    const startedAt = Date.now() - 5 * 60 * 1000

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={true} />
    )

    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')
  })

  test('isRunning is false when startedAt is null', async () => {
    const screen = await render(<TimerTestComponent startedAt={null} isMatchCompleted={false} />)

    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')
  })

  test('handles zero elapsed time correctly', async () => {
    const startedAt = Date.now()

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={false} />
    )

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('0')
    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('0 min')
  })

  test('handles large elapsed times', async () => {
    const startedAt = Date.now() - 125 * 60 * 1000 // 2 hours 5 minutes

    const screen = await render(
      <TimerTestComponent startedAt={startedAt} isMatchCompleted={false} />
    )

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('7500')
    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('2h 5m')
  })

  test('stops updating when match is completed', async () => {
    const startedAt = Date.now()
    const onStateChange = vi.fn()

    const screen = await render(
      <TimerTestComponent
        startedAt={startedAt}
        isMatchCompleted={false}
        onStateChange={onStateChange}
      />
    )

    // Advance time
    await vi.advanceTimersByTimeAsync(60 * 1000)

    // Check the timer is running
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('true')
    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('60')

    // Rerender with match completed
    void screen.rerender(
      <TimerTestComponent
        startedAt={startedAt}
        isMatchCompleted={true}
        onStateChange={onStateChange}
      />
    )

    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')

    // Advance time more - elapsed should stay the same
    await vi.advanceTimersByTimeAsync(60 * 1000)

    // Should still be 60 seconds (stopped when completed)
    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('60')
  })
})

describe('useMatchTimer - dynamic state component', () => {
  // Component that can change isMatchCompleted dynamically
  function DynamicTimerComponent({
    initialStartedAt,
    initialIsCompleted
  }: {
    initialStartedAt: number
    initialIsCompleted: boolean
  }) {
    const [isMatchCompleted, setIsMatchCompleted] = useState(initialIsCompleted)
    const state = useMatchTimer({
      startedAt: initialStartedAt,
      isMatchCompleted
    })

    return (
      <div>
        <span data-testid="elapsedSeconds">{state.elapsedSeconds}</span>
        <span data-testid="formattedTime">{state.formattedTime}</span>
        <span data-testid="isRunning">{state.isRunning.toString()}</span>
        <button
          type="button"
          data-testid="completeButton"
          onClick={() => setIsMatchCompleted(true)}
        >
          Complete
        </button>
      </div>
    )
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('timer stops when match is completed via button', async () => {
    const startedAt = Date.now()

    const screen = await render(
      <DynamicTimerComponent initialStartedAt={startedAt} initialIsCompleted={false} />
    )

    // Advance time
    await vi.advanceTimersByTimeAsync(30 * 1000)

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('30')
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('true')

    // Complete the match
    await screen.getByTestId('completeButton').click()

    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')

    // Advance time more
    await vi.advanceTimersByTimeAsync(30 * 1000)

    // Elapsed should still be 30 (stopped)
    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('30')
  })
})
