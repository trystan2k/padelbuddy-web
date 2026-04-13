import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/useToast';
import { Volume2Icon, Volume1Icon, SkipForwardIcon, SkipBackIcon } from '@/components/ui/Icons';
import {
  assignRemoteControllerBinding,
  createEmptyRemoteControllerBindings,
  createRemoteControllerBindings,
  getKeyboardBindingDisplayLabel,
  type ConfigurableKeyboardAction
} from '@/lib/input/keyboard-aliases';
import {
  loadRemoteControllerConfigWithFallback,
  saveRemoteControllerConfig,
  type RemoteControllerConfig
} from '@/lib/input/remote-controller-storage';
import { getMediaButtonDisplayInfo, type MediaButtonIconName } from '@/lib/input/media-buttons';
import { cn } from '@/lib/utils/cn';

import styles from './RemoteConfigurationModal.module.css';

const ignoredCaptureKeys = new Set(['Alt', 'Control', 'Meta', 'Shift']);

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

interface UnifiedRowProps {
  label: string;
  hint: string;
  binding?: string | null;
  isListening: boolean;
  onCapture: (action: ConfigurableKeyboardAction) => void;
  action: ConfigurableKeyboardAction;
  mediaBadgeLabel: string;
  mediaIconName: MediaButtonIconName;
  mediaButtonLabel: string;
  disabled: boolean;
}

const iconMap: Record<MediaButtonIconName, React.FC<{ size?: number; className?: string }>> = {
  'volume-up': Volume2Icon,
  'volume-down': Volume1Icon,
  'skip-forward': SkipForwardIcon,
  'skip-back': SkipBackIcon
};

const UnifiedRow = ({
  label,
  hint,
  binding,
  isListening,
  onCapture,
  action,
  mediaBadgeLabel,
  mediaIconName,
  mediaButtonLabel,
  disabled
}: UnifiedRowProps) => {
  const { t } = useTranslation();

  const handleCapture = useCallback(() => {
    onCapture(action);
  }, [onCapture, action]);

  const MediaIcon = iconMap[mediaIconName];

  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowHint}>{hint}</span>
      </div>

      <div className={styles.unifiedControls}>
        <Button
          className={styles.captureButton}
          variant={isListening ? 'solid' : 'outline'}
          size="sm"
          accent={isListening ? 'primary' : 'secondary'}
          onClick={handleCapture}
          disabled={disabled}
          aria-pressed={isListening}
          data-testid={`remote-binding-${action}`}
        >
          <span
            className={cn(
              styles.captureValue,
              isListening && styles.captureValueListening,
              !binding && !isListening && styles.captureValueEmpty
            )}
          >
            {isListening
              ? t('setup.remoteConfig.listening')
              : binding
                ? getKeyboardBindingDisplayLabel(binding)
                : t('setup.remoteConfig.notSet')}
          </span>
        </Button>

        <span className={styles.mediaBadgeSeparator}>/</span>

        <span
          className={styles.mediaBadge}
          aria-label={mediaBadgeLabel}
          role="img"
          title={`${mediaButtonLabel} - ${t('setup.remoteConfig.mediaButtons.notConfigurable')}`}
        >
          <MediaIcon size={22} />
        </span>
      </div>
    </div>
  );
};

