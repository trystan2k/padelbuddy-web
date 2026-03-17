/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { TimeChip } from '@/components/ActiveMatchScreen/TimeChip/TimeChip'

describe('TimeChip', () => {
  test('renders formatted time', async () => {
    const screen = await render(<TimeChip formattedTime="15 min" />)

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent('15 min')
  })

  test('renders with hours format', async () => {
    const screen = await render(<TimeChip formattedTime="1h 30m" />)

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent('1h 30m')
  })

  test('renders zero minutes', async () => {
    const screen = await render(<TimeChip formattedTime="0 min" />)

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent('0 min')
  })

  test('has timer role', async () => {
    const screen = await render(<TimeChip formattedTime="5 min" />)

    const timer = screen.getByRole('timer')
    await expect.element(timer).toBeInTheDocument()
  })

  test('has accessible label with time', async () => {
    const screen = await render(<TimeChip formattedTime="25 min" />)

    const timer = screen.getByRole('timer')
    await expect.element(timer).toHaveAttribute('aria-label', 'Match time: 25 min')
  })

  test('updates when formattedTime prop changes', async () => {
    const screen = await render(<TimeChip formattedTime="10 min" />)

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent('10 min')

    void screen.rerender(<TimeChip formattedTime="20 min" />)

    await expect.element(screen.getByTestId('time-chip')).toHaveTextContent('20 min')
  })
})
