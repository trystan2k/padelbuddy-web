import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { AppShell } from '@/components/AppShell/AppShell'

describe('AppShell browser', () => {
  test('renders the foundation shell in browser mode', async () => {
    const screen = await render(<AppShell />)
    const foundationStatus = screen.getByRole('list', { name: 'Foundation status' })
    const openDialogButton = screen.getByRole('button', { name: 'Open Base UI check' })

    await expect.element(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Padel Buddy')
    await expect.element(openDialogButton).toBeVisible()
    await expect.element(screen.getByText('Bootstrap status')).toBeVisible()
    await expect.element(foundationStatus.getByText('Client-only', { exact: true })).toBeVisible()
    await openDialogButton.click()
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'Base UI is wired' }))
      .toBeVisible()
    await expect.element(screen.getByText('Close panel')).toBeVisible()
  })
})
