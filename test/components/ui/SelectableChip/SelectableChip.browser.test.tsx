/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import {
  SelectableChip,
  type SelectableChipVariant
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

  // Test all variants
  const variants: SelectableChipVariant[] = ['default', 'team-one', 'team-two']
  variants.forEach((variant) => {
    test(`renders correctly with variant: ${variant}`, async () => {
      const screen = await render(
        <SelectableChip selected={false} onClick={() => {}} variant={variant}>
          {variant} Chip
        </SelectableChip>
      )

      await expect.element(screen.getByText(`${variant} Chip`)).toBeInTheDocument()
    })
  })

  // Test showDot with different variants
  test('shows dot when showDot is true and variant is team-one', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} variant="team-one" showDot>
        Team One
      </SelectableChip>
    )

    const dot = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(dot).toBeTruthy()
  })

  test('shows dot when showDot is true and variant is team-two', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} variant="team-two" showDot>
        Team Two
      </SelectableChip>
    )

    const dot = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(dot).toBeTruthy()
  })

  test('does not show dot when showDot is true but variant is default', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} variant="default" showDot>
        Default
      </SelectableChip>
    )

    const button = screen.getByRole('button').element()
    // The dot should not exist for default variant even with showDot=true
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeNull()
  })

  test('does not show dot when showDot is false', async () => {
    const screen = await render(
      <SelectableChip selected={false} onClick={() => {}} variant="team-one" showDot={false}>
        No Dot
      </SelectableChip>
    )

    const button = screen.getByRole('button').element()
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeNull()
  })

  // Combined state tests for branch coverage
  test('renders selected team-one chip with dot', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}} variant="team-one" showDot>
        Selected Team One
      </SelectableChip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders selected team-two chip with dot', async () => {
    const screen = await render(
      <SelectableChip selected={true} onClick={() => {}} variant="team-two" showDot>
        Selected Team Two
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
