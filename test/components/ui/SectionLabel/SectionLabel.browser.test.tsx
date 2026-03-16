import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { SectionLabel, type SectionLabelAccent } from '@/components/ui/SectionLabel/SectionLabel'

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

  test('renders with default (no accent)', async () => {
    const screen = await render(<SectionLabel>Default Label</SectionLabel>)

    await expect.element(screen.getByText('Default Label')).toBeInTheDocument()
  })

  // Test all accents for branch coverage
  const accents: SectionLabelAccent[] = ['primary', 'secondary']
  accents.forEach((accent) => {
    test(`renders correctly with accent: ${accent}`, async () => {
      const screen = await render(<SectionLabel accent={accent}>{accent} Label</SectionLabel>)

      await expect.element(screen.getByText(`${accent} Label`)).toBeInTheDocument()
    })
  })

  test('applies both accent and custom className', async () => {
    const screen = await render(
      <SectionLabel accent="primary" className="extra">
        Combined
      </SectionLabel>
    )

    const paragraph = screen.getByText('Combined')
    await expect.element(paragraph).toHaveClass('extra')
  })
})
