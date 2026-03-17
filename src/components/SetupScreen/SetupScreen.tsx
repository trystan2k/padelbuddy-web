import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'

import { createMatchSetup, matchFormats, type MatchFormat } from '@/core/match'
import { saveCurrentMatch } from '@/lib/current-match'
import {
  changeLocale,
  isSupportedLocale,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  supportedLocales,
  type SupportedLocale
} from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

import { Layout } from '@/components/Layout'
import {
  Card,
  Divider,
  LocaleChip,
  PrimaryButton,
  SelectableChip,
  SectionLabel,
  TextInput,
  Toggle
} from '@/components/ui'

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

export function SetupScreen() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const rawLocale = i18n.resolvedLanguage || i18n.language
  const currentLocale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : 'en'
  const [isStarting, setIsStarting] = useState(false)
  const [showLocaleMenu, setShowLocaleMenu] = useState(false)

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
    isGoldenPointEnabled,
    showSuperTiebreakOption
  } = useSetupForm()

  const hasErrors = Object.keys(errors).length > 0

  const handleLocaleChange = useCallback(
    async (locale: SupportedLocale) => {
      if (locale !== currentLocale) {
        await changeLocale(locale)
        // i18n.language will update reactively, causing a re-render
      }
      setShowLocaleMenu(false)
    },
    [currentLocale]
  )

  const handleStartMatch = useCallback(async () => {
    if (!validate()) {
      return
    }

    setIsStarting(true)

    try {
      // Create match setup input
      const setupInput = {
        format: formData.format,
        gameMode: formData.gameMode,
        initialServer: formData.initialServer,
        decidingSetSuperTiebreak: formData.decidingSetSuperTiebreak,
        sideSwitchPrompts: formData.sideSwitchPrompts,
        sides: [
          { id: 'team-1' as const, playerNames: [formData.team1Name] },
          { id: 'team-2' as const, playerNames: [formData.team2Name] }
        ]
      } satisfies Parameters<typeof createMatchSetup>[0]

      // Create validated match setup
      const setup = createMatchSetup(setupInput)

      // Persist match state to IndexedDB before navigation
      await saveCurrentMatch({ setup, actions: [], startedAt: Date.now() })

      // Generate match ID and navigate
      const matchId = generateMatchId()
      await navigate({ to: '/match/$id', params: { id: matchId } })
    } catch (error) {
      console.error('Failed to start match:', error)
      setIsStarting(false)
    }
  }, [formData, validate, navigate])

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

  // Stable handler for locale menu toggle
  const handleToggleLocaleMenu = useCallback(() => {
    setShowLocaleMenu((prev) => !prev)
  }, [])

  // Handler factory for format selection (returns stable handler per format)
  const createFormatClickHandler = useCallback(
    (format: MatchFormat) => () => {
      handleFormatChange(format)
    },
    [handleFormatChange]
  )

  // Handler factory for locale selection (returns stable handler per locale)
  const createLocaleClickHandler = useCallback(
    (locale: SupportedLocale) => () => {
      void handleLocaleChange(locale)
    },
    [handleLocaleChange]
  )

  // Header content
  const headerContent = (
    <>
      <div className={styles.headerBrand}>
        <div className={styles.titleRow}>
          <img alt="" aria-hidden="true" className={styles.headerIcon} src="/icon.png" />
          <h1 className={styles.appName}>{t('setup.header.appName')}</h1>
        </div>
        <p className={styles.headerSubtitle}>{t('setup.header.subtitle')}</p>
      </div>
      <div className={styles.localeWrapper}>
        <LocaleChip
          flag={LOCALE_FLAGS[currentLocale]}
          label={LOCALE_LABELS[currentLocale]}
          onClick={handleToggleLocaleMenu}
          active
          aria-expanded={showLocaleMenu}
          {...(showLocaleMenu && { 'aria-controls': 'locale-menu' })}
        />
        {showLocaleMenu && (
          <div
            id="locale-menu"
            className={styles.localeMenu}
            role="group"
            aria-label={t('setup.locale.selectLanguage')}
          >
            {supportedLocales.map((locale) => (
              <LocaleChip
                key={locale}
                flag={LOCALE_FLAGS[locale]}
                label={LOCALE_LABELS[locale]}
                onClick={createLocaleClickHandler(locale)}
                active={locale === currentLocale}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )

  // Footer content
  const footerContent = (
    <PrimaryButton onClick={handleStartMatch} disabled={isStarting || hasErrors}>
      {t('setup.startButton')}
    </PrimaryButton>
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
          <SectionLabel>{t('setup.firstServer.label')}</SectionLabel>
          <div className={styles.serverRow}>
            <SelectableChip
              selected={formData.initialServer === 'team-1'}
              onClick={handleTeam1ServerSelect}
              accent="primary"
              showDot
            >
              <span
                className={cn(
                  styles.serverChipText,
                  formData.initialServer === 'team-1'
                    ? styles.serverChipTextSelected
                    : styles.serverChipTextUnselected
                )}
              >
                {t('setup.firstServer.team1')}
              </span>
            </SelectableChip>
            <SelectableChip
              selected={formData.initialServer === 'team-2'}
              onClick={handleTeam2ServerSelect}
              accent="secondary"
              showDot
            >
              <span
                className={cn(
                  styles.serverChipText,
                  formData.initialServer === 'team-2'
                    ? styles.serverChipTextSelected
                    : styles.serverChipTextUnselected
                )}
              >
                {t('setup.firstServer.team2')}
              </span>
            </SelectableChip>
          </div>
        </div>

        {/* Right column - Options */}
        <div className={styles.rightColumn}>
          {/* Match Format */}
          <SectionLabel>{t('setup.format.label')}</SectionLabel>
          <div className={styles.formatRow}>
            {matchFormats.map((format) => (
              <SelectableChip
                key={format}
                selected={formData.format === format}
                onClick={createFormatClickHandler(format)}
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
              </SelectableChip>
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

            {/* Super Tiebreak - only for best-of-3 and best-of-5 */}
            {showSuperTiebreakOption && (
              <>
                <Toggle
                  checked={formData.decidingSetSuperTiebreak}
                  onChange={updateDecidingSetSuperTiebreak}
                  label={t('setup.rules.superTiebreak')}
                  hint={t('setup.rules.superTiebreakHint')}
                />
                <Divider />
              </>
            )}

            {/* Side Switch Prompts */}
            <Toggle
              checked={formData.sideSwitchPrompts}
              onChange={updateSideSwitchPrompts}
              label={t('setup.rules.sideSwitch')}
              hint={t('setup.rules.sideSwitchHint')}
            />
          </Card>
        </div>
      </div>
    </Layout>
  )
}
