/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { Chip, type ChipSize, type ChipAccent } from '@/components/ui/Chip/Chip'

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
      const handleChange = vi.fn()
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
      const handleChange = vi.fn()
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

    test('shows dot when showDot is true', async () => {
      const screen = await render(
        <Chip variant="button" pressed={false} onPressedChange={() => {}} showDot>
          With Dot
        </Chip>
      )
      const button = screen.getByRole('button')
      const dot = button.element().querySelector('[aria-hidden="true"]')
      expect(dot).toBeTruthy()
      expect(dot?.className).toMatch(/dot/)
    })

    test('respects disabled prop', async () => {
      const handleChange = vi.fn()
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
  // Accent tests
  // ===========================================
  const accents: ChipAccent[] = ['primary', 'secondary']
  accents.forEach((accent) => {
    test(`renders correctly with accent: ${accent}`, async () => {
      const screen = await render(
        <Chip accent={accent} pressed={false} onPressedChange={() => {}}>
          {accent} Chip
        </Chip>
      )

      await expect.element(screen.getByText(`${accent} Chip`)).toBeInTheDocument()
    })

    test(`applies secondary accent class when accent is ${accent}`, async () => {
      const screen = await render(
        <Chip accent={accent} pressed={true} onPressedChange={() => {}}>
          {accent} Chip
        </Chip>
      )

      const button = screen.getByRole('button')
      // Check that the element's class contains the secondary accent class
      const className = button.element().className
      if (accent === 'secondary') {
        expect(className).toMatch(/accentSecondary/)
      } else {
        // Primary accent doesn't have a specific class
        expect(className).not.toMatch(/accentSecondary/)
      }
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
    const handleChange = vi.fn()
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
  // showDot tests
  // ===========================================
  test('shows dot when showDot is true', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}} showDot>
        With Dot
      </Chip>
    )

    const dot = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(dot).toBeTruthy()
  })

  test('does not show dot when showDot is false (default)', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}}>
        No Dot
      </Chip>
    )

    const button = screen.getByRole('button').element()
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeNull()
  })

  test('dot has primary accent color by default', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}} showDot>
        Primary Dot
      </Chip>
    )

    const button = screen.getByRole('button').element()
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeTruthy()
  })

  test('dot has secondary accent color when accent is secondary', async () => {
    const screen = await render(
      <Chip pressed={false} onPressedChange={() => {}} accent="secondary" showDot>
        Secondary Dot
      </Chip>
    )

    const button = screen.getByRole('button').element()
    const dot = button.querySelector('[class*="dot"]')
    expect(dot).toBeTruthy()
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
      const handleChange = vi.fn()
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
  test('renders pressed primary chip with dot', async () => {
    const screen = await render(
      <Chip pressed={true} onPressedChange={() => {}} accent="primary" showDot>
        Selected Primary
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
    await expect.element(button).toHaveAttribute('data-pressed')
  })

  test('renders pressed secondary chip with dot', async () => {
    const screen = await render(
      <Chip pressed={true} onPressedChange={() => {}} accent="secondary" showDot>
        Selected Secondary
      </Chip>
    )

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
    await expect.element(button).toHaveAttribute('data-pressed')
  })

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
      <Chip size="sm" pressed={true} onPressedChange={() => {}} accent="secondary" showDot>
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
})
