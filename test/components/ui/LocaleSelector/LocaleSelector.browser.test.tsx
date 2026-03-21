/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { LocaleSelector } from '@/components/ui/LocaleSelector'
import { TopBar } from '@/components/ui/TopBar'
import * as i18nModule from '@/lib/i18n'

vi.mock('@/lib/i18n', async (importOriginal) => {
  const original = await importOriginal<typeof i18nModule>()
  return {
    ...original,
    changeLocale: vi.fn().mockResolvedValue(undefined)
  }
})

describe('LocaleSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders as TopBar child content', async () => {
    const screen = await render(
      <TopBar title="My App">
        <LocaleSelector currentLocale="en" />
      </TopBar>
    )

    await expect.element(screen.getByText('My App')).toBeInTheDocument()
    await expect.element(screen.getByRole('button', { name: /english/i })).toBeInTheDocument()
  })

  test('renders the controlled locale label', async () => {
    const screen = await render(<LocaleSelector currentLocale="es" />)

    await expect.element(screen.getByRole('button', { name: /español/i })).toBeInTheDocument()
  })

  test('toggles the locale menu with preserved aria attributes', async () => {
    const screen = await render(<LocaleSelector currentLocale="en" />)

    const trigger = screen.getByRole('button', { name: /english/i })
    const triggerElement = trigger.element()
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'true')
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.click()

    await vi.waitFor(() => {
      expect(triggerElement.getAttribute('aria-expanded')).toBe('true')
      expect(triggerElement.getAttribute('aria-controls')).toBe('locale-menu')
    })

    const menu = screen.container.querySelector('#locale-menu')
    expect(menu?.getAttribute('role')).toBe('group')
    expect(menu?.getAttribute('aria-label')).toBeTruthy()
    expect(menu?.textContent).toContain('English')
    expect(menu?.textContent).toContain('Español')
    expect(menu?.textContent).toContain('Português')
  })

  test('calls changeLocale and onLocaleChange when locale changes', async () => {
    const handleLocaleChange = vi.fn()
    const screen = await render(
      <LocaleSelector currentLocale="en" onLocaleChange={handleLocaleChange} />
    )

    await screen.getByRole('button', { name: /english/i }).click()

    const spanishOption = screen.getByRole('button', { name: /español/i })
    await spanishOption.click()

    await vi.waitFor(() => {
      expect(i18nModule.changeLocale).toHaveBeenCalledWith('es')
      expect(handleLocaleChange).toHaveBeenCalledWith('es')
    })
  })

  test('does not call changeLocale when selecting the current locale', async () => {
    const screen = await render(<LocaleSelector currentLocale="en" />)
    const trigger = screen.getByRole('button', { name: /english/i })

    await trigger.click()

    const menu = screen.container.querySelector('#locale-menu')
    const englishMenuOption = Array.from(menu?.querySelectorAll('button') ?? []).find((button) =>
      button.textContent?.includes('English')
    )

    expect(englishMenuOption).toBeTruthy()
    englishMenuOption?.click()

    expect(i18nModule.changeLocale).not.toHaveBeenCalled()
  })
})
