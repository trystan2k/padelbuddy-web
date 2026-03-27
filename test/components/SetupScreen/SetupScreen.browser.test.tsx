/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { SetupScreen } from '@/components/SetupScreen/SetupScreen'

const { mockInvalidate, mockNavigate, mockPreloadRoute } = vi.hoisted(() => ({
  mockInvalidate: vi.fn(),
  mockNavigate: vi.fn(),
  mockPreloadRoute: vi.fn()
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouter: () => ({
      invalidate: mockInvalidate,
      preloadRoute: mockPreloadRoute
    })
  }
})

describe('SetupScreen countdown timer controls', () => {
  test('renders countdown controls with the default disabled duration state', async () => {
    const screen = await render(<SetupScreen />)

    const countdownToggle = screen.getByRole('switch', { name: /countdown timer/i })
    const ninetyMinuteOption = screen.getByRole('radio', { name: '1:30 h' })
    const oneHourOption = screen.getByRole('radio', { name: '1:00 h' })
    const twoHourOption = screen.getByRole('radio', { name: '2:00 h' })

    await expect.element(countdownToggle).toHaveAttribute('aria-checked', 'false')
    await expect.element(ninetyMinuteOption).toHaveAttribute('aria-checked', 'true')
    await expect.element(oneHourOption).toBeDisabled()
    await expect.element(ninetyMinuteOption).toBeDisabled()
    await expect.element(twoHourOption).toBeDisabled()
  })

  test('enables duration selection when countdown is turned on', async () => {
    const screen = await render(<SetupScreen />)

    const countdownToggle = screen.getByRole('switch', { name: /countdown timer/i })
    const oneHourOption = screen.getByRole('radio', { name: '1:00 h' })
    const twoHourOption = screen.getByRole('radio', { name: '2:00 h' })

    ;(countdownToggle.element() as HTMLElement).click()

    await expect.element(countdownToggle).toHaveAttribute('aria-checked', 'true')
    await expect.element(oneHourOption).toBeEnabled()
    await expect.element(twoHourOption).toBeEnabled()

    await twoHourOption.click()

    await expect.element(twoHourOption).toHaveAttribute('aria-checked', 'true')
    await expect.element(oneHourOption).toHaveAttribute('aria-checked', 'false')
  })

  test('supports arrow key navigation across countdown duration radios', async () => {
    const screen = await render(<SetupScreen />)

    const countdownToggle = screen.getByRole('switch', { name: /countdown timer/i })
    const durationRow = screen.getByTestId('countdown-duration-row')
    const oneHourOption = screen.getByRole('radio', { name: '1:00 h' })
    const ninetyMinuteOption = screen.getByRole('radio', { name: '1:30 h' })
    const twoHourOption = screen.getByRole('radio', { name: '2:00 h' })

    ;(countdownToggle.element() as HTMLElement).click()

    await expect.element(ninetyMinuteOption).toHaveAttribute('tabindex', '0')
    await expect.element(oneHourOption).toHaveAttribute('tabindex', '-1')

    durationRow
      .element()
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

    await expect.element(twoHourOption).toHaveAttribute('aria-checked', 'true')
    await expect.element(twoHourOption).toHaveAttribute('tabindex', '0')

    durationRow
      .element()
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

    await expect.element(ninetyMinuteOption).toHaveAttribute('aria-checked', 'true')
    await expect.element(ninetyMinuteOption).toHaveAttribute('tabindex', '0')
  })

  test('dims and disables first server controls when serving indicator is turned off', async () => {
    const screen = await render(<SetupScreen />)

    const servingIndicatorToggle = screen.getByRole('switch', { name: /serving indicator/i })
    const firstServerSection = screen.getByTestId('first-server-section')
    const team1ServerButton = screen.getByRole('button', { name: /^team 1$/i })
    const team2ServerButton = screen.getByRole('button', { name: /^team 2$/i })

    ;(servingIndicatorToggle.element() as HTMLElement).click()

    await expect.element(servingIndicatorToggle).toHaveAttribute('aria-checked', 'false')
    expect(getComputedStyle(firstServerSection.element()).opacity).toBe('0.35')
    await expect.element(team1ServerButton).toBeDisabled()
    await expect.element(team2ServerButton).toBeDisabled()
  })

  test('preserves the first server selection while the serving indicator is off', async () => {
    const screen = await render(<SetupScreen />)

    const servingIndicatorToggle = screen.getByRole('switch', { name: /serving indicator/i })
    const team1ServerButton = screen.getByRole('button', { name: /^team 1$/i })
    const team2ServerButton = screen.getByRole('button', { name: /^team 2$/i })

    await team2ServerButton.click()
    await expect.element(team2ServerButton).toHaveAttribute('aria-pressed', 'true')

    ;(servingIndicatorToggle.element() as HTMLElement).click()
    await expect.element(team2ServerButton).toBeDisabled()

    ;(servingIndicatorToggle.element() as HTMLElement).click()

    await expect.element(team2ServerButton).toBeEnabled()
    await expect.element(team2ServerButton).toHaveAttribute('aria-pressed', 'true')
    await expect.element(team1ServerButton).toHaveAttribute('aria-pressed', 'false')
  })
})
