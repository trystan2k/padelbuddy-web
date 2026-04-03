/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { useMatchTimer } from '@/components/ActiveMatchScreen/useMatchTimer'
import type { CountdownTimerDuration } from '@/core/match/types'

function formatTimeOfDay(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

function TimerTestComponent({
  startedAt,
  finishedAt,
  isMatchCompleted,
  countdownEnabled,
  countdownDuration
}: {
  startedAt: number | null
  finishedAt?: number
  isMatchCompleted: boolean
  countdownEnabled: boolean
  countdownDuration: CountdownTimerDuration
}) {
  const state = useMatchTimer({
    startedAt,
    ...(typeof finishedAt === 'number' ? { finishedAt } : {}),
    isMatchCompleted,
    countdownEnabled,
    countdownDuration
  })

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
    vi.setSystemTime(new Date('2026-03-21T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('shows the current time of day when countdown is disabled', async () => {
    const startedAt = Date.now() - (1 * 60 * 60 + 5 * 60 + 9) * 1000

    const screen = await render(
      <TimerTestComponent
        startedAt={startedAt}
        isMatchCompleted={false}
        countdownEnabled={false}
        countdownDuration={90}
      />
    )

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('3909')
    await expect
      .element(screen.getByTestId('formattedTime'))
      .toHaveTextContent(formatTimeOfDay(new Date(Date.now())))
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('true')
  })

  test('formats countdown time as HH:MM:SS', async () => {
    const startedAt = Date.now() - (46 * 60 + 48) * 1000

    const screen = await render(
      <TimerTestComponent
        startedAt={startedAt}
        isMatchCompleted={false}
        countdownEnabled={true}
        countdownDuration={60}
      />
    )

    await expect
      .element(screen.getByTestId('formattedTime'))
      .toHaveTextContent(/^\d{2}:\d{2}:\d{2}$/)
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('true')
  })

  test('freezes countdown at 00:00:00 when it expires', async () => {
    const startedAt = Date.now() - 90 * 60 * 1000

    const screen = await render(
      <TimerTestComponent
        startedAt={startedAt}
        isMatchCompleted={false}
        countdownEnabled={true}
        countdownDuration={90}
      />
    )

    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('00:00:00')
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')

    await vi.advanceTimersByTimeAsync(30 * 1000)

    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('00:00:00')
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')
  })

  test('uses the live clock when countdown reaches zero between interval ticks', async () => {
    const startedAt = Date.now() - (90 * 60 * 1000 + 250)

    const screen = await render(
      <TimerTestComponent
        startedAt={startedAt}
        isMatchCompleted={false}
        countdownEnabled={true}
        countdownDuration={90}
      />
    )

    await expect.element(screen.getByTestId('formattedTime')).toHaveTextContent('00:00:00')
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')
  })

  test('keeps the live clock running after the match is completed', async () => {
    const startedAt = Date.now() - 30 * 60 * 1000
    const finishedAt = startedAt + (5 * 60 + 7) * 1000

    const screen = await render(
      <TimerTestComponent
        startedAt={startedAt}
        finishedAt={finishedAt}
        isMatchCompleted={true}
        countdownEnabled={false}
        countdownDuration={90}
      />
    )

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('307')
    await expect
      .element(screen.getByTestId('formattedTime'))
      .toHaveTextContent(formatTimeOfDay(new Date(Date.now())))
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')

    await vi.advanceTimersByTimeAsync(60 * 1000)

    await expect
      .element(screen.getByTestId('formattedTime'))
      .toHaveTextContent(formatTimeOfDay(new Date(Date.now())))
  })

  test('shows the current time of day when countdown is disabled and startedAt is null', async () => {
    const screen = await render(
      <TimerTestComponent
        startedAt={null}
        isMatchCompleted={false}
        countdownEnabled={false}
        countdownDuration={90}
      />
    )

    await expect.element(screen.getByTestId('elapsedSeconds')).toHaveTextContent('0')
    await expect
      .element(screen.getByTestId('formattedTime'))
      .toHaveTextContent(formatTimeOfDay(new Date(Date.now())))
    await expect.element(screen.getByTestId('isRunning')).toHaveTextContent('false')
  })
})
