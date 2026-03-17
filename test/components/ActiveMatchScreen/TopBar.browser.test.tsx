/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi, beforeEach } from 'vitest'
import { render } from 'vitest-browser-react'

import { TopBar } from '@/components/ActiveMatchScreen/TopBar/TopBar'
import * as i18nModule from '@/lib/i18n'

// Mock changeLocale to avoid actual locale changes
vi.mock('@/lib/i18n', async (importOriginal) => {
  const original = await importOriginal<typeof i18nModule>()
  return {
    ...original,
    changeLocale: vi.fn()
  }
})

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders app name', async () => {
    const screen = await render(<TopBar currentLocale="en" />)

    await expect.element(screen.getByText('Padel Buddy')).toBeInTheDocument()
  })

  test('renders subtitle', async () => {
    const screen = await render(<TopBar currentLocale="en" />)

    await expect.element(screen.getByText('Live Match')).toBeInTheDocument()
  })

  test('renders locale chip with current locale', async () => {
    const screen = await render(<TopBar currentLocale="en" />)

    // English flag and label should be visible
    await expect.element(screen.getByText('English')).toBeInTheDocument()
  })

  test('renders with Spanish locale', async () => {
    const screen = await render(<TopBar currentLocale="es" />)

    await expect.element(screen.getByText('Español')).toBeInTheDocument()
  })

  test('calls changeLocale when different locale selected', async () => {
    const screen = await render(<TopBar currentLocale="en" />)

    // Open menu by clicking the locale chip (use role to find it)
    const chips = screen.container.querySelectorAll('button')
    const localeChip = Array.from(chips).find((chip) => chip.textContent?.includes('English'))
    expect(localeChip).toBeTruthy()
    localeChip!.click()

    // Click on Spanish in the menu (look for the chip that's not the original)
    await vi.waitFor(() => {
      const allButtons = screen.container.querySelectorAll('button')
      const spanishChip = Array.from(allButtons).find((btn) => btn.textContent?.includes('Español'))
      expect(spanishChip).toBeTruthy()
    })

    const allButtons = screen.container.querySelectorAll('button')
    const spanishChip = Array.from(allButtons).find((btn) => btn.textContent?.includes('Español'))
    spanishChip!.click()

    expect(i18nModule.changeLocale).toHaveBeenCalledWith('es')
  })

  test('renders icon image', async () => {
    const screen = await render(<TopBar currentLocale="en" />)

    const icon = screen.container.querySelector('img[src="/icon.png"]')
    expect(icon).toBeTruthy()
  })

  test('renders container structure', async () => {
    const screen = await render(<TopBar currentLocale="en" />)

    // Check that the component renders without errors
    const container = screen.container.firstChild
    expect(container).toBeTruthy()
  })
})
