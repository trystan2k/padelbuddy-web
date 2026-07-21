import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  defaultAudioAnnouncementsEnabled,
  defaultCountdownTimerDuration,
  defaultCountdownTimerEnabled,
  defaultMatchFormat,
  defaultGameMode,
  defaultInitialServer,
  defaultServingIndicatorEnabled,
  defaultSuperTiebreakTargetPoints,
  type CountdownTimerDuration,
  type MatchFormat,
  type MatchGameMode,
  type SuperTiebreakTargetPoints,
  type MatchTeamId
} from '@/core/match/types';
import {
  defaultSetupPreferences,
  loadSetupPreferences,
  saveSetupPreferenceSlice,
  type SetupPreferenceSlice
} from '@/lib/setup/setup-storage';

import type { SetupFormData, FieldErrors } from './types';
import { validateSetupForm } from './validateSetupForm';

const defaultPersistedSetupSlice = toPersistedSetupPreferenceSlice(defaultSetupPreferences);

export function useSetupForm() {
  const { t, i18n } = useTranslation();

  // Track whether team names have been manually modified by the user
  const team1Touched = useRef(false);
  const team2Touched = useRef(false);
  // Use a ref so hydration completion can flip synchronously in finally without
  // waiting for a state update; the persistence effect sees the updated flag on re-render.
  const hasHydratedPersistedPreferences = useRef(false);
  const lastPersistedSetupSlice = useRef(defaultPersistedSetupSlice);

  // Initialize form with defaults
  const [formData, setFormData] = useState<SetupFormData>({
    team1Name: t('setup.teams.team1Default'),
    team2Name: t('setup.teams.team2Default'),
    format: defaultMatchFormat,
    gameMode: defaultGameMode,
    initialServer: defaultInitialServer,
    decidingSetSuperTiebreak: false,
    superTiebreakTargetPoints: defaultSuperTiebreakTargetPoints,
    audioAnnouncementsEnabled: defaultAudioAnnouncementsEnabled,
    voiceName: null,
    servingIndicatorEnabled: defaultServingIndicatorEnabled,
    countdownTimerEnabled: defaultCountdownTimerEnabled,
    countdownTimerDuration: defaultCountdownTimerDuration,
    autoOpenSetsHistoryModal: true,
    sideSwitchPrompts: false
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  // Update team name defaults when language changes (only if not touched by user)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      team1Name: team1Touched.current ? prev.team1Name : t('setup.teams.team1Default'),
      team2Name: team2Touched.current ? prev.team2Name : t('setup.teams.team2Default')
    }));
  }, [i18n.language, t]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const setupPreferences = await loadSetupPreferences();

        if (!isMounted) {
          return;
        }

        if (setupPreferences) {
          if (setupPreferences.team1Name !== null) {
            team1Touched.current = true;
          }

          if (setupPreferences.team2Name !== null) {
            team2Touched.current = true;
          }

          lastPersistedSetupSlice.current = toPersistedSetupPreferenceSlice(setupPreferences);

          setFormData((prev) => ({
            ...prev,
            team1Name: setupPreferences.team1Name ?? prev.team1Name,
            team2Name: setupPreferences.team2Name ?? prev.team2Name,
            voiceName: setupPreferences.audioAnnouncementsEnabled
              ? setupPreferences.voiceName
              : null,
            audioAnnouncementsEnabled: setupPreferences.audioAnnouncementsEnabled,
            servingIndicatorEnabled: setupPreferences.servingIndicatorEnabled,
            countdownTimerEnabled: setupPreferences.countdownTimerEnabled,
            countdownTimerDuration: setupPreferences.countdownTimerDuration,
            autoOpenSetsHistoryModal:
              typeof setupPreferences.autoOpenSetsHistoryModal === 'boolean'
                ? setupPreferences.autoOpenSetsHistoryModal
                : true,
            sideSwitchPrompts: setupPreferences.sideSwitchPrompts,
            format: setupPreferences.format,
            gameMode: setupPreferences.gameMode,
            decidingSetSuperTiebreak: setupPreferences.decidingSetSuperTiebreak,
            superTiebreakTargetPoints: setupPreferences.superTiebreakTargetPoints
          }));
          return;
        }

        lastPersistedSetupSlice.current = defaultPersistedSetupSlice;
      } catch (error) {
        console.warn('[useSetupForm] Failed to load preferences, using defaults:', error);
      } finally {
        hasHydratedPersistedPreferences.current = true;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedPersistedPreferences.current) {
      return undefined;
    }

    const nextPersistedSetupSlice = toPersistedSetupPreferenceSlice({
      audioAnnouncementsEnabled: formData.audioAnnouncementsEnabled,
      servingIndicatorEnabled: formData.servingIndicatorEnabled,
      countdownTimerEnabled: formData.countdownTimerEnabled,
      countdownTimerDuration: formData.countdownTimerDuration,
      autoOpenSetsHistoryModal: formData.autoOpenSetsHistoryModal,
      sideSwitchPrompts: formData.sideSwitchPrompts,
      format: formData.format,
      gameMode: formData.gameMode,
      decidingSetSuperTiebreak: formData.decidingSetSuperTiebreak,
      superTiebreakTargetPoints: formData.superTiebreakTargetPoints
    });

    if (areSetupPreferenceSlicesEqual(lastPersistedSetupSlice.current, nextPersistedSetupSlice)) {
      return undefined;
    }

    let isCancelled = false;

    const persistSetupPreferences = async () => {
      try {
        await saveSetupPreferenceSlice(nextPersistedSetupSlice);

        if (!isCancelled) {
          lastPersistedSetupSlice.current = nextPersistedSetupSlice;
        }
      } catch (error) {
        console.error('[useSetupForm] Failed to persist setup preferences:', error);
      }
    };

    void persistSetupPreferences();

    return () => {
      isCancelled = true;
    };
  }, [
    formData.audioAnnouncementsEnabled,
    formData.countdownTimerDuration,
    formData.countdownTimerEnabled,
    formData.autoOpenSetsHistoryModal,
    formData.decidingSetSuperTiebreak,
    formData.format,
    formData.gameMode,
    formData.servingIndicatorEnabled,
    formData.sideSwitchPrompts,
    formData.superTiebreakTargetPoints
  ]);

  const updateField = useCallback(
    <K extends keyof SetupFormData>(field: K, value: SetupFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated (only for fields that have errors)
      setErrors((prev) => {
        if (!(field in prev)) {
          return prev;
        }
        // Create a new object without the deleted key
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    },
    []
  );

  const updateTeamName = useCallback(
    (teamId: MatchTeamId, name: string) => {
      const normalizedTeamName = name.trim();
      const persistedName = normalizedTeamName.length > 0 ? normalizedTeamName : null;

      if (teamId === 'team-1') {
        team1Touched.current = true;
        updateField('team1Name', name);
      } else {
        team2Touched.current = true;
        updateField('team2Name', name);
      }

      void saveSetupPreferenceSlice(
        teamId === 'team-1' ? { team1Name: persistedName } : { team2Name: persistedName }
      ).catch((error) => {
        console.error('[useSetupForm] Failed to persist team name:', error);
      });
    },
    [updateField]
  );

  const updateFormat = useCallback(
    (format: MatchFormat) => {
      updateField('format', format);
    },
    [updateField]
  );

  const updateGameMode = useCallback(
    (gameMode: MatchGameMode) => {
      updateField('gameMode', gameMode);
    },
    [updateField]
  );

  const updateSuperTiebreakTargetPoints = useCallback(
    (points: SuperTiebreakTargetPoints) => {
      updateField('superTiebreakTargetPoints', points);
    },
    [updateField]
  );

  const updateInitialServer = useCallback(
    (server: MatchTeamId) => {
      updateField('initialServer', server);
    },
    [updateField]
  );

  const updateDecidingSetSuperTiebreak = useCallback(
    (enabled: boolean) => {
      updateField('decidingSetSuperTiebreak', enabled);
    },
    [updateField]
  );

  const updateSideSwitchPrompts = useCallback(
    (enabled: boolean) => {
      updateField('sideSwitchPrompts', enabled);
    },
    [updateField]
  );

  const updateAutoOpenSetsHistoryModal = useCallback(
    (enabled: boolean) => {
      updateField('autoOpenSetsHistoryModal', enabled);
    },
    [updateField]
  );

  const updateAudioAnnouncementsEnabled = useCallback(
    (enabled: boolean) => {
      updateField('audioAnnouncementsEnabled', enabled);
    },
    [updateField]
  );

  const updateVoiceName = useCallback(
    (voiceName: string | null) => {
      updateField('voiceName', voiceName);
    },
    [updateField]
  );

  const updateCountdownTimerEnabled = useCallback(
    (enabled: boolean) => {
      updateField('countdownTimerEnabled', enabled);
    },
    [updateField]
  );

  const updateServingIndicatorEnabled = useCallback(
    (enabled: boolean) => {
      updateField('servingIndicatorEnabled', enabled);
    },
    [updateField]
  );

  const updateCountdownTimerDuration = useCallback(
    (duration: CountdownTimerDuration) => {
      updateField('countdownTimerDuration', duration);
    },
    [updateField]
  );

  const validate = useCallback(() => {
    const result = validateSetupForm(formData);
    setErrors(result.errors);
    return result.isValid;
  }, [formData]);

  // Computed: is Golden Point enabled
  const isGoldenPointEnabled = formData.gameMode === 'golden-point';

  // Computed: super tiebreak can be enabled for any match format.
  const showSuperTiebreakOption = true;

  return {
    formData,
    errors,
    validate,
    updateTeamName,
    updateFormat,
    updateGameMode,
    updateSuperTiebreakTargetPoints,
    updateInitialServer,
    updateDecidingSetSuperTiebreak,
    updateAudioAnnouncementsEnabled,
    updateVoiceName,
    updateSideSwitchPrompts,
    updateAutoOpenSetsHistoryModal,
    updateServingIndicatorEnabled,
    updateCountdownTimerEnabled,
    updateCountdownTimerDuration,
    isGoldenPointEnabled,
    showSuperTiebreakOption
  };
}

function toPersistedSetupPreferenceSlice(
  data:
    | Pick<
        SetupFormData,
        | 'audioAnnouncementsEnabled'
        | 'servingIndicatorEnabled'
        | 'countdownTimerEnabled'
        | 'countdownTimerDuration'
        | 'autoOpenSetsHistoryModal'
        | 'sideSwitchPrompts'
        | 'format'
        | 'gameMode'
        | 'decidingSetSuperTiebreak'
        | 'superTiebreakTargetPoints'
      >
    | Pick<
        typeof defaultSetupPreferences,
        | 'audioAnnouncementsEnabled'
        | 'servingIndicatorEnabled'
        | 'countdownTimerEnabled'
        | 'countdownTimerDuration'
        | 'autoOpenSetsHistoryModal'
        | 'sideSwitchPrompts'
        | 'format'
        | 'gameMode'
        | 'decidingSetSuperTiebreak'
        | 'superTiebreakTargetPoints'
      >
): SetupPreferenceSlice {
  return {
    audioAnnouncementsEnabled: data.audioAnnouncementsEnabled,
    servingIndicatorEnabled: data.servingIndicatorEnabled,
    countdownTimerEnabled: data.countdownTimerEnabled,
    countdownTimerDuration: data.countdownTimerDuration,
    autoOpenSetsHistoryModal:
      typeof data.autoOpenSetsHistoryModal === 'boolean' ? data.autoOpenSetsHistoryModal : true,
    sideSwitchPrompts: data.sideSwitchPrompts,
    format: data.format,
    gameMode: data.gameMode,
    decidingSetSuperTiebreak: data.decidingSetSuperTiebreak,
    superTiebreakTargetPoints: data.superTiebreakTargetPoints
  };
}

function areSetupPreferenceSlicesEqual(
  left: SetupPreferenceSlice,
  right: SetupPreferenceSlice
): boolean {
  return (
    left.audioAnnouncementsEnabled === right.audioAnnouncementsEnabled &&
    left.servingIndicatorEnabled === right.servingIndicatorEnabled &&
    left.countdownTimerEnabled === right.countdownTimerEnabled &&
    left.countdownTimerDuration === right.countdownTimerDuration &&
    left.autoOpenSetsHistoryModal === right.autoOpenSetsHistoryModal &&
    left.sideSwitchPrompts === right.sideSwitchPrompts &&
    left.format === right.format &&
    left.gameMode === right.gameMode &&
    left.decidingSetSuperTiebreak === right.decidingSetSuperTiebreak &&
    left.superTiebreakTargetPoints === right.superTiebreakTargetPoints
  );
}
