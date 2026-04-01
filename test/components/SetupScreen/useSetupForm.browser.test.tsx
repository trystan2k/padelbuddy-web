/* oxlint-disable jsx-no-new-function-as-prop -- Test files use inline functions for readability */
/* oxlint-disable button-has-type -- Test buttons don't need type attribute */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { useSetupForm } from '@/components/SetupScreen/useSetupForm'

const { mockLoadSetupPreferences, mockSaveSetupPreferenceSlice } = vi.hoisted(() => ({
  mockLoadSetupPreferences: vi.fn(),
  mockSaveSetupPreferenceSlice: vi.fn()
}))

vi.mock('@/lib/setup/setup-storage', () => ({
  defaultSetupPreferences: {
    muted: false,
    verbosity: 'standard',
    voiceName: null,
    audioAnnouncementsEnabled: true,
    servingIndicatorEnabled: true,
    countdownTimerEnabled: false,
    countdownTimerDuration: 90,
    sideSwitchPrompts: true,
    gameMode: 'advantage',
    decidingSetSuperTiebreak: false
  },
  loadSetupPreferences: mockLoadSetupPreferences,
  saveSetupPreferenceSlice: mockSaveSetupPreferenceSlice
}))

// Wrapper component to test the hook
function SetupFormTester({
  onStateChange
}: {
  onStateChange: (state: ReturnType<typeof useSetupForm>) => void
}) {
  const formState = useSetupForm()
  onStateChange(formState)
  return <div data-testid="form-tester">Test</div>
}

