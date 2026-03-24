import { Toast as BaseToast } from '@base-ui/react/toast'
import { useCallback } from 'react'

import styles from './ToastViewport.module.css'

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

function ToastViewportInner() {
  const { toasts } = BaseToast.useToastManager()

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className={styles.viewport}>
        {toasts.map((toast) => (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={styles.toast}
            data-type={toast.data?.type}
          >
            <BaseToast.Content className={styles.content}>
              <BaseToast.Title className={styles.title}>{toast.title}</BaseToast.Title>
              {toast.description ? (
                <BaseToast.Description className={styles.description}>
                  {toast.description}
                </BaseToast.Description>
              ) : null}
              <BaseToast.Close className={styles.close} aria-label="Close">
                ✕
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseToast.Provider toastManager={globalToastManager}>
      {children}
      <ToastViewportInner />
    </BaseToast.Provider>
  )
}
