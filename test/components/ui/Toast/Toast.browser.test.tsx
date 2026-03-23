/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for readable */

import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { ToastProvider } from '@/components/ui/Toast'

describe('ToastProvider', () => {
  test('renders children correctly', async () => {
    const screen = await render(
      <ToastProvider>
        <div data-testid="toast-child">Toast Child Content</div>
      </ToastProvider>
    )

    await expect.element(screen.getByTestId('toast-child')).toBeInTheDocument()
    await expect.element(screen.getByTestId('toast-child')).toHaveTextContent('Toast Child Content')
  })
})
