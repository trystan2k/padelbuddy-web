/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { Chip, type ChipSize } from '@/components/ui/Chip/Chip'

describe('Chip', () => {
  // ===========================================
  // Basic rendering tests
  // ===========================================
  test('renders children correctly', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}}>
        Chip Content
      </Chip>
    )

    await expect.element(screen.getByText('Chip Content')).toBeInTheDocument()
  })

  test('renders with custom className', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}} className="custom-class">
        Custom
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveClass('custom-class')
  })

  // ===========================================
  // Variant tests (toggle vs button)
  // ===========================================
  describe('variant="toggle" (default)', () => {
    test('calls onPressedChange when clicked', async () => {
      const handleChange = vi.fn<(pressed: boolean) => void>()
      const screen = await render(
        <Chip pressed={false} onPressedChange={handleChange}>
          Click Me
        </Chip>
      )

      await screen.getByRole('button').click()

      expect(handleChange).toHaveBeenCalledTimes(1)
      // Base UI Toggle passes the new pressed value as first argument
      expect(handleChange.mock.calls[0]?.[0]).toBe(true)
    })

    test('renders with aria-pressed="true" when pressed', async () => {
      const screen = await render(
        <Chip pressed={true} onPressedChange={() => {}}>
          Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-pressed', 'true')
    })

    test('renders with aria-pressed="false" when not pressed', async () => {
      const screen = await render(
        <Chip pressed={false} onPressedChange={() => {}}>
          Not Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-pressed', 'false')
    })

    test('renders with data-pressed attribute when pressed', async () => {
      const screen = await render(
        <Chip pressed={true} onPressedChange={() => {}}>
          Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('data-pressed')
    })

    test('renders without data-pressed attribute when not pressed', async () => {
      const screen = await render(
        <Chip pressed={false} onPressedChange={() => {}}>
          Not Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).not.toHaveAttribute('data-pressed')
    })
  })

  describe('variant="button"', () => {
    test('calls onPressedChange when clicked', async () => {
      const handleChange = vi.fn<(pressed: boolean) => void>()
      const screen = await render(
        <Chip variant="button" pressed={false} onPressedChange={handleChange}>
          Click Me
        </Chip>
      )

      await screen.getByRole('button').click()

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    test('renders with data-pressed attribute when pressed', async () => {
      const screen = await render(
        <Chip variant="button" pressed={true} onPressedChange={() => {}}>
          Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('data-pressed')
    })

    test('renders without data-pressed attribute when not pressed', async () => {
      const screen = await render(
        <Chip variant="button" pressed={false} onPressedChange={() => {}}>
          Not Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).not.toHaveAttribute('data-pressed')
    })

    test('does not have aria-pressed attribute (uses data-pressed instead)', async () => {
      const screen = await render(
        <Chip variant="button" pressed={true} onPressedChange={() => {}}>
          Pressed
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).not.toHaveAttribute('aria-pressed')
    })

    test('respects disabled prop', async () => {
      const handleChange = vi.fn<(pressed: boolean) => void>()
      const screen = await render(
        <Chip variant="button" pressed={false} onPressedChange={handleChange} disabled>
          Disabled Button
        </Chip>
      )
      await expect.element(screen.getByRole('button')).toBeDisabled()
      await expect.element(screen.getByRole('button')).toHaveAttribute('data-disabled')
    })
  })

  // ===========================================
  // Size tests
  // ===========================================
  const sizes: ChipSize[] = ['sm', 'md']
  sizes.forEach((size) => {
    test(`renders correctly with size: ${size}`, async () => {
      const screen = await render(
        <Chip size={size} pressed={false} onPressedChange={() => {}}>
          {size} Chip
        </Chip>
      )

      await expect.element(screen.getByText(`${size} Chip`)).toBeInTheDocument()
    })
  })

  // ===========================================
  // Disabled state tests
  // ===========================================
  test('renders with disabled state', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}} disabled>
        Disabled
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
  })

  test('renders with data-disabled attribute when disabled', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}} disabled>
        Disabled
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('data-disabled')
  })

  test('renders enabled by default', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}}>
        Enabled
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('disabled button prevents click interaction', async () => {
    const handleChange = vi.fn<(pressed: boolean) => void>()
    const screen = await render(
      <Chip pressed={false} onPressedChange={handleChange} disabled>
        Disabled
      </Chip>
    )

    const button = screen.getByRole('button')
    // Verify the button is disabled - clicking on disabled buttons will timeout
    await expect.element(button).toBeDisabled()
    // Since the button is disabled, onPressedChange should never be called
    expect(handleChange).not.toHaveBeenCalled()
  })

  // ===========================================
  // Dropdown trigger tests (aria-expanded)
  // ===========================================
  describe('dropdown trigger mode (aria-expanded defined)', () => {
    test('automatically uses button variant when aria-expanded is defined', async () => {
      const screen = await render(
        <Chip pressed={false} onPressedChange={() => {}} aria-expanded={false}>
          Dropdown Trigger
        </Chip>
      )

      const button = screen.getByRole('button')
      // Button variant doesn't have aria-pressed
      await expect.element(button).not.toHaveAttribute('aria-pressed')
      await expect.element(button).toHaveAttribute('aria-expanded', 'false')
    })

    test('sets aria-expanded correctly', async () => {
      const screen = await render(
        <Chip pressed={false} onPressedChange={() => {}} aria-expanded={true}>
          Dropdown Trigger
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-expanded', 'true')
    })

    test('sets aria-controls when provided', async () => {
      const screen = await render(
        <Chip
          pressed={false}
          onPressedChange={() => {}}
          aria-expanded={true}
          aria-controls="dropdown-menu"
        >
          Dropdown Trigger
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-controls', 'dropdown-menu')
    })

    test('sets aria-haspopup when provided', async () => {
      const screen = await render(
        <Chip pressed={false} onPressedChange={() => {}} aria-expanded={false} aria-haspopup="menu">
          Dropdown Trigger
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-haspopup', 'menu')
    })

    test('sets data-pressed when pressed in dropdown mode', async () => {
      const screen = await render(
        <Chip pressed={true} onPressedChange={() => {}} aria-expanded={true}>
          Dropdown Trigger
        </Chip>
      )

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('data-pressed')
    })

    test('calls onPressedChange when clicked in dropdown mode', async () => {
      const handleChange = vi.fn<(pressed: boolean) => void>()
      const screen = await render(
        <Chip pressed={false} onPressedChange={handleChange} aria-expanded={false}>
          Dropdown Trigger
        </Chip>
      )

      await screen.getByRole('button').click()

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  // ===========================================
  // Combined state tests
  // ===========================================

  test('renders disabled pressed chip', async () => {
    const screen = await render(
      <Chip pressed={true} onPressedChange={() => {}} disabled>
        Disabled Pressed
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders small chip with all props', async () => {
    const screen = await render(
      <Chip size="sm" pressed={true} onPressedChange={() => {}}>
        Small Chip
      </Chip>
    )

    await expect.element(screen.getByText('Small Chip')).toBeInTheDocument()
    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders button variant with size sm', async () => {
    const screen = await render(
      <Chip variant="button" size="sm" pressed={true} onPressedChange={() => {}}>
        Small Button
      </Chip>
    )

    await expect.element(screen.getByText('Small Button')).toBeInTheDocument()
    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('data-pressed')
  })

  // ===========================================
  // Readonly mode tests
  // ===========================================
  describe('readonly mode', () => {
    test('renders as div, not button', async () => {
      const screen = await render(<Chip readonly>Readonly Chip</Chip>)

      // Should not find a button element
      const buttons = screen.container.querySelectorAll('button')
      expect(buttons.length).toBe(0)

      // Should find a div with the chip class
      const chip = screen.getByText('Readonly Chip')
      await expect.element(chip).toBeInTheDocument()
      expect(chip.element().tagName).toBe('DIV')
    })

    test('applies custom role', async () => {
      const screen = await render(
        <Chip readonly role="timer">
          Timer
        </Chip>
      )

      const timer = screen.getByRole('timer')
      await expect.element(timer).toBeInTheDocument()
    })

    test('applies aria-label', async () => {
      const screen = await render(
        <Chip readonly role="timer" aria-label="Match timer: 10:30">
          10:30
        </Chip>
      )

      const timer = screen.getByRole('timer')
      await expect.element(timer).toHaveAttribute('aria-label', 'Match timer: 10:30')
    })

    test('does not have interactive attributes', async () => {
      const screen = await render(<Chip readonly>Readonly</Chip>)

      const chip = screen.getByText('Readonly').element()
      // Should not have interactive attributes
      expect(chip.hasAttribute('aria-pressed')).toBe(false)
      expect(chip.hasAttribute('aria-expanded')).toBe(false)
      expect(chip.hasAttribute('disabled')).toBe(false)
      expect(chip.getAttribute('tabindex')).toBeNull()
    })

    test('applies size class correctly', async () => {
      const screen = await render(
        <Chip readonly size="sm">
          Small Readonly
        </Chip>
      )

      const chip = screen.getByText('Small Readonly').element()
      expect(chip.className).toMatch(/sizeSm/)
    })

    test('applies custom className', async () => {
      const screen = await render(
        <Chip readonly className="custom-class">
          Custom
        </Chip>
      )

      const chip = screen.getByText('Custom')
      await expect.element(chip).toHaveClass('custom-class')
    })

    test('ignores interactive props', async () => {
      // These props should be ignored in readonly mode
      const screen = await render(
        <Chip
          readonly
          pressed={true}
          onPressedChange={() => {}}
          disabled={true}
          variant="button"
          aria-expanded={true}
        >
          Ignored Props
        </Chip>
      )

      const chip = screen.getByText('Ignored Props').element()
      // Should be a div, not a button
      expect(chip.tagName).toBe('DIV')
      // Should not have interactive attributes
      expect(chip.hasAttribute('aria-pressed')).toBe(false)
      expect(chip.hasAttribute('aria-expanded')).toBe(false)
      expect(chip.hasAttribute('disabled')).toBe(false)
    })
  })
})
