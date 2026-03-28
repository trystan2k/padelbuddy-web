import { useState, useCallback, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useRouter } from '@tanstack/react-router'

import {
  countdownTimerDurations,
  createMatchSetup,
  matchFormats,
  type CountdownTimerDuration,
  type MatchFormat
} from '@/core/match'
import { saveCurrentMatch } from '@/lib/current-match'
import { prepareCurrentMatchRouteNavigation } from '@/lib/router/current-match-route-flow'
import { cn } from '@/lib/utils/cn'
import { getViewTransitionNavigationOptions } from '@/lib/utils/view-transitions'

import { Layout } from '@/components/Layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Divider } from '@/components/ui/Divider'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextInput } from '@/components/ui/TextInput'
import { Toggle } from '@/components/ui/Toggle'
import { TopBar } from '@/components/ui/TopBar'
import { LocaleSelector } from '@/components/ui/LocaleSelector'

import { RemoteConfigurationModal } from './RemoteConfigurationModal'
import { useSetupForm } from './useSetupForm'
import styles from './SetupScreen.module.css'

// Generate a URL-safe match ID
function generateMatchId(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Format key mapping for translations
const formatKeys: Record<MatchFormat, string> = {
  'best-of-1': 'bestOf1',
  'best-of-3': 'bestOf3',
  'best-of-5': 'bestOf5'
}

const countdownDurationKeys: Record<CountdownTimerDuration, string> = {
  60: 'setup.rules.countdownDuration.oneHour',
  90: 'setup.rules.countdownDuration.ninetyMinutes',
  120: 'setup.rules.countdownDuration.twoHours'
}

export function SetupScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [isRemoteConfigurationOpen, setIsRemoteConfigurationOpen] = useState(false)

  const {
    formData,
    errors,
    validate,
    updateTeamName,
    updateFormat,
    updateGameMode,
    updateInitialServer,
    updateDecidingSetSuperTiebreak,
    updateSideSwitchPrompts,
    updateServingIndicatorEnabled,
    updateCountdownTimerEnabled,
    updateCountdownTimerDuration,
    isGoldenPointEnabled,
    showSuperTiebreakOption
  } = useSetupForm()

  const hasErrors = Object.keys(errors).length > 0

  const handleStartMatch = useCallback(async () => {
    if (!validate()) {
      return
    }

    setIsStarting(true)

    try {
      const matchId = generateMatchId()

      // Create match setup input
      const setupInput = {
        format: formData.format,
        gameMode: formData.gameMode,
        initialServer: formData.initialServer,
        decidingSetSuperTiebreak: formData.decidingSetSuperTiebreak,
        servingIndicatorEnabled: formData.servingIndicatorEnabled,
        countdownTimerEnabled: formData.countdownTimerEnabled,
        countdownTimerDuration: formData.countdownTimerDuration,
        sideSwitchPrompts: formData.sideSwitchPrompts,
        sides: [
          { id: 'team-1' as const, playerNames: [formData.team1Name] },
          { id: 'team-2' as const, playerNames: [formData.team2Name] }
        ]
      } satisfies Parameters<typeof createMatchSetup>[0]

      // Create validated match setup
      const setup = createMatchSetup(setupInput)

      // Persist match state to IndexedDB before navigation
      await saveCurrentMatch({ matchId, setup, actions: [], startedAt: Date.now() })
      await prepareCurrentMatchRouteNavigation(router, {
        to: '/match/$id',
        params: { id: matchId }
      })

      // Navigate to active match route
      await navigate({
        to: '/match/$id',
        params: { id: matchId },
        ...getViewTransitionNavigationOptions()
      })
    } catch (error) {
      console.error('Failed to start match:', error)
      setIsStarting(false)
    }
  }, [formData, navigate, router, validate])

  const handleFormatChange = useCallback(
    (format: MatchFormat) => {
      updateFormat(format)
      // Reset super tiebreak when switching to best-of-1
      if (format === 'best-of-1') {
        updateDecidingSetSuperTiebreak(false)
      }
    },
    [updateFormat, updateDecidingSetSuperTiebreak]
  )

  const handleGoldenPointChange = useCallback(
    (enabled: boolean) => {
      updateGameMode(enabled ? 'golden-point' : 'advantage')
    },
    [updateGameMode]
  )

  // Stable handlers for team name inputs
  const handleTeam1NameChange = useCallback(
    (value: string) => {
      updateTeamName('team-1', value)
    },
    [updateTeamName]
  )

  const handleTeam2NameChange = useCallback(
    (value: string) => {
      updateTeamName('team-2', value)
    },
    [updateTeamName]
  )

  // Stable handlers for initial server selection
  const handleTeam1ServerSelect = useCallback(() => {
    updateInitialServer('team-1')
  }, [updateInitialServer])

  const handleTeam2ServerSelect = useCallback(() => {
    updateInitialServer('team-2')
  }, [updateInitialServer])

  const createCountdownDurationSelectHandler = useCallback(
    (duration: CountdownTimerDuration) => () => {
      updateCountdownTimerDuration(duration)
    },
    [updateCountdownTimerDuration]
  )

  const handleOpenRemoteConfiguration = useCallback(() => {
    setIsRemoteConfigurationOpen(true)
  }, [])

  const handleCloseRemoteConfiguration = useCallback(() => {
    setIsRemoteConfigurationOpen(false)
  }, [])

  const handleCountdownDurationKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!formData.countdownTimerEnabled) {
        return
      }

      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return
      }

      event.preventDefault()

      const currentIndex = countdownTimerDurations.indexOf(formData.countdownTimerDuration)
      const nextIndex =
        event.key === 'ArrowRight'
          ? (currentIndex + 1) % countdownTimerDurations.length
          : (currentIndex - 1 + countdownTimerDurations.length) % countdownTimerDurations.length
      const nextDuration = countdownTimerDurations[nextIndex]

      if (typeof nextDuration === 'undefined') {
        return
      }

      updateCountdownTimerDuration(nextDuration)
      event.currentTarget
        .querySelector<HTMLButtonElement>(`[data-duration="${nextDuration}"]`)
        ?.focus()
    },
    [formData.countdownTimerDuration, formData.countdownTimerEnabled, updateCountdownTimerDuration]
  )

  // Handler factory for format selection (returns stable handler per format)
  const createFormatClickHandler = useCallback(
    (format: MatchFormat) => () => {
      handleFormatChange(format)
    },
    [handleFormatChange]
  )

  // Header content
  const headerContent = useMemo(
    () => (
      <TopBar
        iconSrc="/icon.png"
        iconAlt=""
        title={t('app.title')}
        subtitle={t('setup.header.subtitle')}
      >
        <LocaleSelector />
      </TopBar>
    ),
    [t]
  )

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
  )

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
            className={styles.remoteConfigurationButton}
            variant="outline"
            size="lg"
            accent="secondary"
            onClick={handleOpenRemoteConfiguration}
          >
            {t('setup.remoteConfig.trigger')}
          </Button>
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
          <Card className={styles.rulesCard}>
            {/* Golden Point */}
            <Toggle
              checked={isGoldenPointEnabled}
              onChange={handleGoldenPointChange}
              label={t('setup.rules.goldenPoint')}
              hint={t('setup.rules.goldenPointHint')}
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

            <Toggle
              checked={formData.servingIndicatorEnabled}
              onChange={updateServingIndicatorEnabled}
              label={t('setup.rules.servingIndicator')}
              hint={t('setup.rules.servingIndicatorHint')}
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
              >
                {countdownTimerDurations.map((duration) => {
                  const isSelected = formData.countdownTimerDuration === duration

                  return (
                    <button
                      key={duration}
                      type="button"
                      role="radio"
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
                  )
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
      />
    </Layout>
  )
}
