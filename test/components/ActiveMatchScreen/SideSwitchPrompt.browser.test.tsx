/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { SideSwitchPrompt } from '@/components/ActiveMatchScreen/SideSwitchPrompt/SideSwitchPrompt'

describe('SideSwitchPrompt', () => {
  const defaultProps = {
    isOpen: true,
    reason: 'odd-games' as const,
    onConfirm: vi.fn()
  }

  test('renders when open with odd-games reason', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    await expect.element(screen.getByText('Switch sides (odd games)')).toBeInTheDocument()
  })

  test('renders when open with tiebreak-interval reason', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} reason="tiebreak-interval" />)

    await expect.element(screen.getByText('Switch sides (tiebreak)')).toBeInTheDocument()
  })

  test('does not render when isOpen is false', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} isOpen={false} />)

    expect(screen.container.innerHTML).toBe('')
  })

  test('does not render when reason is null', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} reason={null} />)

    expect(screen.container.innerHTML).toBe('')
  })

  test('calls onConfirm when confirm button clicked', async () => {
    const handleConfirm = vi.fn()
    const screen = await render(<SideSwitchPrompt {...defaultProps} onConfirm={handleConfirm} />)

    await screen.getByText('Switched').click()

    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  test('renders description text', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    await expect.element(screen.getByText('Players should switch sides now.')).toBeInTheDocument()
  })

  test('has dialog role', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    await expect.element(dialog).toBeInTheDocument()
  })

  test('has aria-modal attribute', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    await expect.element(dialog).toHaveAttribute('aria-modal', 'true')
  })

  test('has test id', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    await expect.element(screen.getByTestId('side-switch-prompt')).toBeInTheDocument()
  })

  test('has accessible label for title', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    const title = screen.container.querySelector('#side-switch-title')
    expect(title).toBeTruthy()
    expect(title?.textContent).toBe('Switch sides (odd games)')
  })

  test('confirm button has correct type', async () => {
    const screen = await render(<SideSwitchPrompt {...defaultProps} />)

    const confirmButton = screen.getByText('Switched')
    await expect.element(confirmButton).toHaveAttribute('type', 'button')
  })
})