describe('useSetupForm', () => {
  let capturedState: ReturnType<typeof useSetupForm> | null = null

  beforeEach(() => {
    capturedState = null
    mockLoadSetupPreferences.mockReset()
    mockSaveSetupPreferenceSlice.mockReset()
    mockLoadSetupPreferences.mockResolvedValue(null)
    mockSaveSetupPreferenceSlice.mockResolvedValue(undefined)
  })

  test('initializes with default values', async () => {
    const screen = await render(
      <SetupFormTester
        onStateChange={(state) => {
          capturedState = state
        }}
      />
    )

    await expect.element(screen.getByTestId('form-tester')).toBeInTheDocument()

    // Uses actual i18n translations from browser setup
    expect(capturedState!.formData.team1Name).toBe('Team A')
    expect(capturedState!.formData.team2Name).toBe('Team B')
    expect(capturedState!.formData.format).toBe('best-of-3')
    expect(capturedState!.formData.gameMode).toBe('advantage')
    expect(capturedState!.formData.initialServer).toBe('team-1')
    expect(capturedState!.formData.decidingSetSuperTiebreak).toBe(false)
    expect(capturedState!.formData.audioAnnouncementsEnabled).toBe(true)
    expect(capturedState!.formData.servingIndicatorEnabled).toBe(true)
    expect(capturedState!.formData.countdownTimerEnabled).toBe(false)
    expect(capturedState!.formData.countdownTimerDuration).toBe(90)
    expect(capturedState!.formData.sideSwitchPrompts).toBe(true)
  })

  test('initializes with empty errors', async () => {
    const screen = await render(
      <SetupFormTester
        onStateChange={(state) => {
          capturedState = state
        }}
      />
    )

    await expect.element(screen.getByTestId('form-tester')).toBeInTheDocument()

    expect(capturedState!.errors).toEqual({})
  })

  test('isGoldenPointEnabled returns false for advantage mode', async () => {
    const screen = await render(
      <SetupFormTester
        onStateChange={(state) => {
          capturedState = state
        }}
      />
    )

    await expect.element(screen.getByTestId('form-tester')).toBeInTheDocument()

    expect(capturedState!.isGoldenPointEnabled).toBe(false)
  })

  test('showSuperTiebreakOption returns true for best-of-3 (default)', async () => {
    const screen = await render(
      <SetupFormTester
        onStateChange={(state) => {
          capturedState = state
        }}
      />
    )

    await expect.element(screen.getByTestId('form-tester')).toBeInTheDocument()

    expect(capturedState!.showSuperTiebreakOption).toBe(true)
  })

  test('hydrates the approved persisted setup preferences', async () => {
    mockLoadSetupPreferences.mockResolvedValue({
      muted: true,
      verbosity: 'verbose',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: true,
      servingIndicatorEnabled: false,
      countdownTimerEnabled: true,
      countdownTimerDuration: 120,
      sideSwitchPrompts: false,
      gameMode: 'golden-point',
      decidingSetSuperTiebreak: true
    })

    const screen = await render(
      <SetupFormTester
        onStateChange={(state) => {
          capturedState = state
        }}
      />
    )

    await expect.element(screen.getByTestId('form-tester')).toBeInTheDocument()

    await vi.waitFor(() => {
      expect(capturedState?.formData.voiceName).toBe('Alex')
      expect(capturedState?.formData.audioAnnouncementsEnabled).toBe(true)
      expect(capturedState?.formData.servingIndicatorEnabled).toBe(false)
      expect(capturedState?.formData.countdownTimerEnabled).toBe(true)
      expect(capturedState?.formData.countdownTimerDuration).toBe(120)
      expect(capturedState?.formData.sideSwitchPrompts).toBe(false)
      expect(capturedState?.formData.gameMode).toBe('golden-point')
      expect(capturedState?.formData.decidingSetSuperTiebreak).toBe(true)
    })

    expect(mockSaveSetupPreferenceSlice).not.toHaveBeenCalled()
  })

  test('does not hydrate the stored voice when audio announcements are disabled', async () => {
    mockLoadSetupPreferences.mockResolvedValue({
      muted: false,
      verbosity: 'standard',
      voiceName: 'Alex',
      audioAnnouncementsEnabled: false,
      servingIndicatorEnabled: true,
      countdownTimerEnabled: false,
      countdownTimerDuration: 90,
      sideSwitchPrompts: true,
      gameMode: 'advantage',
      decidingSetSuperTiebreak: false
    })

    const screen = await render(
      <SetupFormTester
        onStateChange={(state) => {
          capturedState = state
        }}
      />
    )

    await expect.element(screen.getByTestId('form-tester')).toBeInTheDocument()

    await vi.waitFor(() => {
      expect(capturedState?.formData.audioAnnouncementsEnabled).toBe(false)
      expect(capturedState?.formData.voiceName).toBeNull()
    })
  })

  test('falls back to defaults and still saves after persisted setup hydration fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockLoadSetupPreferences.mockRejectedValue(new Error('load failed'))

    try {
      const screen = await render(<SetupFormController />)

      await expect.element(screen.getByTestId('update-side-switch-false')).toBeInTheDocument()

      await vi.waitFor(() => {
        expect(mockLoadSetupPreferences).toHaveBeenCalledTimes(1)
      })

      expect(warnSpy).toHaveBeenCalledWith(
        '[useSetupForm] Failed to load preferences, using defaults:',
        expect.any(Error)
      )
      expect(screen.getByTestId('state').element().textContent).toContain(
        '"audioAnnouncementsEnabled":true'
      )
      expect(screen.getByTestId('state').element().textContent).toContain('"gameMode":"advantage"')
      expect(screen.getByTestId('state').element().textContent).toContain('"voiceName":null')
      expect(mockSaveSetupPreferenceSlice).not.toHaveBeenCalled()

      await screen.getByTestId('update-side-switch-false').click()

      await vi.waitFor(() => {
        expect(mockSaveSetupPreferenceSlice).toHaveBeenLastCalledWith({
          audioAnnouncementsEnabled: true,
          servingIndicatorEnabled: true,
          countdownTimerEnabled: false,
          countdownTimerDuration: 90,
          sideSwitchPrompts: false,
          gameMode: 'advantage',
          decidingSetSuperTiebreak: false
        })
      })
    } finally {
      warnSpy.mockRestore()
    }
  })
})

