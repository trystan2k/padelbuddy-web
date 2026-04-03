import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import {
  defaultAudioAnnouncementsEnabled,
  defaultCountdownTimerDuration,
  defaultCountdownTimerEnabled,
  defaultMatchFormat,
  defaultGameMode,
  defaultInitialServer,
  defaultServingIndicatorEnabled,
  type CountdownTimerDuration,
  type MatchFormat,
  type MatchGameMode,
  type MatchTeamId
} from '@/core/match/types'
import {
  defaultSetupPreferences,
  loadSetupPreferences,
  saveSetupPreferenceSlice,
  type SetupPreferenceSlice
} from '@/lib/setup/setup-storage'

import type { SetupFormData, FieldErrors } from './types'
import { validateSetupForm } from './validateSetupForm'

const defaultPersistedSetupSlice: SetupPreferenceSlice = {
  audioAnnouncementsEnabled: defaultSetupPreferences.audioAnnouncementsEnabled,
  servingIndicatorEnabled: defaultSetupPreferences.servingIndicatorEnabled,
  countdownTimerEnabled: defaultSetupPreferences.countdownTimerEnabled,
  countdownTimerDuration: defaultSetupPreferences.countdownTimerDuration,
  sideSwitchPrompts: defaultSetupPreferences.sideSwitchPrompts,
  gameMode: defaultSetupPreferences.gameMode,
  decidingSetSuperTiebreak: defaultSetupPreferences.decidingSetSuperTiebreak
}

