/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { TextInput, type TextInputVariant } from '@/components/ui/TextInput/TextInput'

describe('TextInput', () => {
  test('renders with value', async () => {
    const screen = await render(<TextInput value="Test Value" onChange={() => {}} />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveValue('Test Value')
  })

  test('renders with empty value', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveValue('')
  })

  test('calls onChange when value changes', async () => {
    const handleChange = vi.fn()
    const screen = await render(<TextInput value="" onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await input.fill('New Value')

    expect(handleChange).toHaveBeenCalledWith('New Value')
  })

  test('renders with placeholder', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} placeholder="Enter name" />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('placeholder', 'Enter name')
  })

  test('renders without placeholder', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} />)

    const input = screen.getByRole('textbox')
    await expect.element(input).not.toHaveAttribute('placeholder')
  })

  test('renders with maxLength', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} maxLength={10} />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('maxlength', '10')
  })

  test('renders disabled', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} disabled />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toBeDisabled()
  })

  test('renders enabled by default', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} />)

    const input = screen.getByRole('textbox')
    await expect.element(input).not.toBeDisabled()
  })

  test('renders with custom className', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} className="custom-class" />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveClass('custom-class')
  })

  test('renders with id', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} id="name-input" />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('id', 'name-input')
  })

  test('renders with aria-label', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} aria-label="Player name" />)

    const input = screen.getByRole('textbox')
    await expect.element(input).toHaveAttribute('aria-label', 'Player name')
  })

  test('renders without aria-label by default', async () => {
    const screen = await render(<TextInput value="" onChange={() => {}} />)

    const input = screen.getByRole('textbox')
    await expect.element(input).not.toHaveAttribute('aria-label')
  })

  // Test all variants for branch coverage
  const variants: TextInputVariant[] = ['default', 'team-one', 'team-two']
  variants.forEach((variant) => {
    test(`renders correctly with variant: ${variant}`, async () => {
      const screen = await render(<TextInput value="test" onChange={() => {}} variant={variant} />)

      const input = screen.getByRole('textbox')
      await expect.element(input).toHaveValue('test')
    })
  })

  test('calls onChange with updated value on each keystroke', async () => {
    const handleChange = vi.fn()
    const screen = await render(<TextInput value="" onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await input.fill('A')

    expect(handleChange).toHaveBeenCalledWith('A')
  })
})