// Interactive test component for testing state changes
function SetupFormController({
  onGetState
}: {
  onGetState?: (form: ReturnType<typeof useSetupForm>) => void
}) {
  const formState = useSetupForm()

  return (
    <div>
      <button
        data-testid="update-team1"
        onClick={() => {
          formState.updateTeamName('team-1', 'Alpha Team')
        }}
      >
        Update Team 1
      </button>
      <button
        data-testid="update-team2"
        onClick={() => {
          formState.updateTeamName('team-2', 'Beta Team')
        }}
      >
        Update Team 2
      </button>
      <button
        data-testid="update-format-bo5"
        onClick={() => {
          formState.updateFormat('best-of-5')
        }}
      >
        Format BO5
      </button>
      <button
        data-testid="update-format-bo1"
        onClick={() => {
          formState.updateFormat('best-of-1')
        }}
      >
        Format BO1
      </button>
      <button
        data-testid="update-golden-point"
        onClick={() => {
          formState.updateGameMode('golden-point')
        }}
      >
        Golden Point
      </button>
      <button
        data-testid="update-advantage"
        onClick={() => {
          formState.updateGameMode('advantage')
        }}
      >
        Advantage
      </button>
      <button
        data-testid="update-server-team2"
        onClick={() => {
          formState.updateInitialServer('team-2')
        }}
      >
        Server Team 2
      </button>
      <button
        data-testid="update-super-tiebreak-true"
        onClick={() => {
          formState.updateDecidingSetSuperTiebreak(true)
        }}
      >
        Super Tiebreak ON
      </button>
      <button
        data-testid="update-super-tiebreak-false"
        onClick={() => {
          formState.updateDecidingSetSuperTiebreak(false)
        }}
      >
        Super Tiebreak OFF
      </button>
      <button
        data-testid="update-side-switch-false"
        onClick={() => {
          formState.updateSideSwitchPrompts(false)
        }}
      >
        Side Switch OFF
      </button>
      <button
        data-testid="update-side-switch-true"
        onClick={() => {
          formState.updateSideSwitchPrompts(true)
        }}
      >
        Side Switch ON
      </button>
      <button
        data-testid="update-audio-announcements-enabled"
        onClick={() => {
          formState.updateAudioAnnouncementsEnabled(true)
        }}
      >
        Audio ON
      </button>
      <button
        data-testid="update-audio-announcements-disabled"
        onClick={() => {
          formState.updateAudioAnnouncementsEnabled(false)
        }}
      >
        Audio OFF
      </button>
      <button
        data-testid="update-serving-indicator-enabled"
        onClick={() => {
          formState.updateServingIndicatorEnabled(true)
        }}
      >
        Serving Indicator ON
      </button>
      <button
        data-testid="update-serving-indicator-disabled"
        onClick={() => {
          formState.updateServingIndicatorEnabled(false)
        }}
      >
        Serving Indicator OFF
      </button>
      <button
        data-testid="update-countdown-enabled"
        onClick={() => {
          formState.updateCountdownTimerEnabled(true)
        }}
      >
        Countdown ON
      </button>
      <button
        data-testid="update-countdown-disabled"
        onClick={() => {
          formState.updateCountdownTimerEnabled(false)
        }}
      >
        Countdown OFF
      </button>
      <button
        data-testid="update-countdown-duration-60"
        onClick={() => {
          formState.updateCountdownTimerDuration(60)
        }}
      >
        Countdown 60
      </button>
      <button
        data-testid="update-countdown-duration-120"
        onClick={() => {
          formState.updateCountdownTimerDuration(120)
        }}
      >
        Countdown 120
      </button>
      <button
        data-testid="validate"
        onClick={() => {
          formState.validate()
        }}
      >
        Validate
      </button>
      <button
        data-testid="clear-team1"
        onClick={() => {
          formState.updateTeamName('team-1', '')
        }}
      >
        Clear Team 1
      </button>
      <button
        data-testid="clear-team2"
        onClick={() => {
          formState.updateTeamName('team-2', '')
        }}
      >
        Clear Team 2
      </button>
      <button data-testid="get-state" onClick={() => onGetState?.(formState)}>
        Get State
      </button>
      <div data-testid="state">{JSON.stringify(formState.formData)}</div>
      <div data-testid="errors">{JSON.stringify(formState.errors)}</div>
      <div data-testid="is-golden">{String(formState.isGoldenPointEnabled)}</div>
      <div data-testid="show-super">{String(formState.showSuperTiebreakOption)}</div>
    </div>
  )
}

