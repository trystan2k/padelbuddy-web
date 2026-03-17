/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton'

describe('PrimaryButton', () => {
  test('renders children correctly', async () => {
    const screen = await render(<PrimaryButton onClick={() => {}}>Click Me</PrimaryButton>)

    await expect.element(screen.getByRole('button')).toHaveTextContent('Click Me')
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>)

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders with disabled state', async () => {
    const screen = await render(
      <PrimaryButton onClick={() => {}} disabled>
        Disabled Button
      </PrimaryButton>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
  })

  test('renders with data-disabled attribute when disabled', async () => {
    const screen = await render(
      <PrimaryButton onClick={() => {}} disabled>
        Disabled Button
      </PrimaryButton>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('data-disabled')
  })

  test('renders enabled by default', async () => {
    const screen = await render(<PrimaryButton onClick={() => {}}>Enabled Button</PrimaryButton>)

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('renders with default type="button"', async () => {
    const screen = await render(<PrimaryButton onClick={() => {}}>Button</PrimaryButton>)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('type', 'button')
  })

  test('renders with type="submit"', async () => {
    const screen = await render(
      <PrimaryButton onClick={() => {}} type="submit">
        Submit
      </PrimaryButton>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('type', 'submit')
  })

  test('renders with type="reset"', async () => {
    const screen = await render(
      <PrimaryButton onClick={() => {}} type="reset">
        Reset
      </PrimaryButton>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('type', 'reset')
  })

  test('renders with custom className', async () => {
    const screen = await render(
      <PrimaryButton onClick={() => {}} className="custom-class">
        Custom Button
      </PrimaryButton>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveClass('custom-class')
  })

  test('applies both base and custom className', async () => {
    const screen = await render(
      <PrimaryButton onClick={() => {}} className="extra">
        Button
      </PrimaryButton>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveClass('extra')
  })
})
