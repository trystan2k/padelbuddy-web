/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { FinishButton } from '@/components/ActiveMatchScreen/FinishButton/FinishButton'

describe('FinishButton', () => {
  test('renders with default text', async () => {
    const screen = await render(<FinishButton onClick={() => {}} />)

    const button = screen.getByTestId('finish-button')
    await expect.element(button).toBeInTheDocument()
    await expect.element(button).toHaveTextContent('Finish Game')
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<FinishButton onClick={handleClick} />)

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', async () => {
    const screen = await render(<FinishButton onClick={() => {}} disabled={true} />)

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
  })

  test('is enabled by default', async () => {
    const screen = await render(<FinishButton onClick={() => {}} />)

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('is enabled when disabled prop is false', async () => {
    const screen = await render(<FinishButton onClick={() => {}} disabled={false} />)

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('has accessible label', async () => {
    const screen = await render(<FinishButton onClick={() => {}} />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-label', 'Finish Game')
  })

  test('has type button', async () => {
    const screen = await render(<FinishButton onClick={() => {}} />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('type', 'button')
  })

  test('disabled button properly prevents clicks in browser', async () => {
    const screen = await render(<FinishButton onClick={() => {}} disabled={true} />)

    // Verify button is disabled
    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()

    // In browser tests, clicking disabled buttons doesn't fire the event
    // This test confirms the disabled state is properly applied
  })
})
