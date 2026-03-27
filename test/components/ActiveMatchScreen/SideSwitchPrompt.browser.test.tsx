/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, cleanup } from 'vitest-browser-react'

import { SideSwitchPrompt } from '@/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt'

describe('SideSwitchPrompt', () => {
  const defaultProps = {
    isOpen: true,
    reason: 'odd-games' as const,
    autoCloseDelay: 0 // Disable auto-close for tests
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await cleanup()
  })

  test('renders when open with odd-games reason', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    await expect.element(screen.getByText('Switch sides (odd games)')).toBeInTheDocument()
  })

  test('renders when open with tiebreak-interval reason', async () => {
    const onClose = vi.fn()
    const screen = await render(
      <SideSwitchPrompt {...defaultProps} reason="tiebreak-interval" onClose={onClose} />
    )

    await expect.element(screen.getByText('Switch sides (tiebreak)')).toBeInTheDocument()
  })

  test('does not render when isOpen is false', async () => {
    const onClose = vi.fn()
    const screen = await render(
      <SideSwitchPrompt {...defaultProps} isOpen={false} onClose={onClose} />
    )

    expect(screen.container.innerHTML).toBe('')
  })

  test('does not render when reason is null', async () => {
    const onClose = vi.fn()
    const screen = await render(
      <SideSwitchPrompt {...defaultProps} reason={null} onClose={onClose} />
    )

    expect(screen.container.innerHTML).toBe('')
  })

  test('calls onClose when confirm button clicked', async () => {
    const handleClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={handleClose} />)

    // Use dispatchEvent to reliably trigger the click in CI where Playwright's
    // click may not reach the button due to dialog overlays
    const button = screen.getByText('Switched').element()
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test('calls onClose when click on backdrop', async () => {
    const handleClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={handleClose} />)

    const backdrop = screen.getByTestId('side-switch-backdrop').element()
    // Click near the top-left corner of the backdrop, well away from the
    // centered dialog popup which overlays the backdrop center
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test('renders description text', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    await expect.element(screen.getByText('Players should switch sides now.')).toBeInTheDocument()
  })

  test('has dialog role', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    const dialog = screen.getByRole('dialog')
    await expect.element(dialog).toBeInTheDocument()
  })

  test('has aria-modal attribute', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    const dialog = screen.getByRole('dialog')
    await expect.element(dialog).toHaveAttribute('aria-modal', 'true')
  })

  test('has test id', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    await expect.element(screen.getByTestId('side-switch-prompt')).toBeInTheDocument()
  })

  test('has accessible label for title', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    // Dialog is rendered in a portal, so we query via the dialog element
    const dialog = screen.getByRole('dialog')
    const title = dialog.element().querySelector('#side-switch-title')
    expect(title).toBeTruthy()
    expect(title?.textContent).toBe('Switch sides (odd games)')
  })

  test('confirm button has correct type', async () => {
    const onClose = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onClose={onClose} />)

    const confirmButton = screen.getByText('Switched')
    await expect.element(confirmButton).toHaveAttribute('type', 'button')
  })

  test('auto-closes after specified delay', async () => {
    vi.useFakeTimers()

    const handleClose = vi.fn()
    await render(<SideSwitchPrompt {...defaultProps} onClose={handleClose} autoCloseDelay={5000} />)

    // Before delay - not called
    expect(handleClose).not.toHaveBeenCalled()

    // After delay - called
    vi.advanceTimersByTime(5000)
    expect(handleClose).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  test('does not auto-close when autoCloseDelay is 0', async () => {
    vi.useFakeTimers()

    const handleClose = vi.fn()
    await render(<SideSwitchPrompt {...defaultProps} onClose={handleClose} autoCloseDelay={0} />)

    // Even after a long time
    vi.advanceTimersByTime(60000)
    expect(handleClose).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
