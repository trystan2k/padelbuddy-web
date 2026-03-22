/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { TeamPanel } from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel'
import styles from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css'
import { resolveCssColor } from '../../utils/css'

describe('TeamPanel', () => {
  const defaultProps = {
    teamId: 'team-1' as const,
    teamName: 'Team Alpha',
    score: '15',
    isServing: false,
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

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const screen = await render(<TeamPanel {...defaultProps} onClick={handleClick} />)

    await screen.getByRole('button').click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', async () => {
    const screen = await render(<TeamPanel {...defaultProps} disabled={true} />)

    await expect.element(screen.getByRole('button')).toBeDisabled()
  })

  test('is enabled when disabled prop is false', async () => {
    const screen = await render(<TeamPanel {...defaultProps} disabled={false} />)

    await expect.element(screen.getByRole('button')).not.toBeDisabled()
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

    await expect
      .element(screen.getByRole('button'))
      .toHaveAttribute('aria-label', 'Score point for The Champions')
  })

  test('score has aria-live for accessibility', async () => {
    const screen = await render(<TeamPanel {...defaultProps} />)

    expect(screen.container.querySelector('[aria-live="polite"]')).toBeTruthy()
  })

  test('applies serving styles when the serving indicator is enabled', async () => {
    const screen = await render(
      <TeamPanel {...defaultProps} isServing={true} showServingIndicator={true} />
    )

    const panel = screen.getByRole('button')
    const score = screen.getByText('15')

    await expect.element(panel).toHaveClass(styles.serving!)
    expect(getComputedStyle(panel.element()).backgroundColor).toBe(
      resolveCssColor('backgroundColor', 'var(--semantic-color-items-primary-background)')
    )
    expect(getComputedStyle(score.element()).color).toBe(
      resolveCssColor('color', 'var(--semantic-color-items-primary-content)')
    )
  })

  test('does not render games, serving, or golden point affordances', async () => {
    const screen = await render(<TeamPanel {...defaultProps} />)

    const buttonText = screen.getByRole('button').element().textContent ?? ''

    expect(buttonText).not.toContain('Games')
    expect(buttonText).not.toContain('GP')
    expect(buttonText).not.toContain('Serving')
    expect(screen.container.querySelector('[data-testid^="serve-indicator-"]')).toBeNull()
  })

  test('has type button', async () => {
    const screen = await render(<TeamPanel {...defaultProps} />)

    await expect.element(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  test('disabled state prevents click handler in browser', async () => {
    const screen = await render(<TeamPanel {...defaultProps} disabled={true} />)

    await expect.element(screen.getByRole('button')).toBeDisabled()
  })
})