export function useSetupForm() {
  const { t, i18n } = useTranslation()

  // Track whether team names have been manually modified by the user
  const team1Touched = useRef(false)
  const team2Touched = useRef(false)
  // Use a ref so hydration completion can flip synchronously in finally without
  // waiting for a state update; the persistence effect sees the updated flag on re-render.
  const hasHydratedPersistedPreferences = useRef(false)
  const lastPersistedSetupSlice = useRef<SetupPreferenceSlice>(defaultPersistedSetupSlice)

  // Initialize form with defaults
  const [formData, setFormData] = useState<SetupFormData>({
    team1Name: t('setup.teams.team1Default'),
    team2Name: t('setup.teams.team2Default'),
    format: defaultMatchFormat,
    gameMode: defaultGameMode,
    initialServer: defaultInitialServer,
    decidingSetSuperTiebreak: false,
    audioAnnouncementsEnabled: defaultAudioAnnouncementsEnabled,
    voiceName: null,
    servingIndicatorEnabled: defaultServingIndicatorEnabled,
    countdownTimerEnabled: defaultCountdownTimerEnabled,
    countdownTimerDuration: defaultCountdownTimerDuration,
    sideSwitchPrompts: true
  })

  const [errors, setErrors] = useState<FieldErrors>({})

  // Update team name defaults when language changes (only if not touched by user)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      team1Name: team1Touched.current ? prev.team1Name : t('setup.teams.team1Default'),
      team2Name: team2Touched.current ? prev.team2Name : t('setup.teams.team2Default')
    }))
  }, [i18n.language, t])

  useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        const setupPreferences = await loadSetupPreferences()

        if (!isMounted) {
          return
        }

        if (setupPreferences) {
          lastPersistedSetupSlice.current = {
            audioAnnouncementsEnabled: setupPreferences.audioAnnouncementsEnabled,
            servingIndicatorEnabled: setupPreferences.servingIndicatorEnabled,
            countdownTimerEnabled: setupPreferences.countdownTimerEnabled,
            countdownTimerDuration: setupPreferences.countdownTimerDuration,
            sideSwitchPrompts: setupPreferences.sideSwitchPrompts,
            gameMode: setupPreferences.gameMode,
            decidingSetSuperTiebreak: setupPreferences.decidingSetSuperTiebreak
          }

          setFormData((prev) => ({
            ...prev,
            voiceName: setupPreferences.audioAnnouncementsEnabled
              ? setupPreferences.voiceName
              : null,
            audioAnnouncementsEnabled: setupPreferences.audioAnnouncementsEnabled,
            servingIndicatorEnabled: setupPreferences.servingIndicatorEnabled,
            countdownTimerEnabled: setupPreferences.countdownTimerEnabled,
            countdownTimerDuration: setupPreferences.countdownTimerDuration,
            sideSwitchPrompts: setupPreferences.sideSwitchPrompts,
            gameMode: setupPreferences.gameMode,
            decidingSetSuperTiebreak: setupPreferences.decidingSetSuperTiebreak
          }))
          return
        }

        lastPersistedSetupSlice.current = defaultPersistedSetupSlice
      } catch (error) {
        console.warn('[useSetupForm] Failed to load preferences, using defaults:', error)
      } finally {
        hasHydratedPersistedPreferences.current = true
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!hasHydratedPersistedPreferences.current) {
      return
    }

    const nextPersistedSetupSlice: SetupPreferenceSlice = {
      audioAnnouncementsEnabled: formData.audioAnnouncementsEnabled,
      servingIndicatorEnabled: formData.servingIndicatorEnabled,
      countdownTimerEnabled: formData.countdownTimerEnabled,
      countdownTimerDuration: formData.countdownTimerDuration,
      sideSwitchPrompts: formData.sideSwitchPrompts,
      gameMode: formData.gameMode,
      decidingSetSuperTiebreak: formData.decidingSetSuperTiebreak
    }

    if (areSetupPreferenceSlicesEqual(lastPersistedSetupSlice.current, nextPersistedSetupSlice)) {
      return
    }

    let isCancelled = false

    const persistSetupPreferences = async () => {
      try {
        await saveSetupPreferenceSlice(nextPersistedSetupSlice)

        if (!isCancelled) {
          lastPersistedSetupSlice.current = nextPersistedSetupSlice
        }
      } catch (error) {
        console.error('[useSetupForm] Failed to persist setup preferences:', error)
      }
    }

    void persistSetupPreferences()

    return () => {
      isCancelled = true
    }
  }, [
    formData.audioAnnouncementsEnabled,
    formData.countdownTimerDuration,
    formData.countdownTimerEnabled,
    formData.decidingSetSuperTiebreak,
    formData.gameMode,
    formData.servingIndicatorEnabled,
    formData.sideSwitchPrompts
  ])

  const updateField = useCallback(
    <K extends keyof SetupFormData>(field: K, value: SetupFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when field is updated (only for fields that have errors)
      setErrors((prev) => {
        if (!(field in prev)) {
          return prev
        }
        // Create a new object without the deleted key
        const { [field]: _, ...rest } = prev
        return rest as FieldErrors
      })
    },
    []
  )

  const updateTeamName = useCallback(
    (teamId: MatchTeamId, name: string) => {
      // Mark as touched when user modifies the name
      if (teamId === 'team-1') {
        team1Touched.current = true
        updateField('team1Name', name)
      } else {
        team2Touched.current = true
        updateField('team2Name', name)
      }
    },
    [updateField]
  )

  const updateFormat = useCallback(
    (format: MatchFormat) => {
      updateField('format', format)
    },
    [updateField]
  )

  const updateGameMode = useCallback(
    (gameMode: MatchGameMode) => {
      updateField('gameMode', gameMode)
    },
    [updateField]
  )

  const updateInitialServer = useCallback(
    (server: MatchTeamId) => {
      updateField('initialServer', server)
    },
    [updateField]
  )

  const updateDecidingSetSuperTiebreak = useCallback(
    (enabled: boolean) => {
      updateField('decidingSetSuperTiebreak', enabled)
    },
    [updateField]
  )

  const updateSideSwitchPrompts = useCallback(
    (enabled: boolean) => {
      updateField('sideSwitchPrompts', enabled)
    },
    [updateField]
  )

  const updateAudioAnnouncementsEnabled = useCallback(
    (enabled: boolean) => {
      updateField('audioAnnouncementsEnabled', enabled)
    },
    [updateField]
  )

  const updateVoiceName = useCallback(
    (voiceName: string | null) => {
      updateField('voiceName', voiceName)
    },
    [updateField]
  )

  const updateCountdownTimerEnabled = useCallback(
    (enabled: boolean) => {
      updateField('countdownTimerEnabled', enabled)
    },
    [updateField]
  )

  const updateServingIndicatorEnabled = useCallback(
    (enabled: boolean) => {
      updateField('servingIndicatorEnabled', enabled)
    },
    [updateField]
  )

  const updateCountdownTimerDuration = useCallback(
    (duration: CountdownTimerDuration) => {
      updateField('countdownTimerDuration', duration)
    },
    [updateField]
  )

  const validate = useCallback(() => {
    const result = validateSetupForm(formData)
    setErrors(result.errors)
    return result.isValid
  }, [formData])

  // Computed: is Golden Point enabled
  const isGoldenPointEnabled = formData.gameMode === 'golden-point'

  // Computed: should show Super Tiebreak option (only for best-of-3 and best-of-5)
  const showSuperTiebreakOption = formData.format !== 'best-of-1'

  return {
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
  }
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
    left.sideSwitchPrompts === right.sideSwitchPrompts &&
    left.gameMode === right.gameMode &&
    left.decidingSetSuperTiebreak === right.decidingSetSuperTiebreak
  )
}
