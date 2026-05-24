import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type HTMLAttributes
} from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useTranslation } from 'react-i18next';

import type { MatchSetState } from '@/core/match/types';

import { getSetDisplayScore, getSetsWonScore } from '../sets-history';

import styles from './SetsHistoryModal.module.css';

interface SetsHistoryModalProps {
  isOpen: boolean;
  openToken: number;
  sets: MatchSetState[];
  onClose: () => void;
  autoCloseDelay?: number;
}

type DialogBackdropRenderProps = Parameters<
  Extract<ComponentProps<typeof Dialog.Backdrop>['render'], (...args: never[]) => unknown>
>[0];
type DialogPopupRenderProps = Parameters<
  Extract<ComponentProps<typeof Dialog.Popup>['render'], (...args: never[]) => unknown>
>[0];

export function SetsHistoryModal({
  isOpen,
  openToken,
  sets,
  onClose,
  autoCloseDelay = 30000
}: SetsHistoryModalProps) {
  const { t } = useTranslation();
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const setsWonScore = getSetsWonScore(sets);
  const title = t('match.sets.currentSetScoreHeadline', {
    team1: setsWonScore['team-1'],
    team2: setsWonScore['team-2']
  });

  const handleTitleRender = useCallback(
    (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...props} className={styles.title}>
        {title}
      </h2>
    ),
    [title]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  const setRows = useMemo(
    () =>
      sets
        .filter((set) => set.completed)
        .map((set) => {
          const setScore = getSetDisplayScore(set);

          return {
            setNumber: set.index,
            team1: setScore['team-1'],
            team2: setScore['team-2']
          };
        }),
    [sets]
  );

  const handleBackdropRender = useCallback(
    (props: DialogBackdropRenderProps) => (
      <div {...props} className={styles.overlay} data-testid="sets-history-modal-backdrop" />
    ),
    []
  );

  const handlePopupRender = useCallback(
    (props: DialogPopupRenderProps) => (
      <div {...props} className={styles.container} data-testid="sets-history-modal">
        <header className={styles.header}>
          <Dialog.Title render={handleTitleRender} />
          <Dialog.Close
            className={styles.closeButton}
            aria-label={t('common.close')}
            data-testid="sets-history-modal-close"
          >
            <span aria-hidden="true">×</span>
          </Dialog.Close>
        </header>

        {setRows.length > 0 ? (
          <ul className={styles.list} data-testid="sets-history-modal-list">
            {setRows.map((row) => (
              <li key={row.setNumber} className={styles.row}>
                <span className={styles.setLabel}>
                  {t('match.sets.setLabel', { number: row.setNumber })}
                </span>
                <span className={styles.score}>{`${row.team1} - ${row.team2}`}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState} data-testid="sets-history-modal-empty-state">
            {t('match.sets.emptyHistory')}
          </p>
        )}
      </div>
    ),
    [handleTitleRender, setRows, t]
  );

  useEffect(() => {
    if (!isOpen || autoCloseDelay <= 0) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoCloseDelay, isOpen, onClose, openToken]);

  return (
    <>
      <div ref={portalContainerRef} />
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal container={portalContainerRef}>
          <Dialog.Backdrop render={handleBackdropRender} />
          <Dialog.Popup render={handlePopupRender} />
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
