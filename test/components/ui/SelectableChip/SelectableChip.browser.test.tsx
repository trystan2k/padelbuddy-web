/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import {
  SelectableChip,
  type SelectableChipAccent
} from '@/components/ui/SelectableChip/SelectableChip'

describe('SelectableChip', () => {
  test('renders children correctly', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}}>
        Chip Content
      </SelectableChip>
    )

    await expect.element(screen.getByText('Chip Content')).toBeInTheDocument()
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <SelectableChip selected={false} onClick={handleClick}>
        Click Me
      </SelectableChip>
    )

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders with selected state', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}}>
        Selected
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders with data-pressed attribute when selected', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}}>
        Selected
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('data-pressed')
  })

  test('renders without data-pressed attribute when unselected', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}}>
        Unselected
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).not.toHaveAttribute('data-pressed')
  })

  test('renders with unselected state', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}}>
        Unselected
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'false')
  })

  test('renders with disabled state', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} disabled>
        Disabled
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
  })

  test('renders with data-disabled attribute when disabled', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} disabled>
        Disabled
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('data-disabled')
  })

  test('renders enabled by default', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}}>
        Enabled
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('renders with custom className', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} className="custom-class">
        Custom
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveClass('custom-class')
  })

  // Test all accents
  const accents: SelectableChipAccent[] = ['primary', 'secondary']
  accents.forEach((accent) => {
    test(`renders correctly with accent: ${accent}`, async () => {
      const screen = await render(
        <SelectableChip selected={false} onClick={() => {}} accent={accent}>
          {accent} Chip
        </SelectableChip>
      )

      await expect.element(screen.getByText(`${accent} Chip`)).toBeInTheDocument()
    })
  })

  // Test showDot with different accents
  test('shows dot when showDot is true and accent is primary', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} accent="primary" showDot>
        Primary
      </SelectableChip>
    )

    const dot = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(dot).toBeTruthy()
  })

  test('shows dot when showDot is true and accent is secondary', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} accent="secondary" showDot>
        Secondary
      </SelectableChip>
    )

    const dot = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(dot).toBeTruthy()
  })

  test('does not show dot when showDot is true but no accent', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} showDot>
        Default
      </SelectableChip>
    )

    const button = screen.getByRole('button').element()
    // The dot should not exist when no accent is provided even with showDot=true
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeNull()
  })

  test('does not show dot when showDot is false', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} accent="primary" showDot={false}>
        No Dot
      </SelectableChip>
    )

    const button = screen.getByRole('button').element()
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeNull()
  })

  // Combined state tests for branch coverage
  test('renders selected primary chip with dot', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}} accent="primary" showDot>
        Selected Primary
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders selected secondary chip with dot', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}} accent="secondary" showDot>
        Selected Secondary
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders disabled selected chip', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}} disabled>
        Disabled Selected
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })
})
