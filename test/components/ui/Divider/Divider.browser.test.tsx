import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Divider } from '@/components/ui/Divider/Divider'

describe('Divider', () => {
  test('renders with separator role', async () => {
    const screen = await render(<Divider />)

    await expect.element(screen.getByRole('separator')).toBeInTheDocument()
  })

  test('renders without custom className', async () => {
    const screen = await render(<Divider />)

    const divider = screen.getByRole('separator')
    await expect.element(divider).toBeInTheDocument()
  })

  test('renders with custom className', async () => {
    const screen = await render(<Divider className="custom-divider" />)

    const divider = screen.getByRole('separator')
    await expect.element(divider).toHaveClass('custom-divider')
  })

  test('applies both base and custom className', async () => {
    const screen = await render(<Divider className="my-extra-class" />)

    const divider = screen.getByRole('separator')
    await expect.element(divider).toHaveClass('my-extra-class')
  })
})
