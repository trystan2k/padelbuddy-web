import { Toast as BaseToast } from '@base-ui/react/toast'

import styles from './ToastViewport.module.css'

// ToastViewport — renders Toast.Viewport inside ToastProvider.
// Uses BaseToast.useToastManager() which must be called within a Toast.Provider.
export function ToastViewport() {
  const { toasts } = BaseToast.useToastManager()

  return (
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
  )
}
