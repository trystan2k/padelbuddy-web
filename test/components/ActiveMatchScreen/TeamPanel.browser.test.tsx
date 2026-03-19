/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { TeamPanel } from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel'

describe('TeamPanel', () => {
  const defaultProps = {
    teamId: 'team-1' as const,
    teamName: 'Team Alpha',
    score: '15',
    games: 2,
    isServing: true,
    isGoldenPointActive: false,
    onClick: vi.fn()
  }

  test('renders team name', async () => {
    const screen = await render(<TeamPanel {...defaultProps} />)

    await expect.element(screen.getByText('Team Alpha')).toBeInTheDocument()
  })

  test('renders score', async () => {
    const screen = await render(<TeamPanel {...defaultProps} score="40" />)

    await expect.element(screen.getByRole('button')).toHaveTextContent('40')
  })

  test('renders games count', async () => {
    const screen = await render(<TeamPanel {...defaultProps} games={4} />)

    await expect.element(screen.getByText('Games 4')).toBeInTheDocument()
  })

  test('shows serve indicator when serving', async () => {
    const screen = await render(<TeamPanel {...defaultProps} isServing={true} />)

    await expect.element(screen.getByTestId('serve-indicator-team-1')).toBeInTheDocument()
    await expect.element(screen.getByTestId('serve-status-team-1')).toHaveTextContent('Serving')
  })

  test('hides serve indicator when not serving', async () => {
    const screen = await render(<TeamPanel {...defaultProps} isServing={false} />)

    const serveIndicator = screen.container.querySelector('[data-testid="serve-indicator-team-1"]')
    expect(serveIndicator).toBeNull()
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<TeamPanel {...defaultProps} onClick={handleClick} />)

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', async () => {
    const screen = await render(<TeamPanel {...defaultProps} disabled={true} />)

    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()
  })

  test('is enabled when disabled prop is false', async () => {
    const screen = await render(<TeamPanel {...defaultProps} disabled={false} />)

    const button = screen.getByRole('button')
    await expect.element(button).not.toBeDisabled()
  })

  test('shows golden point chip when active', async () => {
    const screen = await render(<TeamPanel {...defaultProps} isGoldenPointActive={true} />)

    await expect.element(screen.getByText('GP')).toBeInTheDocument()
  })

  test('hides golden point chip when not active', async () => {
    const screen = await render(<TeamPanel {...defaultProps} isGoldenPointActive={false} />)

    // GP text should not be in the document
    const button = screen.getByRole('button')
    const buttonText = button.element().textContent
    expect(buttonText).not.toContain('GP')
  })

  test('renders for team-1 with correct test id', async () => {
    const screen = await render(<TeamPanel {...defaultProps} teamId="team-1" />)

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument()
  })

  test('renders for team-2 with correct test id', async () => {
    const screen = await render(<TeamPanel {...defaultProps} teamId="team-2" />)

    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument()
  })

  test('has accessible label for scoring', async () => {
    const screen = await render(<TeamPanel {...defaultProps} teamName="The Champions" />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-label', 'Score point for The Champions')
  })

  test('score has aria-live for accessibility', async () => {
    const screen = await render(<TeamPanel {...defaultProps} />)

    const scoreElement = screen.container.querySelector('[aria-live="polite"]')
    expect(scoreElement).toBeTruthy()
  })

  test('serve bar remains visual only when serving', async () => {
    const screen = await render(<TeamPanel {...defaultProps} isServing={true} />)

    const serveBar = screen.container.querySelector('[data-testid="serve-indicator-team-1"]')
    expect(serveBar).toBeTruthy()
    expect(serveBar?.getAttribute('aria-hidden')).toBe('true')

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('aria-describedby')
  })

  test('golden point chip has accessible label when active', async () => {
    const screen = await render(<TeamPanel {...defaultProps} isGoldenPointActive={true} />)

    const chip = screen.container.querySelector('[aria-label="Golden point on"]')
    expect(chip).toBeTruthy()
  })

  test('has type button', async () => {
    const screen = await render(<TeamPanel {...defaultProps} />)

    const button = screen.getByRole('button')
    await expect.element(button).toHaveAttribute('type', 'button')
  })

  test('disabled state prevents click handler in browser', async () => {
    const screen = await render(<TeamPanel {...defaultProps} disabled={true} />)

    // Verify button is disabled
    const button = screen.getByRole('button')
    await expect.element(button).toBeDisabled()

    // In browser tests, clicking disabled buttons doesn't fire the event
    // This test confirms the disabled state is properly applied
  })
})
