import { useState, useCallback, useEffect, useMemo, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useRouter } from '@tanstack/react-router';

import {
  countdownTimerDurations,
  matchFormats,
  type CountdownTimerDuration,
  type MatchFormat
} from '@/core/match/types';
import { createMatchSetup } from '@/core/match/validation';
import { saveCurrentMatch } from '@/lib/current-match/indexed-db';
import { defaultLocale, isSupportedLocale } from '@/lib/i18n/types';
import { saveSetupPreferenceSlice } from '@/lib/setup/setup-storage';
import { getAvailableVoices } from '@/lib/speech/unified-tts';
import { unlockSpeechEngine } from '@/lib/speech/speech-service';
import { requestScreenWakeLock } from '@/lib/input/wake-lock';
import {
  createDefaultRemoteControllerConfig,
  loadRemoteControllerConfigWithFallback,
  type RemoteControllerConfig
} from '@/lib/input/remote-controller-storage';
import { prepareCurrentMatchRouteNavigation } from '@/lib/router/current-match-route-flow';
import { cn } from '@/lib/utils/cn';
import { primeWebMediaSession } from '@/lib/input/web-media-session';
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions';

import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Chip } from '@/components/ui/Chip/Chip';
import { Divider } from '@/components/ui/Divider/Divider';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { TextInput } from '@/components/ui/TextInput/TextInput';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import { LocaleSelector } from '@/components/ui/LocaleSelector/LocaleSelector';
import { StoreButtons } from '@/components/StoreButtons/StoreButtons';
import { SocialButtons } from '@/components/SocialButtons/SocialButtons';

import { RemoteConfigurationModal } from './RemoteConfigurationModal';
import { VoiceSelectionModal } from './VoiceSelectionModal';
import { useSetupForm } from './useSetupForm';
import styles from './SetupScreen.module.css';

const NOOP = () => {};

// Generate a URL-safe match ID
function generateMatchId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Format key mapping for translations
const formatKeys: Record<MatchFormat, string> = {
  'best-of-1': 'bestOf1',
  'best-of-3': 'bestOf3',
  'best-of-5': 'bestOf5'
};

const countdownDurationKeys: Record<CountdownTimerDuration, string> = {
  60: 'setup.rules.countdownDuration.oneHour',
  90: 'setup.rules.countdownDuration.ninetyMinutes',
  120: 'setup.rules.countdownDuration.twoHours'
};

