import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Card, type CardVariant } from '@/components/ui/Card/Card'

describe('Card', () => {
  test('renders children correctly', async () => {
    const screen = await render(
      <Card>
        <span>Test Content</span>
      </Card>
    )

    await expect.element(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders with default variant', async () => {
    const screen = await render(
      <Card>
        <span>Default Card</span>
      </Card>
    )

    await expect.element(screen.getByText('Default Card')).toBeInTheDocument()
  })

  test('renders with team-one variant', async () => {
    const screen = await render(
      <Card variant="team-one">
        <span>Team One Card</span>
      </Card>
    )

    await expect.element(screen.getByText('Team One Card')).toBeInTheDocument()
  })

  test('renders with team-two variant', async () => {
    const screen = await render(
      <Card variant="team-two">
        <span>Team Two Card</span>
      </Card>
    )

    await expect.element(screen.getByText('Team Two Card')).toBeInTheDocument()
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

  test('applies both variant and custom className', async () => {
    const screen = await render(
      <Card variant="team-one" className="extra-class">
        <span>Combined Card</span>
      </Card>
    )

    const card = screen.container.querySelector('.extra-class')
    expect(card).toBeTruthy()
  })

  // Test all variant branches
  const variants: CardVariant[] = ['default', 'team-one', 'team-two']
  variants.forEach((variant) => {
    test(`renders correctly with variant: ${variant}`, async () => {
      const screen = await render(
        <Card variant={variant}>
          <span>{variant} Card</span>
        </Card>
      )

      await expect.element(screen.getByText(`${variant} Card`)).toBeInTheDocument()
    })
  })
})
