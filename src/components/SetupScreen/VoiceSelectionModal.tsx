/* oxlint-disable jsx-no-new-function-as-prop -- Base UI Dialog and Select use render props for accessible composition. */

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

export interface VoiceSelectionModalProps {
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop render={(props) => <div {...props} className={styles.overlay} />} />

        <Dialog.Popup
          render={(props) => (
            <div {...props} className={styles.container} data-testid="voice-selection-modal">
              <div className={styles.header}>
                <Dialog.Title
                  render={(titleProps) => (
                    <h2 {...titleProps} className={styles.title}>
                      {t('setup.voiceSelection.title')}
                    </h2>
                  )}
                />
              </div>

              <div className={styles.field}>
                <Select.Root
                  value={previewVoice ? getVoiceId(previewVoice) : null}
                  onValueChange={handleVoiceChange}
                >
                  {/* oxlint-disable jsx-a11y/label-has-associated-control -- Base UI Select.Label and
                    Select.Trigger are associated through the component's ARIA pattern, not htmlFor */}
                  <Select.Label
                    render={(labelProps) => <label {...labelProps} className={styles.label} />}
                  >
                    {t('setup.voiceSelection.selectVoice')}
                  </Select.Label>

                  <Select.Trigger
                    render={(triggerProps) => (
                      <button {...triggerProps} type="button" className={styles.trigger}>
                        <Select.Value placeholder={t('setup.voiceSelection.selectVoice')}>
                          {previewVoice?.name ?? null}
                        </Select.Value>
                        <span className={styles.triggerIcon} aria-hidden="true">
                          ▾
                        </span>
                      </button>
                    )}
                  />

                  <Select.Portal>
                    <Select.Positioner side="bottom" className={styles.positioner}>
                      <Select.Popup
                        render={(popupProps) => <div {...popupProps} className={styles.popup} />}
                      >
                        <Select.List className={styles.list}>
                          {orderedLocaleKeys.map((groupLocale) => (
                            <Select.Group key={groupLocale} className={styles.group}>
                              <Select.GroupLabel
                                render={(groupLabelProps) => (
                                  <div {...groupLabelProps} className={styles.groupLabel} />
                                )}
                              >
                                {getLanguageDisplayName(groupLocale)}
                              </Select.GroupLabel>

                              {voicesByLocale[groupLocale]?.map((voice) => (
                                <Select.Item
                                  key={getVoiceId(voice)}
                                  value={getVoiceId(voice)}
                                  className={styles.item}
                                >
                                  <span>{voice.name}</span>
                                  <Select.ItemIndicator
                                    render={(indicatorProps) => (
                                      <span
                                        {...indicatorProps}
                                        className={styles.itemIndicator}
                                        aria-hidden="true"
                                      >
                                        ✓
                                      </span>
                                    )}
                                  />
                                </Select.Item>
                              ))}
                            </Select.Group>
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
          )}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
