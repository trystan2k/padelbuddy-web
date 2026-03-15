/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */

import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Toggle } from '@/components/ui/Toggle/Toggle'

describe('Toggle', () => {
  test('renders with label', async () => {
    const screen = await render(
      <Toggle checked={false} onChange={() => {}} label="Enable Feature" />
    )

    await expect.element(screen.getByText('Enable Feature')).toBeInTheDocument()
  })

  test('renders with hint', async () => {
    const screen = await render(
      <Toggle
        checked={false}
        onChange={() => {}}
        label="Enable Feature"
        hint="This will enable the feature"
      />
    )

    await expect.element(screen.getByText('This will enable the feature')).toBeInTheDocument()
  })

  test('renders without hint', async () => {
    const screen = await render(
      <Toggle checked={false} onChange={() => {}} label="Enable Feature" />
    )

    const hint = screen.container.querySelector('[class*="hint"]')
    expect(hint).toBeNull()
  })

  test('renders checked state', async () => {
    const screen = await render(
      <Toggle checked={true} onChange={() => {}} label="Checked Toggle" />
    )

    const switchElement = screen.getByRole('switch')
    await expect.element(switchElement).toHaveAttribute('aria-checked', 'true')
  })

  test('renders unchecked state', async () => {
    const screen = await render(
      <Toggle checked={false} onChange={() => {}} label="Unchecked Toggle" />
    )

    const switchElement = screen.getByRole('switch')
    await expect.element(switchElement).toHaveAttribute('aria-checked', 'false')
  })

  test('renders disabled state', async () => {
    const screen = await render(
      <Toggle checked={false} onChange={() => {}} label="Disabled Toggle" disabled />
    )

    const switchElement = screen.getByRole('switch')
    await expect.element(switchElement).toBeDisabled()
  })

  test('renders enabled by default', async () => {
    const screen = await render(
      <Toggle checked={false} onChange={() => {}} label="Enabled Toggle" />
    )

    const switchElement = screen.getByRole('switch')
    await expect.element(switchElement).not.toBeDisabled()
  })

  test('renders with custom className', async () => {
    const screen = await render(
      <Toggle checked={false} onChange={() => {}} label="Custom Toggle" className="custom-class" />
    )

    const container = screen.container.querySelector('.custom-class')
    expect(container).toBeTruthy()
  })
})
