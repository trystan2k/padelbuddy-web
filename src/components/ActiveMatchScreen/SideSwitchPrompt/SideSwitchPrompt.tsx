import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@base-ui/react/dialog';

import { Button } from '@/components/ui/Button/Button';

import styles from './SideSwitchPrompt.module.css';

export interface SideSwitchPromptProps {
  isOpen: boolean;
  reason: 'odd-games' | 'tiebreak-interval' | null;
  onClose: () => void;
  /** Delay in milliseconds before auto-closing. Set to 0 to disable auto-close. */
  autoCloseDelay?: number;
}

/**
 * SideSwitchPrompt component - Modal that prompts players to switch sides.
 * Uses Base UI Dialog for accessibility with focus trap and keyboard handling.
 * Auto-closes after a configurable delay (default 10 seconds).
 */
export function SideSwitchPrompt({
  isOpen,
  reason,
  onClose,
  autoCloseDelay = 10000
}: SideSwitchPromptProps) {
  const { t } = useTranslation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  const handleBackdropRender = useCallback(
    (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} data-testid="side-switch-backdrop" className={styles.overlay} />
    ),
    []
  );

  const title =
    reason === 'odd-games'
      ? t('match.sideSwitch.oddGames')
      : t('match.sideSwitch.tiebreakInterval');

  const handleTitleRender = useCallback(
    (titleProps: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...titleProps} id="side-switch-title" className={styles.title}>
        {title}
      </h2>
    ),
    [title]
  );

  const handleDescriptionRender = useCallback(
    (descProps: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...descProps} className={styles.description}>
        {t('match.sideSwitch.description')}
      </p>
    ),
    [t]
  );

  const handlePopupRender = useCallback(
    (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div
        {...props}
        className={styles.container}
        data-testid="side-switch-prompt"
        aria-modal="true"
      >
        <Dialog.Title render={handleTitleRender} />

        <Dialog.Description render={handleDescriptionRender} />

        <Button
          variant="solid"
          size="sm"
          accent="success"
          onClick={onClose}
          className={styles.confirmButton}
        >
          {t('match.sideSwitch.confirm')}
        </Button>
      </div>
    ),
    [handleTitleRender, handleDescriptionRender, onClose, t]
  );

  // Auto-close timer
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen, autoCloseDelay, onClose]);

  if (!reason || !isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop render={handleBackdropRender} />
        <Dialog.Popup render={handlePopupRender} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