export function SetupScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isRemoteConfigurationOpen, setIsRemoteConfigurationOpen] = useState(false);
  const [isVoiceSelectionOpen, setIsVoiceSelectionOpen] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [remoteConfig, setRemoteConfig] = useState(createDefaultRemoteControllerConfig());

  const {
    formData,
    errors,
    validate,
    updateTeamName,
    updateFormat,
    updateGameMode,
    updateInitialServer,
    updateDecidingSetSuperTiebreak,
    updateAudioAnnouncementsEnabled,
    updateVoiceName,
    updateSideSwitchPrompts,
    updateServingIndicatorEnabled,
    updateCountdownTimerEnabled,
    updateCountdownTimerDuration,
    isGoldenPointEnabled,
    showSuperTiebreakOption
  } = useSetupForm();
  useEffect(() => {
    setSelectedVoiceName(formData.voiceName);
  }, [formData.voiceName]);

  // Keep the latest saved remote config in memory so match start can synchronously
  // decide whether Media Session priming should run inside the user gesture.
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const config = await loadRemoteControllerConfigWithFallback();
        if (isMounted) {
          setRemoteConfig(config);
        }
      } catch (error) {
        console.error('Failed to load remote controller config:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const currentLocale = isSupportedLocale(i18n.language) ? i18n.language : defaultLocale;

  const handleStartMatch = useCallback(async () => {
    if (!validate()) {
      return;
    }

    // iOS/Safari requires a user-gesture-scoped speechSynthesis.speak() call to unlock
    // the speech engine. Without this, all async announcements in ActiveMatchScreen are
    // silently dropped on the first session.
    if (formData.audioAnnouncementsEnabled) {
      unlockSpeechEngine();
    }

    // Request wake lock on user interaction (required by iOS Safari)
    void requestScreenWakeLock();

    // Prime media session synchronously inside the user gesture when media buttons are enabled.
    if (remoteConfig.mode === 'media-buttons') {
      primeWebMediaSession();
    }

    setIsStarting(true);

    try {
      const matchId = generateMatchId();

      // Create match setup input
      const setupInput = {
        format: formData.format,
        gameMode: formData.gameMode,
        initialServer: formData.initialServer,
        decidingSetSuperTiebreak: formData.decidingSetSuperTiebreak,
        audioAnnouncementsEnabled: formData.audioAnnouncementsEnabled,
        servingIndicatorEnabled: formData.servingIndicatorEnabled,
        countdownTimerEnabled: formData.countdownTimerEnabled,
        countdownTimerDuration: formData.countdownTimerDuration,
        sideSwitchPrompts: formData.sideSwitchPrompts,
        sides: [
          { id: 'team-1' as const, playerNames: [formData.team1Name] },
          { id: 'team-2' as const, playerNames: [formData.team2Name] }
        ]
      } satisfies Parameters<typeof createMatchSetup>[0];

      // Create validated match setup
      const setup = createMatchSetup(setupInput);

      // Persist match state to IndexedDB before navigation
      await saveCurrentMatch({ matchId, setup, actions: [], startedAt: Date.now() });
      await prepareCurrentMatchRouteNavigation(router, {
        to: '/match/$id',
        params: { id: matchId }
      });

      // Navigate to active match route
      await navigate({
        to: '/match/$id',
        params: { id: matchId },
        ...getViewTransitionNavigationOptions()
      });
    } catch (error) {
      console.error('Failed to start match:', error);
      setIsStarting(false);
    }
  }, [formData, navigate, remoteConfig.mode, router, validate]);

  const handleRemoteConfigSaved = useCallback((config: RemoteControllerConfig) => {
    setRemoteConfig(config);
  }, []);

  const handleFormatChange = useCallback(
    (format: MatchFormat) => {
      updateFormat(format);
      // Reset super tiebreak when switching to best-of-1
      if (format === 'best-of-1') {
        updateDecidingSetSuperTiebreak(false);
      }
    },
    [updateFormat, updateDecidingSetSuperTiebreak]
  );

  const handleGoldenPointChange = useCallback(
    (enabled: boolean) => {
      updateGameMode(enabled ? 'golden-point' : 'advantage');
    },
    [updateGameMode]
  );

  // Stable handlers for team name inputs
  const handleTeam1NameChange = useCallback(
    (value: string) => {
      updateTeamName('team-1', value);
    },
    [updateTeamName]
  );

  const handleTeam2NameChange = useCallback(
    (value: string) => {
      updateTeamName('team-2', value);
    },
    [updateTeamName]
  );

  // Stable handlers for initial server selection
  const handleTeam1ServerSelect = useCallback(() => {
    updateInitialServer('team-1');
  }, [updateInitialServer]);

  const handleTeam2ServerSelect = useCallback(() => {
    updateInitialServer('team-2');
  }, [updateInitialServer]);

  const createCountdownDurationSelectHandler = useCallback(
    (duration: CountdownTimerDuration) => () => {
      updateCountdownTimerDuration(duration);
    },
    [updateCountdownTimerDuration]
  );

  const handleOpenRemoteConfiguration = useCallback(() => {
    setIsRemoteConfigurationOpen(true);
  }, []);

  const handleHistoryNavigation = useCallback(() => {
    void navigate({ to: '/history' });
  }, [navigate]);

  const handleCloseRemoteConfiguration = useCallback(() => {
    setIsRemoteConfigurationOpen(false);
  }, []);

  const handleCloseVoiceSelection = useCallback(() => {
    setIsVoiceSelectionOpen(false);
  }, []);

  const handleAudioAnnouncementsChange = useCallback(
    (enabled: boolean) => {
      updateAudioAnnouncementsEnabled(enabled);
    },
    [updateAudioAnnouncementsEnabled]
  );

  const handleOpenVoiceSelection = useCallback(async () => {
    try {
      const voices = await getAvailableVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Failed to load available voices.', error);
      setAvailableVoices([]);
    }

    setIsVoiceSelectionOpen(true);
  }, []);

  const handleVoiceSelectionAccept = useCallback(
    async (voiceName: string) => {
      setSelectedVoiceName(voiceName);
      updateVoiceName(voiceName);

      try {
        await saveSetupPreferenceSlice({ voiceName });
      } catch (error) {
        console.error('Failed to save selected voice.', error);
      }
    },
    [updateVoiceName]
  );

  const handleCountdownDurationKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!formData.countdownTimerEnabled) {
        return;
      }

      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
      }

      event.preventDefault();

      const currentIndex = countdownTimerDurations.indexOf(formData.countdownTimerDuration);
      const nextIndex =
        event.key === 'ArrowRight'
          ? (currentIndex + 1) % countdownTimerDurations.length
          : (currentIndex - 1 + countdownTimerDurations.length) % countdownTimerDurations.length;
      const nextDuration = countdownTimerDurations[nextIndex];

      if (typeof nextDuration === 'undefined') {
        return;
      }

      updateCountdownTimerDuration(nextDuration);
      event.currentTarget
        .querySelector<HTMLButtonElement>(`[data-duration="${nextDuration}"]`)
        ?.focus();
    },
    [formData.countdownTimerDuration, formData.countdownTimerEnabled, updateCountdownTimerDuration]
  );

  // Handler factory for format selection (returns stable handler per format)
  const createFormatClickHandler = useCallback(
    (format: MatchFormat) => () => {
      handleFormatChange(format);
    },
    [handleFormatChange]
  );

  // Header content
  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('app.title')}
        subtitle={t('setup.header.subtitle')}
        showFirstVisitHelpSpotlight={true}
      >
        <LocaleSelector />
      </TopBar>
    ),
    [t]
  );

  // Footer content
  const footerContent = useMemo(
    () => (
      <Button
        className={styles.startButton}
        variant="solid"
        size="lg"
        accent="success"
        onClick={handleStartMatch}
        disabled={isStarting || hasErrors}
      >
        {t('setup.startButton')}
      </Button>
    ),
    [handleStartMatch, isStarting, hasErrors, t]
  );

  return (
    <Layout header={headerContent} footer={footerContent}>
      <div className={styles.mainContent}>
        {/* Left column - Teams */}
        <div className={styles.leftColumn}>
          {/* Team 1 */}
          <SectionLabel accent="primary">{t('setup.teams.team1Label')}</SectionLabel>
          <Card accent="primary" className={styles.teamCard}>
            <TextInput
              value={formData.team1Name}
              onChange={handleTeam1NameChange}
              accent="primary"
              placeholder={t('setup.teams.playerPlaceholder')}
              aria-label={t('setup.teams.team1Label')}
            />
            {errors.team1Name && <p className={styles.errorText}>{t(errors.team1Name)}</p>}
          </Card>

          {/* Team 2 */}
          <SectionLabel accent="secondary">{t('setup.teams.team2Label')}</SectionLabel>
          <Card accent="secondary" className={styles.teamCard}>
            <TextInput
              value={formData.team2Name}
              onChange={handleTeam2NameChange}
              accent="secondary"
              placeholder={t('setup.teams.playerPlaceholder')}
              aria-label={t('setup.teams.team2Label')}
            />
            {errors.team2Name && <p className={styles.errorText}>{t(errors.team2Name)}</p>}
          </Card>

          {/* First Server */}
          <div
            className={cn(
              styles.firstServerSection,
              !formData.servingIndicatorEnabled && styles.firstServerSectionDisabled
            )}
            data-testid="first-server-section"
            aria-disabled={!formData.servingIndicatorEnabled || undefined}
          >
            <SectionLabel>{t('setup.firstServer.label')}</SectionLabel>
            <div className={styles.serverRow}>
              <Chip
                className={cn(styles.serverChip, styles.team1)}
                pressed={formData.initialServer === 'team-1'}
                onPressedChange={handleTeam1ServerSelect}
                disabled={!formData.servingIndicatorEnabled}
              >
                <>
                  <span className={cn(styles.dot, styles.team1)} aria-hidden="true" />
                  <span
                    className={cn(
                      styles.serverChipText,
                      formData.initialServer === 'team-1'
                        ? cn(styles.serverChipTextSelected, styles.team1)
                        : styles.serverChipTextUnselected
                    )}
                  >
                    {t('setup.firstServer.team1')}
                  </span>
                </>
              </Chip>
              <Chip
                className={cn(styles.serverChip, styles.team2)}
                pressed={formData.initialServer === 'team-2'}
                onPressedChange={handleTeam2ServerSelect}
                disabled={!formData.servingIndicatorEnabled}
              >
                <>
                  <span className={cn(styles.dot, styles.team2)} aria-hidden="true" />
                  <span
                    className={cn(
                      styles.serverChipText,
                      formData.initialServer === 'team-2'
                        ? cn(styles.serverChipTextSelected, styles.team2)
                        : styles.serverChipTextUnselected
                    )}
                  >
                    {t('setup.firstServer.team2')}
                  </span>
                </>
              </Chip>
            </div>
          </div>

          <Button
            className={styles.historyButton}
            variant="outline"
            size="lg"
            accent="secondary"
            onClick={handleHistoryNavigation}
          >
            {t('setup.historyButton')}
          </Button>
          {import.meta.env.VITE_IS_NATIVE !== 'true' && (
            <div className={styles.storeBadgesContainer}>
              <StoreButtons />
            </div>
          )}
          <div className={styles.socialButtonsContainer}>
            <SocialButtons />
          </div>
        </div>

        {/* Right column - Options */}
        <div className={styles.rightColumn}>
          {/* Match Format */}
          <SectionLabel>{t('setup.format.label')}</SectionLabel>
          <div className={styles.formatRow}>
            {matchFormats.map((format) => (
              <Chip
                key={format}
                pressed={formData.format === format}
                onPressedChange={createFormatClickHandler(format)}
              >
                <span
                  className={cn(
                    styles.formatChipText,
                    formData.format === format
                      ? styles.formatChipTextSelected
                      : styles.formatChipTextUnselected
                  )}
                >
                  {t(`setup.format.${formatKeys[format]}`)}
                </span>
              </Chip>
            ))}
          </div>

          {/* Rules Card */}
          <Card className={styles.rulesCard} data-testid="rules-card">
            <Toggle
              checked={formData.audioAnnouncementsEnabled}
              onChange={handleAudioAnnouncementsChange}
              label={t('setup.rules.audioAnnouncements')}
              hint={t('setup.rules.audioAnnouncementsHint')}
            />

            {formData.audioAnnouncementsEnabled && (
              <button
                type="button"
                className={styles.voicePreviewButton}
                onClick={handleOpenVoiceSelection}
              >
                {t('setup.voiceSelection.previewLink')}
              </button>
            )}

            <Divider />

            {/* Remote Controller */}
            <Toggle
              checked={true}
              disabled={true}
              onChange={NOOP}
              label={t('setup.rules.remoteController')}
              hint={t('setup.rules.remoteControllerHint')}
            />

            <button
              type="button"
              className={styles.voicePreviewButton}
              onClick={handleOpenRemoteConfiguration}
            >
              {t('setup.rules.remoteControllerLink')}
            </button>

            <Divider />

            {/* Golden Point */}
            <Toggle
              checked={isGoldenPointEnabled}
              onChange={handleGoldenPointChange}
              label={t('setup.rules.goldenPoint')}
              hint={t('setup.rules.goldenPointHint')}
            />

            <Divider />

            <Toggle
              checked={formData.servingIndicatorEnabled}
              onChange={updateServingIndicatorEnabled}
              label={t('setup.rules.servingIndicator')}
              hint={t('setup.rules.servingIndicatorHint')}
            />

            <Divider />

            {/* Side Switch Prompts */}
            <Toggle
              checked={formData.sideSwitchPrompts}
              onChange={updateSideSwitchPrompts}
              label={t('setup.rules.sideSwitch')}
              hint={t('setup.rules.sideSwitchHint')}
            />

            <Divider />

            <div
              className={styles.countdownSection}
              role="group"
              aria-label={t('setup.rules.countdownTimer')}
            >
              <Toggle
                checked={formData.countdownTimerEnabled}
                onChange={updateCountdownTimerEnabled}
                label={t('setup.rules.countdownTimer')}
                hint={t('setup.rules.countdownTimerHint')}
              />

              <div
                className={cn(
                  styles.countdownDurationRow,
                  !formData.countdownTimerEnabled && styles.countdownDurationRowDisabled
                )}
                role="radiogroup"
                aria-label={t('setup.rules.countdownDuration.label')}
                data-testid="countdown-duration-row"
                onKeyDown={handleCountdownDurationKeyDown}
                tabIndex={0}
              >
                {countdownTimerDurations.map((duration) => {
                  const isSelected = formData.countdownTimerDuration === duration;

                  return (
                    <button
                      key={duration}
                      type="button"
                      role="radio" // oxlint-disable-line jsx-a11y/prefer-tag-over-role
                      aria-checked={isSelected}
                      className={styles.countdownDurationOption}
                      onClick={createCountdownDurationSelectHandler(duration)}
                      disabled={!formData.countdownTimerEnabled}
                      tabIndex={isSelected ? 0 : -1}
                      data-duration={duration}
                    >
                      <span
                        className={cn(
                          styles.countdownDurationRadio,
                          isSelected && styles.countdownDurationRadioSelected
                        )}
                        aria-hidden="true"
                      >
                        <span className={styles.countdownDurationRadioDot} />
                      </span>
                      <span
                        className={cn(
                          styles.countdownDurationLabel,
                          isSelected
                            ? styles.countdownDurationLabelSelected
                            : styles.countdownDurationLabelUnselected
                        )}
                      >
                        {t(countdownDurationKeys[duration])}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Super Tiebreak - only for best-of-3 and best-of-5 */}
            {showSuperTiebreakOption && (
              <>
                <Divider />
                <Toggle
                  checked={formData.decidingSetSuperTiebreak}
                  onChange={updateDecidingSetSuperTiebreak}
                  label={t('setup.rules.superTiebreak')}
                  hint={t('setup.rules.superTiebreakHint')}
                />
              </>
            )}
          </Card>
        </div>
      </div>

      <RemoteConfigurationModal
        isOpen={isRemoteConfigurationOpen}
        onClose={handleCloseRemoteConfiguration}
        onSaved={handleRemoteConfigSaved}
      />
      <VoiceSelectionModal
        isOpen={isVoiceSelectionOpen}
        onClose={handleCloseVoiceSelection}
        onAccept={handleVoiceSelectionAccept}
        voices={availableVoices}
        selectedVoiceName={selectedVoiceName}
        locale={currentLocale}
      />
    </Layout>
  );
}
