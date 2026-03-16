import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Card, type CardAccent } from '@/components/ui/Card/Card'

describe('Card', () => {
  test('renders children correctly', async () => {
    const screen = await render(
      <Card>
        <span>Test Content</span>
      </Card>
    )

    await expect.element(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders with default (no accent)', async () => {
    const screen = await render(
      <Card>
        <span>Default Card</span>
      </Card>
    )

    await expect.element(screen.getByText('Default Card')).toBeInTheDocument()
  })

  test('renders with primary accent', async () => {
    const screen = await render(
      <Card accent="primary">
        <span>Primary Card</span>
      </Card>
    )

    await expect.element(screen.getByText('Primary Card')).toBeInTheDocument()
  })

  test('renders with secondary accent', async () => {
    const screen = await render(
      <Card accent="secondary">
        <span>Secondary Card</span>
      </Card>
    )

    await expect.element(screen.getByText('Secondary Card')).toBeInTheDocument()
  })

  test('applies custom className', async () => {
    const screen = await render(
      <Card className="custom-class">
        <span>Custom Card</span>
      </Card>
    )

    // Find the card container by traversing from the content
    const card = screen.container.querySelector('.custom-class')
    expect(card).toBeTruthy()
  })

  test('applies both accent and custom className', async () => {
    const screen = await render(
      <Card accent="primary" className="extra-class">
        <span>Combined Card</span>
      </Card>
    )

    const card = screen.container.querySelector('.extra-class')
    expect(card).toBeTruthy()
  })

  // Test all accent branches
  const accents: CardAccent[] = ['primary', 'secondary']
  accents.forEach((accent) => {
    test(`renders correctly with accent: ${accent}`, async () => {
      const screen = await render(
        <Card accent={accent}>
          <span>{accent} Card</span>
        </Card>
      )

      await expect.element(screen.getByText(`${accent} Card`)).toBeInTheDocument()
    })
  })
})
