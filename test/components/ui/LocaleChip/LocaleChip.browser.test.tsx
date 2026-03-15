import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { LocaleChip } from '@/components/ui/LocaleChip/LocaleChip'
import type { SupportedLocale } from '@/lib/i18n/types'

describe('LocaleChip', () => {
  test('renders with locale and label', async () => {
    const screen = await render(<LocaleChip locale="en" label="English" />)

    await expect.element(screen.getByText('English')).toBeInTheDocument()
  })

  test('renders with active state', async () => {
    const screen = await render(<LocaleChip locale="en" label="English" active />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders with inactive state (default)', async () => {
    const screen = await render(<LocaleChip locale="en" label="English" />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-pressed', 'false')
  })

  test('renders with custom className', async () => {
    const screen = await render(<LocaleChip locale="en" label="English" className="custom" />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveClass('custom')
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<LocaleChip locale="en" label="English" onClick={handleClick} />)

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when not provided', async () => {
    const screen = await render(<LocaleChip locale="en" label="English" />)

    // Should not throw when clicking without onClick handler
    await screen.getByRole('button').click()
  })

  test('renders correct flag for English', async () => {
    const screen = await render(<LocaleChip locale="en" label="English" />)

    // Check for the flag emoji (rendered in aria-hidden span)
    const flagSpan = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(flagSpan?.textContent).toBe('🇺🇸')
  })

  test('renders correct flag for Portuguese', async () => {
    const screen = await render(<LocaleChip locale="pt" label="Português" />)

    const flagSpan = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(flagSpan?.textContent).toBe('🇧🇷')
  })

  test('renders correct flag for Spanish', async () => {
    const screen = await render(<LocaleChip locale="es" label="Español" />)

    const flagSpan = screen.getByRole('button').element().querySelector('[aria-hidden="true"]')
    expect(flagSpan?.textContent).toBe('🇪🇸')
  })

  // Test all locales for complete branch coverage
  const locales: SupportedLocale[] = ['en', 'pt', 'es']
  locales.forEach((locale) => {
    test(`renders correctly for locale: ${locale}`, async () => {
      const screen = await render(<LocaleChip locale={locale} label={locale.toUpperCase()} />)

      await expect.element(screen.getByText(locale.toUpperCase())).toBeInTheDocument()
    })
  })
})
