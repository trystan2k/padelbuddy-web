import { Toast as BaseToast } from '@base-ui/react/toast';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { ToastAction, ToastData } from './useToast';

import styles from './ToastViewport.module.css';

function isToastData(data: unknown): data is ToastData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const candidate: { type?: unknown; action?: unknown } = data;

  if (
    candidate.type !== undefined &&
    candidate.type !== 'error' &&
    candidate.type !== 'success' &&
    candidate.type !== 'info'
  ) {
    return false;
  }

  if (candidate.action === undefined) {
    return true;
  }

  if (typeof candidate.action !== 'object' || candidate.action === null) {
    return false;
  }

  const actionCandidate: { label?: unknown; onClick?: unknown } = candidate.action;

  return typeof actionCandidate.label === 'string' && typeof actionCandidate.onClick === 'function';
}

function ToastActionButton({ action }: { action: ToastAction }) {
  const handleClick = useCallback(() => {
    void action.onClick();
  }, [action]);

  return (
    <button type="button" className={styles.action} onClick={handleClick}>
      {action.label}
    </button>
  );
}

// ToastViewport — renders Toast.Viewport inside ToastProvider.
// Uses BaseToast.useToastManager() which must be called within a Toast.Provider.
export function ToastViewport() {
  const { t } = useTranslation();
  const { toasts } = BaseToast.useToastManager();

  return (
    <BaseToast.Viewport className={styles.viewport}>
      {toasts.map((toast) => {
        const toastData = isToastData(toast.data) ? toast.data : undefined;

        return (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={styles.toast}
            data-type={toastData?.type}
          >
            <BaseToast.Content className={styles.content}>
              <div className={styles.message}>
                <BaseToast.Title className={styles.title}>{toast.title}</BaseToast.Title>
                {toastData?.action ? <ToastActionButton action={toastData.action} /> : null}
              </div>
              {toast.description ? (
                <BaseToast.Description className={styles.description}>
                  {toast.description}
                </BaseToast.Description>
              ) : null}
              <BaseToast.Close className={styles.close} aria-label={t('common.close')}>
                ✕
              </BaseToast.Close>
            </BaseToast.Content>
          </BaseToast.Root>
        );
      })}
    </BaseToast.Viewport>
  );
}
