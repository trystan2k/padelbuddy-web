import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button/Button';
import { Select } from '@base-ui/react/select';
import { defaultLocale, isSupportedLocale } from '@/lib/i18n/types';
import {
  findVoiceByName,
  getAllVoicesGroupedByLocale,
  getDefaultVoiceForLocale,
  getLanguageDisplayName,
  getVoiceId
} from '@/lib/speech/voice-selector';
import { generateSpeechMessage } from '@/lib/speech/message-generator';

import styles from './VoiceSelectionModal.module.css';

const EMPTY_ARRAY: SpeechSynthesisVoice[] = [];

interface VoiceItemProps {
  voice: SpeechSynthesisVoice;
  onIndicatorRender: (props: React.HTMLAttributes<HTMLSpanElement>) => React.ReactElement;
}

const VoiceItem = ({ voice, onIndicatorRender }: VoiceItemProps) => (
  <Select.Item value={getVoiceId(voice)} className={styles.item}>
    <span>{voice.name}</span>
    <Select.ItemIndicator render={onIndicatorRender} />
  </Select.Item>
);

interface VoiceGroupProps {
  groupLocale: string;
  voices: SpeechSynthesisVoice[];
  onGroupLabelRender: (props: React.HTMLAttributes<HTMLDivElement>) => React.ReactElement;
  onItemIndicatorRender: (props: React.HTMLAttributes<HTMLSpanElement>) => React.ReactElement;
}

const VoiceGroup = ({
  groupLocale,
  voices,
  onGroupLabelRender,
  onItemIndicatorRender
}: VoiceGroupProps) => (
  <Select.Group className={styles.group}>
    <Select.GroupLabel render={onGroupLabelRender}>
      {getLanguageDisplayName(groupLocale)}
    </Select.GroupLabel>

    {voices?.map((voice) => (
      <VoiceItem key={getVoiceId(voice)} voice={voice} onIndicatorRender={onItemIndicatorRender} />
    ))}
  </Select.Group>
);

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (voiceName: string) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string | null;
  locale: string;
}