describe('useSetupForm interactions', () => {
  let formState: ReturnType<typeof useSetupForm> | null = null

  beforeEach(() => {
    formState = null
    mockLoadSetupPreferences.mockReset()
    mockSaveSetupPreferenceSlice.mockReset()
    mockLoadSetupPreferences.mockResolvedValue(null)
    mockSaveSetupPreferenceSlice.mockResolvedValue(undefined)
  })

  test('updateTeamName updates team-1 name', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-team1').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.team1Name).toBe('Alpha Team')
  })

  test('updateTeamName updates team-2 name', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-team2').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.team2Name).toBe('Beta Team')
  })

  test('updateFormat updates match format', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-format-bo5').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.format).toBe('best-of-5')
  })

  test('updateGameMode updates game mode', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-golden-point').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.gameMode).toBe('golden-point')
  })

  test('updateInitialServer updates initial server', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-server-team2').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.initialServer).toBe('team-2')
  })

  test('updateDecidingSetSuperTiebreak updates value to true', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-super-tiebreak-true').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.decidingSetSuperTiebreak).toBe(true)
  })

  test('updateDecidingSetSuperTiebreak updates value to false', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-super-tiebreak-true').click()
    await screen.getByTestId('update-super-tiebreak-false').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.decidingSetSuperTiebreak).toBe(false)
  })

  test('updateSideSwitchPrompts updates value to false', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-side-switch-false').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.sideSwitchPrompts).toBe(false)
  })

  test('validate returns true for valid form', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('validate').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.errors).toEqual({})
  })

  test('updateServingIndicatorEnabled updates value to false', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-serving-indicator-disabled').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.servingIndicatorEnabled).toBe(false)
  })

  test('updateAudioAnnouncementsEnabled updates value to false', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-audio-announcements-disabled').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.audioAnnouncementsEnabled).toBe(false)
  })

  test('updateCountdownTimerEnabled updates value to true', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-countdown-enabled').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.countdownTimerEnabled).toBe(true)
  })

  test('updateCountdownTimerDuration updates value', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('update-countdown-duration-120').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.formData.countdownTimerDuration).toBe(120)
  })

  test('validate returns false when team1Name is empty', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('clear-team1').click()
    await screen.getByTestId('validate').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.errors.team1Name).toBe('setup.validation.teamNamesRequired')
  })

  test('validate returns false when team2Name is empty', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await screen.getByTestId('clear-team2').click()
    await screen.getByTestId('validate').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.errors.team2Name).toBe('setup.validation.teamNamesRequired')
  })

  test('isGoldenPointEnabled returns true for golden-point mode', async () => {
    const screen = await render(<SetupFormController />)

    await screen.getByTestId('update-golden-point').click()

    await expect.element(screen.getByTestId('is-golden')).toHaveTextContent('true')
  })

  test('showSuperTiebreakOption returns false for best-of-1', async () => {
    const screen = await render(<SetupFormController />)

    await screen.getByTestId('update-format-bo1').click()

    await expect.element(screen.getByTestId('show-super')).toHaveTextContent('false')
  })

  test('showSuperTiebreakOption returns true for best-of-5', async () => {
    const screen = await render(<SetupFormController />)

    await screen.getByTestId('update-format-bo5').click()

    await expect.element(screen.getByTestId('show-super')).toHaveTextContent('true')
  })

  test('updating team name clears existing error', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    // Make form invalid
    await screen.getByTestId('clear-team1').click()
    await screen.getByTestId('validate').click()
    await screen.getByTestId('get-state').click()

    expect(formState!.errors.team1Name).toBeDefined()

    // Fix the field
    await screen.getByTestId('update-team1').click()
    await screen.getByTestId('get-state').click()

    // Error should be cleared
    expect(formState!.errors.team1Name).toBeUndefined()
  })

  test('persists approved setup toggles after hydration completes', async () => {
    const screen = await render(
      <SetupFormController
        onGetState={(s) => {
          formState = s
        }}
      />
    )

    await vi.waitFor(() => {
      expect(mockLoadSetupPreferences).toHaveBeenCalledTimes(1)
    })

    expect(mockSaveSetupPreferenceSlice).not.toHaveBeenCalled()

    await screen.getByTestId('update-side-switch-false').click()
    await screen.getByTestId('update-golden-point').click()
    await screen.getByTestId('update-super-tiebreak-true').click()

    await vi.waitFor(() => {
      expect(mockSaveSetupPreferenceSlice).toHaveBeenLastCalledWith({
        audioAnnouncementsEnabled: true,
        servingIndicatorEnabled: true,
        countdownTimerEnabled: false,
        countdownTimerDuration: 90,
        sideSwitchPrompts: false,
        gameMode: 'golden-point',
        decidingSetSuperTiebreak: true
      })
    })
  })
})
