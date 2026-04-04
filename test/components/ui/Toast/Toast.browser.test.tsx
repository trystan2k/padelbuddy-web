/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable jsx-no-new-array-as-prop -- Test files use inline arrays for readable */

import { afterEach, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from 'vitest-browser-react'

import { ToastProvider, globalToastManager, useToast } from '@/components/ui/Toast/useToast'

async function cleanupToasts() {
  globalToastManager.close()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await cleanup()
}

describe('ToastProvider', () => {
  afterEach(() => cleanupToasts())

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

function ToastTrigger({
  title,
  type,
  timeout
}: {
  title: string
  type?: 'error' | 'success' | 'info'
  timeout?: number
}) {
  const { addToast, addErrorToast, addSuccessToast, addInfoToast } = useToast()

  const handleClick = () => {
    if (type === 'error') {
      addErrorToast(title, { timeout: timeout ?? 5000 })
    } else if (type === 'success') {
      addSuccessToast(title, { timeout: timeout ?? 4000 })
    } else if (type === 'info') {
      addInfoToast(title, { timeout: timeout ?? 4000 })
    } else {
      addToast(title, { timeout: timeout ?? 5000 })
    }
  }

  return (
    <div>
      <button type="button" data-testid="trigger-toast" onClick={handleClick}>
        Trigger
      </button>
    </div>
  )
}

describe('ToastViewport', () => {
  afterEach(() => cleanupToasts())

  test('renders a toast with title when triggered', async () => {
    const screen = await render(
      <ToastProvider>
        <ToastTrigger title="Test toast" />
      </ToastProvider>
    )

    await screen.getByTestId('trigger-toast').click()

    await expect.element(screen.getByText('Test toast')).toBeInTheDocument()
  })

  test('renders a success toast', async () => {
    const screen = await render(
      <ToastProvider>
        <ToastTrigger title="Saved successfully" type="success" />
      </ToastProvider>
    )

    await screen.getByTestId('trigger-toast').click()

    await expect.element(screen.getByText('Saved successfully')).toBeInTheDocument()
  })

  test('renders an error toast', async () => {
    const screen = await render(
      <ToastProvider>
        <ToastTrigger title="Error occurred" type="error" />
      </ToastProvider>
    )

    await screen.getByTestId('trigger-toast').click()

    await expect.element(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  test('renders an info toast', async () => {
    const screen = await render(
      <ToastProvider>
        <ToastTrigger title="Information" type="info" />
      </ToastProvider>
    )

    await screen.getByTestId('trigger-toast').click()

    await expect.element(screen.getByText('Information')).toBeInTheDocument()
  })

  test('renders multiple toasts simultaneously', async () => {
    function MultiToastTrigger() {
      const { addToast } = useToast()

      return (
        <button
          type="button"
          data-testid="trigger-toast"
          onClick={() => {
            addToast('First toast', { timeout: 30000 })
            addToast('Second toast', { timeout: 30000 })
          }}
        >
          Trigger
        </button>
      )
    }

    const screen = await render(
      <ToastProvider>
        <MultiToastTrigger />
      </ToastProvider>
    )

    await screen.getByTestId('trigger-toast').click()

    await expect.element(screen.getByText('First toast')).toBeInTheDocument()
    await expect.element(screen.getByText('Second toast')).toBeInTheDocument()
  })

  test('renders close button on each toast', async () => {
    const screen = await render(
      <ToastProvider>
        <ToastTrigger title="Closeable toast" />
      </ToastProvider>
    )

    await screen.getByTestId('trigger-toast').click()

    await expect.element(screen.getByText('Closeable toast')).toBeInTheDocument()
    // Close buttons are rendered in a Portal; use document-level query
    const closeButtons = await vi.waitFor(
      () => {
        const buttons = document.querySelectorAll('[aria-label="Close"]')
        if (buttons.length === 0) throw new Error('Close buttons not found yet')
        return buttons
      },
      { timeout: 5000 }
    )
    expect(closeButtons.length).toBeGreaterThanOrEqual(1)
  })
})
