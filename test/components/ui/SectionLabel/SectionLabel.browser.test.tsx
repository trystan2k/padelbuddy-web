import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { SectionLabel, type SectionLabelVariant } from '@/components/ui/SectionLabel/SectionLabel'

describe('SectionLabel', () => {
  test('renders children correctly', async () => {
    const screen = await render(<SectionLabel>Section Title</SectionLabel>)

    await expect.element(screen.getByText('Section Title')).toBeInTheDocument()
  })

  test('renders as paragraph element', async () => {
    const screen = await render(<SectionLabel>Label</SectionLabel>)

    const paragraph = screen.getByText('Label').element()
    expect(paragraph?.tagName.toLowerCase()).toBe('p')
  })

  test('renders with custom className', async () => {
    const screen = await render(<SectionLabel className="custom-class">Label</SectionLabel>)

    const paragraph = screen.getByText('Label')
    await expect.element(paragraph).toHaveClass('custom-class')
  })

  test('renders with default variant', async () => {
    const screen = await render(<SectionLabel>Default Label</SectionLabel>)

    await expect.element(screen.getByText('Default Label')).toBeInTheDocument()
  })

  // Test all variants for branch coverage
  const variants: SectionLabelVariant[] = ['default', 'team-one', 'team-two']
  variants.forEach((variant) => {
    test(`renders correctly with variant: ${variant}`, async () => {
      const screen = await render(<SectionLabel variant={variant}>{variant} Label</SectionLabel>)

      await expect.element(screen.getByText(`${variant} Label`)).toBeInTheDocument()
    })
  })

  test('applies both variant and custom className', async () => {
    const screen = await render(
      <SectionLabel variant="team-one" className="extra">
        Combined
      </SectionLabel>
    )

    const paragraph = screen.getByText('Combined')
    await expect.element(paragraph).toHaveClass('extra')
  })
})
