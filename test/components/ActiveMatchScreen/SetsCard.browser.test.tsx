/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-object-as-prop -- Test files use inline objects for test data */

import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { SetsCard } from '@/components/ActiveMatchScreen/SetsCard/SetsCard'
import { createTestSetup, winQuickSet } from '../../core/match/test-helpers'
import { projectMatch } from '@/core/match'

describe('SetsCard', () => {
  test('renders with label', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />)

    await expect.element(screen.getByText('Sets')).toBeInTheDocument()
  })

  test('renders first set correctly', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />)

    // First set should show 0-0
    await expect.element(screen.getByTestId('set-row-0')).toBeInTheDocument()
    await expect.element(screen.getByTestId('set-row-0')).toHaveTextContent('1')
    await expect.element(screen.getByTestId('set-row-0')).toHaveTextContent('0-0')
  })

  test('shows current set indicator', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />)

    // Current set should have the indicator
    const currentIndicator = screen.container.querySelector('[aria-label="Current set"]')
    expect(currentIndicator).toBeTruthy()
  })

  test('shows completed set with winner indicator', async () => {
    const setup = createTestSetup()
    const actions = winQuickSet('team-1')
    const projection = projectMatch(setup, actions)
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={1} />)

    // First set should be completed with winner indicator
    const firstSetRow = screen.getByTestId('set-row-0')
    await expect.element(firstSetRow).toBeInTheDocument()

    const winnerIndicator = screen.container.querySelector('[aria-label="Set winner"]')
    expect(winnerIndicator).toBeTruthy()
  })

  test('shows games for both teams', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />)

    const setRow = screen.getByTestId('set-row-0')
    await expect.element(setRow).toHaveTextContent('0-0')
  })

  test('has test id', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />)

    await expect.element(screen.getByTestId('sets-card')).toBeInTheDocument()
  })

  test('handles null currentSetIndex', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={null} />)

    // Should still render sets
    await expect.element(screen.getByTestId('sets-card')).toBeInTheDocument()
  })

  test('displays set numbers correctly', async () => {
    const setup = createTestSetup()
    const projection = projectMatch(setup, [])
    const sets = projection.state.sets

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />)

    // Set numbers should be 1-indexed
    // aria-current is on the setRow, find the set number inside it using test id
    const currentRow = screen.container.querySelector('[aria-current="true"]')
    const setNumberTestId = currentRow
      ?.getAttribute('data-testid')
      ?.replace('set-row-', 'set-number-')
    const setNumber = setNumberTestId ? screen.getByTestId(setNumberTestId) : null
    await expect.element(setNumber).toHaveTextContent('1')
  })
})
