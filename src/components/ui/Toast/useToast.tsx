import { Toast as BaseToast } from '@base-ui/react/toast';
import { useCallback, type ReactNode } from 'react';

import { ToastViewport } from './ToastViewport';

type ToastType = 'error' | 'success' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
}

export interface ToastData {
  type?: ToastType;
  action?: ToastAction;
}

// Global singleton toast manager — exported for use in components that need to subscribe
export const globalToastManager = BaseToast.createToastManager();

const isBrowser = typeof window !== 'undefined';

interface UseToastOptions {
  type?: ToastType;
  /** Duration in ms before auto-dismiss. Default 5000. Use 0 for persistent. */
  timeout?: number;
  action?: ToastAction;
}

interface UseToastReturn {
  toastManager: ReturnType<typeof BaseToast.createToastManager>;
  addToast: (title: string, options?: UseToastOptions) => void;
  addErrorToast: (title: string, options?: Omit<UseToastOptions, 'type'>) => void;
  addSuccessToast: (title: string, options?: Omit<UseToastOptions, 'type'>) => void;
  addInfoToast: (title: string, options?: Omit<UseToastOptions, 'type'>) => void;
}

export function useToast(): UseToastReturn {
  const addToast = useCallback(
    (title: string, { type, timeout = 5000, action }: UseToastOptions = {}) => {
      if (!isBrowser) return;

      const toastData: ToastData = {
        ...(type ? { type } : {}),
        ...(action ? { action } : {})
      };

      globalToastManager.add({
        title,
        timeout,
        data: Object.keys(toastData).length > 0 ? toastData : undefined
      });
    },
    []
  );

  const addErrorToast = useCallback(
    (title: string, options: Omit<UseToastOptions, 'type'> = {}) => {
      addToast(title, {
        type: 'error',
        timeout: options.timeout ?? 5000,
        ...(options.action ? { action: options.action } : {})
      });
    },
    [addToast]
  );

  const addSuccessToast = useCallback(
    (title: string, options: Omit<UseToastOptions, 'type'> = {}) => {
      addToast(title, {
        type: 'success',
        timeout: options.timeout ?? 4000,
        ...(options.action ? { action: options.action } : {})
      });
    },
    [addToast]
  );

  const addInfoToast = useCallback(
    (title: string, options: Omit<UseToastOptions, 'type'> = {}) => {
      addToast(title, {
        type: 'info',
        timeout: options.timeout ?? 4000,
        ...(options.action ? { action: options.action } : {})
      });
    },
    [addToast]
  );

  return {
    toastManager: globalToastManager,
    addToast,
    addErrorToast,
    addSuccessToast,
    addInfoToast
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider toastManager={globalToastManager}>
      {children}
      <BaseToast.Portal>
        <ToastViewport />
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}
