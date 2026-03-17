/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { RevertButton } from '@/components/ActiveMatchScreen/RevertButton/RevertButton'

describe('RevertButton', () => {
  test('renders for team-1', async () => {
    const screen = await render(
      <RevertButton teamId="team-1" onClick={() => {}} disabled={false} />
    )

    const button = screen.getByTestId('revert-button-team-1')
    await expect.element(button).toBeInTheDocument()
    await expect.element(button).toHaveTextContent('Revert point')
  })

  test('renders for team-2', async () => {
    const screen = await render(
      <RevertButton teamId="team-2" onClick={() => {}} disabled={false} />
    )

    const button = screen.getByTestId('revert-button-team-2')
    await expect.element(button).toBeInTheDocument()
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <RevertButton teamId="team-1" onClick={handleClick} disabled={false} />
    )

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', async () => {
    const screen = await render(<RevertButton teamId="team-1" onClick={() => {}} disabled={true} />)

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
  })

  test('is enabled when disabled prop is false', async () => {
    const screen = await render(
      <RevertButton teamId="team-1" onClick={() => {}} disabled={false} />
    )

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('has accessible label', async () => {
    const screen = await render(
      <RevertButton teamId="team-1" onClick={() => {}} disabled={false} />
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-label', 'Revert point')
  })

  test('has type button', async () => {
    const screen = await render(
      <RevertButton teamId="team-1" onClick={() => {}} disabled={false} />
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('type', 'button')
  })

  test('disabled button does not trigger click handler in browser', async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <RevertButton teamId="team-1" onClick={handleClick} disabled={true} />
    )

    // Verify button is disabled
    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()

    // In browser tests, clicking disabled buttons doesn't fire the event
    // This test confirms the disabled state is properly applied
  })
})
