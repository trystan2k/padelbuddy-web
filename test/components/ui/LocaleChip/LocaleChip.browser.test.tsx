import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { LocaleChip } from '@/components/ui/LocaleChip/LocaleChip'

describe('LocaleChip', () => {
  test('renders with flag and label', async () => {
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" />)

    await expect.element(screen.getByText('English')).toBeInTheDocument()
  })

  test('renders with active state', async () => {
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" active />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders with inactive state (default)', async () => {
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'false')
    await expect.element(button).not.toHaveAttribute('aria-controls')
  })

  test('renders with custom className', async () => {
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" className="custom" />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveClass('custom')
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" onClick={handleClick} />)

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when not provided', async () => {
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" />)

    // Should not throw when clicking without onClick handler
    await screen.getByRole('button').click()
  })

  test('renders correct flag for English', async () => {
    const screen = await render(<LocaleChip flag="🇺🇸" label="English" />)

    // Check for the flag emoji (rendered in aria-hidden span)
    const flagSpan = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(flagSpan?.textContent).toBe('🇺🇸')
  })

  test('renders correct flag for Portuguese', async () => {
    const screen = await render(<LocaleChip flag="🇧🇷" label="Português" />)

    const flagSpan = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(flagSpan?.textContent).toBe('🇧🇷')
  })

  test('renders correct flag for Spanish', async () => {
    const screen = await render(<LocaleChip flag="🇪🇸" label="Español" />)

    const flagSpan = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(flagSpan?.textContent).toBe('🇪🇸')
  })

  test('omits aria-pressed when aria-expanded is defined', async () => {
    const screen = await render(
      <LocaleChip flag="🇺🇸" label="English" active aria-expanded={false} />
    )
    const button = screen.getByRole('button')
    await expect.element(button).not.toHaveAttribute('aria-pressed')
  })

  test('sets aria-expanded correctly', async () => {
    const screen = await render(
      <LocaleChip flag="🇺🇸" label="English" active aria-expanded={true} />
    )
    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-expanded', 'true')
  })

  test('sets aria-controls when provided alongside aria-expanded', async () => {
    const screen = await render(
      <LocaleChip
        flag="🇺🇸"
        label="English"
        active
        aria-expanded={true}
        aria-controls="locale-menu"
      />
    )
    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-controls', 'locale-menu')
    await expect.element(button).toHaveAttribute('aria-expanded', 'true')
    // aria-pressed must be suppressed when aria-expanded is present
    await expect.element(button).not.toHaveAttribute('aria-pressed')
  })

  // Test different flags for complete coverage
  const flags = [
    { flag: '🇺🇸', label: 'English' },
    { flag: '🇧🇷', label: 'Português' },
    { flag: '🇪🇸', label: 'Español' }
  ]
  flags.forEach(({ flag, label }) => {
    test(`renders correctly for flag: ${flag}`, async () => {
      const screen = await render(<LocaleChip flag={flag} label={label} />)

      await expect.element(screen.getByText(label)).toBeInTheDocument()
    })
  })
})
