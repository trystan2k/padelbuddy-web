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
} from '@/core/match'

import type { SetupFormData, FieldErrors } from './types'
import { validateSetupForm } from './validateSetupForm'

export function useSetupForm() {
  const { t, i18n } = useTranslation()

  // Track whether team names have been manually modified by the user
  const team1Touched = useRef(false)
  const team2Touched = useRef(false)

  // Initialize form with defaults
  const [formData, setFormData] = useState<SetupFormData>({
    team1Name: t('setup.teams.team1Default'),
    team2Name: t('setup.teams.team2Default'),
    format: defaultMatchFormat,
    gameMode: defaultGameMode,
    initialServer: defaultInitialServer,
    decidingSetSuperTiebreak: false,
    audioAnnouncementsEnabled: defaultAudioAnnouncementsEnabled,
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
    updateSideSwitchPrompts,
    updateServingIndicatorEnabled,
    updateCountdownTimerEnabled,
    updateCountdownTimerDuration,
    isGoldenPointEnabled,
    showSuperTiebreakOption
  }
}
