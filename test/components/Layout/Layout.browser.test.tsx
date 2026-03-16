import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Layout } from '@/components/Layout/Layout'

describe('Layout', () => {
  test('renders header, children, and footer slots correctly', async () => {
    const screen = await render(
      <Layout header={<span>Header Content</span>} footer={<span>Footer Content</span>}>
        <span>Main Content</span>
      </Layout>
    )

    await expect.element(screen.getByText('Header Content')).toBeInTheDocument()
    await expect.element(screen.getByText('Main Content')).toBeInTheDocument()
    await expect.element(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  test('does not render header when omitted', async () => {
    const screen = await render(
      <Layout footer={<span>Footer Content</span>}>
        <span>Main Content</span>
      </Layout>
    )

    // Header element should not exist
    const headers = screen.container.querySelectorAll('header')
    expect(headers.length).toBe(0)
  })

  test('does not render footer when omitted', async () => {
    const screen = await render(
      <Layout header={<span>Header Content</span>}>
        <span>Main Content</span>
      </Layout>
    )

    // Footer element should not exist
    const footers = screen.container.querySelectorAll('footer')
    expect(footers.length).toBe(0)
  })

  test('applies className prop correctly', async () => {
    const screen = await render(
      <Layout className="custom-layout-class">
        <span>Main Content</span>
      </Layout>
    )

    const main = screen.getByRole('main')
    await expect.element(main).toHaveClass('custom-layout-class')
  })

  test('applies bodyClassName prop correctly', async () => {
    const screen = await render(
      <Layout bodyClassName="custom-body-class">
        <span>Main Content</span>
      </Layout>
    )

    const body = screen.container.querySelector('[class*="body"]') as HTMLElement
    await expect.element(body).toHaveClass('custom-body-class')
  })

  test('uses semantic HTML elements (main, header, footer)', async () => {
    const screen = await render(
      <Layout header={<span>Header</span>} footer={<span>Footer</span>}>
        <span>Main</span>
      </Layout>
    )

    // Main element exists with implicit role
    const main = screen.getByRole('main')
    await expect.element(main).toBeInTheDocument()

    // Header element exists
    const header = screen.container.querySelector('header')
    expect(header).toBeTruthy()

    // Footer element exists
    const footer = screen.container.querySelector('footer')
    expect(footer).toBeTruthy()
  })
})
