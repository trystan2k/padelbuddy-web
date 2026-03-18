/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi, beforeEach } from 'vitest'
import { render } from 'vitest-browser-react'

import { TopBar } from '@/components/ui/TopBar/TopBar'
import * as i18nModule from '@/lib/i18n'

vi.mock('@/lib/i18n', async (importOriginal) => {
  const original = await importOriginal<typeof i18nModule>()
  return {
    ...original,
    changeLocale: vi.fn().mockResolvedValue(undefined)
  }
})

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================
  // Basic rendering tests
  // ===========================================
  test('renders without crashing', async () => {
    const screen = await render(<TopBar />)

    const container = screen.container.firstChild
    expect(container).toBeTruthy()
  })

  test('renders with custom className', async () => {
    const screen = await render(<TopBar className="custom-class" />)

    const container = screen.container.firstChild as Element
    expect(container.className).toContain('custom-class')
  })

  // ===========================================
  // Branding tests
  // ===========================================
  describe('branding', () => {
    test('renders with iconSrc, title, and subtitle props', async () => {
      const screen = await render(
        <TopBar iconSrc="/icon.png" iconAlt="App Icon" title="My App" subtitle="Subtitle text" />
      )

      await expect.element(screen.getByText('My App')).toBeInTheDocument()
      await expect.element(screen.getByText('Subtitle text')).toBeInTheDocument()

      const img = screen.container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toBe('/icon.png')
      expect(img?.getAttribute('alt')).toBe('App Icon')
    })

    test('renders without branding when no branding props provided', async () => {
      const screen = await render(<TopBar />)

      // Should not have branding section
      const branding = screen.container.querySelector('[class*="branding"]')
      expect(branding).toBeNull()
    })

    test('renders with only title', async () => {
      const screen = await render(<TopBar title="My App" />)

      await expect.element(screen.getByText('My App')).toBeInTheDocument()
      // Should not have subtitle
      const subtitle = screen.container.querySelector('[class*="subtitle"]')
      expect(subtitle).toBeNull()
    })

    test('renders with only subtitle', async () => {
      const screen = await render(<TopBar subtitle="Just a subtitle" />)

      await expect.element(screen.getByText('Just a subtitle')).toBeInTheDocument()
    })

    test('renders with only iconSrc', async () => {
      const screen = await render(<TopBar iconSrc="/icon.png" />)

      const img = screen.container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toBe('/icon.png')
    })

    test('icon has aria-hidden when iconAlt is empty (decorative)', async () => {
      const screen = await render(<TopBar iconSrc="/icon.png" iconAlt="" />)

      const img = screen.container.querySelector('img')
      expect(img?.getAttribute('aria-hidden')).toBe('true')
    })

    test('icon does not have aria-hidden when iconAlt is provided', async () => {
      const screen = await render(<TopBar iconSrc="/icon.png" iconAlt="App Icon" />)

      const img = screen.container.querySelector('img')
      expect(img?.getAttribute('aria-hidden')).toBeNull()
    })

    test('title renders as h1 element', async () => {
      const screen = await render(<TopBar title="My App" />)

      const h1 = screen.container.querySelector('h1')
      expect(h1).toBeTruthy()
      expect(h1?.textContent).toBe('My App')
    })

    test('subtitle renders as p element', async () => {
      const screen = await render(<TopBar subtitle="Subtitle" />)

      const p = screen.container.querySelector('p')
      expect(p).toBeTruthy()
      expect(p?.textContent).toBe('Subtitle')
    })
  })

  // ===========================================
  // Locale selector tests
  // ===========================================
  describe('locale selector', () => {
    test('does not show locale selector by default', async () => {
      const screen = await render(<TopBar />)

      const buttons = screen.container.querySelectorAll('button')
      expect(buttons.length).toBe(0)
    })

    test('shows locale selector when showLocaleSelector is true', async () => {
      const screen = await render(<TopBar showLocaleSelector />)

      await expect.element(screen.getByText('English')).toBeInTheDocument()
    })

    test('renders locale chip with controlled locale', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="es" />)

      await expect.element(screen.getByText('Español')).toBeInTheDocument()
    })

    test('toggles locale menu when chip clicked', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const chips = screen.container.querySelectorAll('button')
      const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
      expect(localeChip).toBeTruthy()
      localeChip!.click()

      await vi.waitFor(() => {
        const allButtons = screen.container.querySelectorAll('button')
        const spanishChip = Array.from(allButtons).find((btn) =>
          btn.textContent?.includes('Español')
        )
        expect(spanishChip).toBeTruthy()
      })
    })

    test('closes menu after selecting locale', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const chips = screen.container.querySelectorAll('button')
      const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
      localeChip!.click()

      await vi.waitFor(() => {
        const allButtons = screen.container.querySelectorAll('button')
        const spanishChip = Array.from(allButtons).find((btn) =>
          btn.textContent?.includes('Español')
        )
        expect(spanishChip).toBeTruthy()
      })

      const allButtons = screen.container.querySelectorAll('button')
      const spanishChip = Array.from(allButtons).find((btn) => btn.textContent?.includes('Español'))
      spanishChip!.click()

      await vi.waitFor(() => {
        const menu = screen.container.querySelector('#locale-menu')
        expect(menu).toBeNull()
      })
    })

    test('calls changeLocale when different locale selected', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const chips = screen.container.querySelectorAll('button')
      const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
      localeChip!.click()

      await vi.waitFor(() => {
        const allButtons = screen.container.querySelectorAll('button')
        const spanishChip = Array.from(allButtons).find((btn) =>
          btn.textContent?.includes('Español')
        )
        expect(spanishChip).toBeTruthy()
      })

      const allButtons = screen.container.querySelectorAll('button')
      const spanishChip = Array.from(allButtons).find((btn) => btn.textContent?.includes('Español'))
      spanishChip!.click()

      expect(i18nModule.changeLocale).toHaveBeenCalledWith('es')
    })

    test('does not call changeLocale when same locale selected', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const chips = screen.container.querySelectorAll('button')
      const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
      localeChip!.click()

      await vi.waitFor(() => {
        const allButtons = screen.container.querySelectorAll('button')
        const englishInMenu = Array.from(allButtons).find(
          (btn) => btn.textContent?.includes('English') && btn !== localeChip
        )
        expect(englishInMenu).toBeTruthy()
      })

      const allButtons = screen.container.querySelectorAll('button')
      const englishInMenu = Array.from(allButtons).find(
        (btn) => btn.textContent?.includes('English') && btn !== localeChip
      )
      englishInMenu!.click()

      expect(i18nModule.changeLocale).not.toHaveBeenCalled()
    })

    test('calls onLocaleChange callback when locale changes', async () => {
      const handleLocaleChange = vi.fn()
      const screen = await render(
        <TopBar showLocaleSelector currentLocale="en" onLocaleChange={handleLocaleChange} />
      )

      const chips = screen.container.querySelectorAll('button')
      const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
      localeChip!.click()

      await vi.waitFor(() => {
        const allButtons = screen.container.querySelectorAll('button')
        const spanishChip = Array.from(allButtons).find((btn) =>
          btn.textContent?.includes('Español')
        )
        expect(spanishChip).toBeTruthy()
      })

      const allButtons = screen.container.querySelectorAll('button')
      const spanishChip = Array.from(allButtons).find((btn) => btn.textContent?.includes('Español'))
      spanishChip!.click()

      await vi.waitFor(() => {
        expect(handleLocaleChange).toHaveBeenCalledWith('es')
      })
    })

    test('shows all available locales in menu', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const chips = screen.container.querySelectorAll('button')
      const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
      localeChip!.click()

      await vi.waitFor(() => {
        const menu = screen.container.querySelector('#locale-menu')
        expect(menu).toBeTruthy()
      })

      const menu = screen.container.querySelector('#locale-menu')
      expect(menu).toBeTruthy()
      expect(menu?.textContent).toContain('English')
      expect(menu?.textContent).toContain('Español')
      expect(menu?.textContent).toContain('Português')
    })
  })

  // ===========================================
  // ARIA attributes tests
  // ===========================================
  describe('ARIA attributes', () => {
    test('locale chip has aria-haspopup', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-haspopup', 'true')
    })

    test('locale chip has aria-expanded="false" when menu is closed', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const button = screen.getByRole('button')
      await expect.element(button).toHaveAttribute('aria-expanded', 'false')
    })

    test('locale chip has aria-expanded="true" when menu is open', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const buttons = screen.container.querySelectorAll<HTMLButtonElement>(
        'button[aria-haspopup="true"]'
      )
      const triggerButton = buttons[0]
      expect(triggerButton).toBeTruthy()
      triggerButton!.click()

      await vi.waitFor(() => {
        expect(triggerButton!.getAttribute('aria-expanded')).toBe('true')
      })
    })

    test('locale chip has aria-controls when menu is open', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const buttons = screen.container.querySelectorAll<HTMLButtonElement>(
        'button[aria-haspopup="true"]'
      )
      const triggerButton = buttons[0]
      expect(triggerButton).toBeTruthy()
      triggerButton!.click()

      await vi.waitFor(() => {
        expect(triggerButton!.getAttribute('aria-controls')).toBe('locale-menu')
      })
    })

    test('menu has role="group"', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const button = screen.getByRole('button')
      await button.click()

      const menu = screen.container.querySelector('#locale-menu')
      expect(menu?.getAttribute('role')).toBe('group')
    })

    test('menu has aria-label', async () => {
      const screen = await render(<TopBar showLocaleSelector currentLocale="en" />)

      const button = screen.getByRole('button')
      await button.click()

      const menu = screen.container.querySelector('#locale-menu')
      expect(menu?.getAttribute('aria-label')).toBeTruthy()
    })
  })

  // ===========================================
  // Combined tests
  // ===========================================
  test('renders with branding and locale selector', async () => {
    const screen = await render(
      <TopBar title="My App" subtitle="Subtitle" iconSrc="/icon.png" showLocaleSelector />
    )

    await expect.element(screen.getByText('My App')).toBeInTheDocument()
    await expect.element(screen.getByText('Subtitle')).toBeInTheDocument()
    await expect.element(screen.getByText('English')).toBeInTheDocument()
  })

  test('renders with branding without locale selector', async () => {
    const screen = await render(<TopBar title="My App" subtitle="Subtitle" />)

    await expect.element(screen.getByText('My App')).toBeInTheDocument()
    await expect.element(screen.getByText('Subtitle')).toBeInTheDocument()
    const buttons = screen.container.querySelectorAll('button')
    expect(buttons.length).toBe(0)
  })

  test('renders with locale selector without branding', async () => {
    const screen = await render(<TopBar showLocaleSelector />)

    await expect.element(screen.getByText('English')).toBeInTheDocument()
    // Should not have branding
    const branding = screen.container.querySelector('[class*="branding"]')
    expect(branding).toBeNull()
  })
})