export function VoiceSelectionModal({
  isOpen,
  onClose,
  onAccept,
  voices,
  selectedVoiceName,
  locale
}: VoiceSelectionModalProps) {
  const { t } = useTranslation();
  const [previewVoice, setPreviewVoice] = useState<SpeechSynthesisVoice | null>(null);

  const localePrefix = isSupportedLocale(locale) ? locale : defaultLocale;

  // Derive preview text from the speech message generator for consistency
  const previewText = useMemo(() => {
    const message = generateSpeechMessage({
      eventType: 'point-scored',
      team1Score: '40',
      team2Score: '15',
      servingTeam: 'team-1',
      team1Name: t('setup.teams.team1Default'),
      team2Name: t('setup.teams.team2Default'),
      pointPressure: 'match-point',
      pointPressureTeam: 'team-1',
      verbosity: 'standard'
    });
    // Fallback for minimal verbosity or if generation fails
    return message ?? t('score.announcements.gamePoint', { teamName: '' });
  }, [t]);

  const voicesByLocale = useMemo(() => getAllVoicesGroupedByLocale(voices), [voices]);

  const orderedLocaleKeys = useMemo(
    () =>
      Object.keys(voicesByLocale).sort((leftLocale, rightLocale) => {
        if (leftLocale === localePrefix) {
          return -1;
        }

        if (rightLocale === localePrefix) {
          return 1;
        }

        return leftLocale.localeCompare(rightLocale);
      }),
    [localePrefix, voicesByLocale]
  );

  useEffect(() => {
    if (!isOpen) {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }

      return;
    }

    const selectedVoice = selectedVoiceName
      ? findVoiceByName(selectedVoiceName, voices)
      : undefined;
    const defaultVoice = getDefaultVoiceForLocale(localePrefix, voices) ?? voices[0] ?? null;

    setPreviewVoice(selectedVoice ?? defaultVoice);
  }, [isOpen, localePrefix, selectedVoiceName, voices]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  const handleVoiceChange = useCallback(
    (voiceId: string | null) => {
      if (voiceId === null) {
        setPreviewVoice(null);
        return;
      }

      setPreviewVoice(voices.find((v) => getVoiceId(v) === voiceId) ?? null);
    },
    [voices]
  );

  const handlePlayPreview = useCallback(() => {
    if (!previewVoice || typeof speechSynthesis === 'undefined') {
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(previewText);
    utterance.voice = previewVoice;
    utterance.lang = previewVoice.lang || localePrefix;
    speechSynthesis.speak(utterance);
  }, [previewText, previewVoice, localePrefix]);

  const handleAccept = useCallback(() => {
    if (!previewVoice) {
      return;
    }

    onAccept(previewVoice.name);
    onClose();
  }, [onAccept, onClose, previewVoice]);

  const handleBackdropRender = useCallback(
    (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} className={styles.overlay} />,
    []
  );

  const handleTitleRender = useCallback(
    (titleProps: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...titleProps} className={styles.title}>
        {t('setup.voiceSelection.title')}
      </h2>
    ),
    [t]
  );

  const handleSelectPopupRender = useCallback(
    (popupProps: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...popupProps} className={styles.popup} />
    ),
    []
  );

  const handleGroupLabelRender = useCallback(
    (groupLabelProps: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...groupLabelProps} className={styles.groupLabel} />
    ),
    []
  );

  const handleItemIndicatorRender = useCallback(
    (indicatorProps: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...indicatorProps} className={styles.itemIndicator} aria-hidden="true">
        ✓
      </span>
    ),
    []
  );

  const handleTriggerRender = useCallback(
    (triggerProps: React.HTMLAttributes<HTMLButtonElement>) => (
      <button {...triggerProps} type="button" className={styles.trigger}>
        <Select.Value placeholder={t('setup.voiceSelection.selectVoice')}>
          {previewVoice?.name ?? null}
        </Select.Value>
        <span className={styles.triggerIcon} aria-hidden="true">
          ▾
        </span>
      </button>
    ),
    [previewVoice?.name, t]
  );

  const handlePopupRender = useCallback(
    (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} className={styles.container} data-testid="voice-selection-modal">
        <div className={styles.header}>
          <Dialog.Title render={handleTitleRender} />
        </div>

        <div className={styles.field}>
          <Select.Root
            value={previewVoice ? getVoiceId(previewVoice) : null}
            onValueChange={handleVoiceChange}
          >
            <Select.Label className={styles.label}>
              {t('setup.voiceSelection.selectVoice')}
            </Select.Label>

            <Select.Trigger render={handleTriggerRender} />

            <Select.Portal>
              <Select.Positioner side="bottom" className={styles.positioner}>
                <Select.Popup render={handleSelectPopupRender}>
                  <Select.List className={styles.list}>
                    {orderedLocaleKeys.map((groupLocale) => (
                      <VoiceGroup
                        key={groupLocale}
                        groupLocale={groupLocale}
                        voices={voicesByLocale[groupLocale] ?? EMPTY_ARRAY}
                        onGroupLabelRender={handleGroupLabelRender}
                        onItemIndicatorRender={handleItemIndicatorRender}
                      />
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" size="sm" accent="secondary" onClick={onClose}>
            {t('setup.voiceSelection.cancel')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            accent="secondary"
            onClick={handlePlayPreview}
            disabled={!previewVoice}
          >
            {t('setup.voiceSelection.preview')}
          </Button>
          <Button
            variant="solid"
            size="sm"
            accent="success"
            onClick={handleAccept}
            disabled={!previewVoice}
          >
            {t('setup.voiceSelection.accept')}
          </Button>
        </div>
      </div>
    ),
    [
      handleTitleRender,
      previewVoice,
      handleVoiceChange,
      t,
      handleTriggerRender,
      handleSelectPopupRender,
      orderedLocaleKeys,
      handleGroupLabelRender,
      voicesByLocale,
      handleItemIndicatorRender,
      onClose,
      handlePlayPreview,
      handleAccept
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
