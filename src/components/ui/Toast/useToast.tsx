import { Toast as BaseToast } from '@base-ui/react/toast'
import { useCallback, type ReactNode } from 'react'

import { ToastViewport } from './ToastViewport'

export type ToastType = 'error' | 'success' | 'info'

// Global singleton toast manager — exported for use in components that need to subscribe
export const globalToastManager = BaseToast.createToastManager()

const isBrowser = typeof window !== 'undefined'

interface UseToastOptions {
  type?: ToastType
  /** Duration in ms before auto-dismiss. Default 5000. Use 0 for persistent. */
  timeout?: number
}

interface UseToastReturn {
  toastManager: ReturnType<typeof BaseToast.createToastManager>
  addToast: (title: string, options?: UseToastOptions) => void
  addErrorToast: (title: string, options?: Omit<UseToastOptions, 'type'>) => void
  addSuccessToast: (title: string, options?: Omit<UseToastOptions, 'type'>) => void
  addInfoToast: (title: string, options?: Omit<UseToastOptions, 'type'>) => void
}

export function useToast(): UseToastReturn {
  const addToast = useCallback((title: string, { type, timeout = 5000 }: UseToastOptions = {}) => {
    if (!isBrowser) return
    globalToastManager.add({
      title,
      timeout,
      data: type ? { type } : undefined
    })
  }, [])

  const addErrorToast = useCallback(
    (title: string, { timeout = 5000 }: Omit<UseToastOptions, 'type'> = {}) => {
      addToast(title, { type: 'error', timeout })
    },
    [addToast]
  )

  const addSuccessToast = useCallback(
    (title: string, { timeout = 4000 }: Omit<UseToastOptions, 'type'> = {}) => {
      addToast(title, { type: 'success', timeout })
    },
    [addToast]
  )

  const addInfoToast = useCallback(
    (title: string, { timeout = 4000 }: Omit<UseToastOptions, 'type'> = {}) => {
      addToast(title, { type: 'info', timeout })
    },
    [addToast]
  )

  return {
    toastManager: globalToastManager,
    addToast,
    addErrorToast,
    addSuccessToast,
    addInfoToast
  }
}

// ToastList must be called inside a ToastProvider — uses context-based manager
export function useToastManager() {
  return BaseToast.useToastManager()
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider toastManager={globalToastManager}>
      {children}
      <BaseToast.Portal>
        <ToastViewport />
      </BaseToast.Portal>
    </BaseToast.Provider>
  )
}
