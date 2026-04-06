import { Dialog } from '@base-ui/react/dialog';
import { useCallback, useRef, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './RotateDeviceBlocker.module.css';

type DialogBackdropRenderProps = Parameters<
  Extract<ComponentProps<typeof Dialog.Backdrop>['render'], (...args: never[]) => unknown>
>[0];
type DialogPopupRenderProps = Parameters<
  Extract<ComponentProps<typeof Dialog.Popup>['render'], (...args: never[]) => unknown>
>[0];
type DialogTitleRenderProps = Parameters<
  Extract<ComponentProps<typeof Dialog.Title>['render'], (...args: never[]) => unknown>
>[0];
type DialogDescriptionRenderProps = Parameters<
  Extract<ComponentProps<typeof Dialog.Description>['render'], (...args: never[]) => unknown>
>[0];

export function RotateDeviceBlocker() {
  const { t } = useTranslation();
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const title = t('match.rotateDevice.title');
  const description = t('match.rotateDevice.description');

  const renderBackdrop = useCallback(
    (props: DialogBackdropRenderProps) => <div {...props} className={styles.overlay} />,
    []
  );

  const renderTitle = useCallback(
    (props: DialogTitleRenderProps) => (
      <h2 {...props} className={styles.title}>
        {title}
      </h2>
    ),
    [title]
  );

  const renderDescription = useCallback(
    (props: DialogDescriptionRenderProps) => (
      <p {...props} className={styles.description}>
        {description}
      </p>
    ),
    [description]
  );

  const renderPopup = useCallback(
    (props: DialogPopupRenderProps) => (
      <div {...props} className={styles.container} data-testid="rotate-device-blocker">
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            className={styles.icon}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <path
              d="M23 10C23 7.79086 24.7909 6 27 6H45C47.2091 6 49 7.79086 49 10V38C49 40.2091 47.2091 42 45 42H27C24.7909 42 23 40.2091 23 38V10Z"
              className={styles.phone}
            />
            <rect x="28" y="11" width="16" height="25" rx="2" className={styles.screen} />
            <circle cx="36" cy="39" r="1.75" className={styles.button} />
            <path
              d="M17.856 44.144C13.9525 40.2404 12 35.1275 12 30.0146C12 24.9017 13.9525 19.7888 17.856 15.8853L20.6844 18.7137C17.5317 21.8664 15.9553 25.9405 15.9553 30.0146C15.9553 34.0887 17.5317 38.1629 20.6844 41.3156L24 38V50H12L17.856 44.144Z"
              className={styles.arrow}
            />
          </svg>
        </div>

        <div className={styles.content}>
          <Dialog.Title render={renderTitle} />
          <Dialog.Description render={renderDescription} />
        </div>
      </div>
    ),
    [renderDescription, renderTitle]
  );

  return (
    <>
      <div ref={portalContainerRef} />
      <Dialog.Root open={true}>
        <Dialog.Portal container={portalContainerRef}>
          <Dialog.Backdrop render={renderBackdrop} />
          <Dialog.Popup render={renderPopup} />
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