interface RemoteConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteConfigurationModal({ isOpen, onClose }: RemoteConfigurationModalProps) {
  const { t } = useTranslation();
  const { addErrorToast, addSuccessToast } = useToast();
  const [draftConfig, setDraftConfig] = useState<RemoteControllerConfig | null>(null);
  const [listeningAction, setListeningAction] = useState<ConfigurableKeyboardAction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const closeGuardRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      closeGuardRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setListeningAction(null);
      return;
    }

    let isMounted = true;

    void (async () => {
      try {
        const storedConfig = await loadRemoteControllerConfigWithFallback();

        if (!isMounted) {
          return;
        }

        setDraftConfig(storedConfig);
      } catch (error) {
        console.error('Failed to load remote controller config.', error);

        if (!isMounted) {
          return;
        }

        setDraftConfig({
          mode: 'keyboard-mapping',
          keyboardBindings: createEmptyRemoteControllerBindings(),
          updatedAt: new Date().toISOString()
        });
        addErrorToast(t('setup.remoteConfig.feedback.loadError'));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [addErrorToast, isOpen, t]);

  useEffect(() => {
    if (!isOpen || !listeningAction) {
      return;
    }

    const handleCapture = (event: KeyboardEvent) => {
      if (ignoredCaptureKeys.has(event.key)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (!draftConfig) {
        setListeningAction(null);
        return;
      }

      setDraftConfig((currentConfig) => {
        if (!currentConfig) {
          return currentConfig;
        }

        return {
          ...currentConfig,
          mode: 'keyboard-mapping',
          keyboardBindings: assignRemoteControllerBinding(
            currentConfig.keyboardBindings,
            listeningAction,
            event.key
          )
        };
      });
      setListeningAction(null);
    };

    window.addEventListener('keydown', handleCapture, true);

    return () => {
      window.removeEventListener('keydown', handleCapture, true);
    };
  }, [isOpen, listeningAction, draftConfig]);

  const requestClose = useCallback(() => {
    if (closeGuardRef.current) {
      return;
    }

    closeGuardRef.current = true;
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        requestClose();
      }
    },
    [requestClose]
  );

  const handleSave = useCallback(async () => {
    if (!draftConfig) {
      return;
    }

    setIsSaving(true);

    try {
      await saveRemoteControllerConfig(draftConfig);

      addSuccessToast(t('setup.remoteConfig.feedback.saveSuccess'));
      requestClose();
    } catch (error) {
      const saveError = toError(error);
      addErrorToast(`${t('setup.remoteConfig.feedback.saveError')} ${saveError.message}`);
    } finally {
      setIsSaving(false);
      setListeningAction(null);
    }
  }, [addErrorToast, addSuccessToast, draftConfig, requestClose, t]);

  const handleClear = useCallback(() => {
    if (!draftConfig) {
      return;
    }

    // Cancel any in-progress key listening to prevent stray keydown capture
    setListeningAction(null);

    setDraftConfig((currentConfig) => {
      if (!currentConfig) {
        return currentConfig;
      }

      return {
        ...currentConfig,
        keyboardBindings: createEmptyRemoteControllerBindings()
      };
    });
  }, [draftConfig]);

  const handleResetDefaults = useCallback(() => {
    if (!draftConfig) {
      return;
    }

    // Cancel any in-progress key listening to prevent stray keydown capture
    setListeningAction(null);

    setDraftConfig((currentConfig) => {
      if (!currentConfig) {
        return currentConfig;
      }

      return {
        ...currentConfig,
        keyboardBindings: createRemoteControllerBindings()
      };
    });
    addSuccessToast(t('setup.remoteConfig.feedback.resetSuccess'));
  }, [draftConfig, addSuccessToast, t]);

  const handleBackdropRender = useCallback(
    (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} className={styles.overlay} />,
    []
  );

  const handleTitleRender = useCallback(
    (titleProps: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...titleProps} className={styles.title}>
        {t('setup.remoteConfig.title')}
      </h2>
    ),
    [t]
  );

  const handleDescriptionRender = useCallback(
    (descriptionProps: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...descriptionProps} className={styles.description}>
        {t('setup.remoteConfig.description')}
      </p>
    ),
    [t]
  );

  const unifiedRows = useMemo(() => {
    const mediaButtonRows = getMediaButtonDisplayInfo(t);
    const bindingLabels: Array<{
      action: ConfigurableKeyboardAction;
      label: string;
      hint: string;
      mediaBadgeLabel: string;
      mediaIconName: MediaButtonIconName;
      mediaButtonLabel: string;
    }> = [];

    const rowConfigs: Array<{ action: ConfigurableKeyboardAction; label: string; hint: string }> = [
      {
        action: 'add-team-1',
        label: t('setup.remoteConfig.actions.addTeam1'),
        hint: t('setup.remoteConfig.rows.singlePressHint')
      },
      {
        action: 'revert-team-1',
        label: t('setup.remoteConfig.actions.revertTeam1'),
        hint: t('setup.remoteConfig.rows.guardedUndoHint')
      },
      {
        action: 'add-team-2',
        label: t('setup.remoteConfig.actions.addTeam2'),
        hint: t('setup.remoteConfig.rows.singlePressHint')
      },
      {
        action: 'revert-team-2',
        label: t('setup.remoteConfig.actions.revertTeam2'),
        hint: t('setup.remoteConfig.rows.guardedUndoHint')
      }
    ];

    for (const rowConfig of rowConfigs) {
      const mediaRow = mediaButtonRows.find((mbr) => mbr.action === rowConfig.action);
      bindingLabels.push({
        ...rowConfig,
        mediaBadgeLabel: mediaRow?.shortLabel ?? '',
        mediaIconName: mediaRow?.iconName ?? 'volume-up',
        mediaButtonLabel: mediaRow?.buttonLabel ?? ''
      });
    }

    return bindingLabels;
  }, [t]);

  const listeningAnnouncement = listeningAction
    ? t('setup.remoteConfig.listeningAnnouncement', {
        action: unifiedRows.find((row) => row.action === listeningAction)?.label ?? ''
      })
    : '';

  const handlePopupRender = useCallback(
    (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div
        {...props}
        className={styles.container}
        aria-modal="true"
        data-testid="remote-configuration-modal"
      >
        <div className={styles.header}>
          <Dialog.Title render={handleTitleRender} />
          <Dialog.Description render={handleDescriptionRender} />
        </div>

        <span role="status" aria-live="polite" className={styles.srOnly}>
          {listeningAnnouncement}
        </span>

        <div className={styles.rows}>
          {unifiedRows.map((row) => (
            <UnifiedRow
              key={row.action}
              label={row.label}
              hint={row.hint}
              binding={draftConfig?.keyboardBindings[row.action] ?? null}
              isListening={listeningAction === row.action}
              onCapture={setListeningAction}
              action={row.action}
              mediaBadgeLabel={row.mediaBadgeLabel}
              mediaIconName={row.mediaIconName}
              mediaButtonLabel={row.mediaButtonLabel}
              disabled={!draftConfig}
            />
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerGroup}>
            <Button variant="outline" size="sm" accent="secondary" onClick={handleClear}>
              {t('setup.remoteConfig.actions.clear')}
            </Button>
            <Button variant="outline" size="sm" accent="secondary" onClick={handleResetDefaults}>
              {t('setup.remoteConfig.actions.resetDefaults')}
            </Button>
          </div>
          <div className={styles.footerGroup}>
            <Button variant="outline" size="sm" accent="secondary" onClick={requestClose}>
              {t('setup.remoteConfig.actions.cancel')}
            </Button>
            <Button
              variant="solid"
              size="sm"
              accent="success"
              onClick={handleSave}
              disabled={isSaving || !draftConfig}
            >
              {t('setup.remoteConfig.actions.save')}
            </Button>
          </div>
        </div>
      </div>
    ),
    [
      handleTitleRender,
      handleDescriptionRender,
      listeningAnnouncement,
      unifiedRows,
      draftConfig,
      listeningAction,
      t,
      requestClose,
      handleSave,
      handleClear,
      handleResetDefaults,
      isSaving
    ]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop render={handleBackdropRender} />
        <Dialog.Popup render={handlePopupRender} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
