import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { SetupScreen } from '@/components/SetupScreen/SetupScreen';
import {
  createEmptyRemoteControllerBindings,
  createRemoteControllerBindings
} from '@/lib/input/keyboard-aliases';

const {
  mockClearSpeechPreferences,
  mockInvalidate,
  mockLoadSetupPreferences,
  mockLoadSpeechPreferences,
  mockNavigate,
  mockPreloadRoute,
  mockLoadRemoteControllerBindings,
  mockSaveSetupPreferenceSlice,
  mockSaveSpeechPreferences
} = vi.hoisted(() => ({
  mockClearSpeechPreferences: vi.fn<() => Promise<void>>(),
  mockInvalidate: vi.fn<() => Promise<void>>(),
  mockLoadSetupPreferences: vi.fn<() => Promise<object | null>>(),
  mockLoadSpeechPreferences: vi.fn<() => Promise<object | null>>(),
  mockNavigate: vi.fn<(options: object) => void>(),
  mockPreloadRoute: vi.fn<() => Promise<void>>(),
  mockLoadRemoteControllerBindings: vi.fn<() => Promise<object>>(),
  mockSaveSetupPreferenceSlice: vi.fn<() => Promise<void>>(),
  mockSaveSpeechPreferences: vi.fn<() => Promise<void>>()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouter: () => ({
      invalidate: mockInvalidate,
      preloadRoute: mockPreloadRoute
    })
  };
});

vi.mock('@/lib/input/remote-controller-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/input/remote-controller-storage')>();

  return {
    ...actual,
    loadRemoteControllerBindingsWithFallback: mockLoadRemoteControllerBindings
  };
});

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
  saveSetupPreferenceSlice: mockSaveSetupPreferenceSlice,
  loadSpeechPreferences: mockLoadSpeechPreferences,
  saveSpeechPreferences: mockSaveSpeechPreferences,
  clearSpeechPreferences: mockClearSpeechPreferences
}));

vi.mock('@/components/SetupScreen/VoiceSelectionModal', () => ({
  VoiceSelectionModal: ({
    isOpen,
    onAccept
  }: {
    isOpen: boolean;
    onAccept: (voiceName: string) => void;
  }) =>
    isOpen ? (
      <div data-testid="voice-selection-modal">
        <button type="button" onClick={() => onAccept('Alex')}>
          Accept
        </button>
      </div>
    ) : null
}));

describe('SetupScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mark spotlight as seen to prevent overlay from blocking interactions
    localStorage.setItem('padelbuddy_help_spotlight_seen', '1');
    mockLoadRemoteControllerBindings.mockResolvedValue(createEmptyRemoteControllerBindings());
    mockLoadSetupPreferences.mockResolvedValue(null);
    mockLoadSpeechPreferences.mockResolvedValue(null);
    mockSaveSetupPreferenceSlice.mockResolvedValue(undefined);
    mockSaveSpeechPreferences.mockResolvedValue(undefined);
    mockClearSpeechPreferences.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    // Cleanup handled by shared.ts afterEach (document.body.innerHTML, restoreAllMocks)
  });

  test('renders countdown controls with the default disabled duration state', async () => {
    const screen = await render(<SetupScreen />);

    const countdownToggle = screen.getByRole('switch', { name: /countdown timer/i });
    const ninetyMinuteOption = screen.getByRole('radio', { name: '1:30 h' });
    const oneHourOption = screen.getByRole('radio', { name: '1:00 h' });
    const twoHourOption = screen.getByRole('radio', { name: '2:00 h' });

    await expect.element(countdownToggle).toHaveAttribute('aria-checked', 'false');
    await expect.element(ninetyMinuteOption).toHaveAttribute('aria-checked', 'true');
    await expect.element(oneHourOption).toBeDisabled();
    await expect.element(ninetyMinuteOption).toBeDisabled();
    await expect.element(twoHourOption).toBeDisabled();
  });

  test('shows audio announcements enabled by default before the golden point toggle', async () => {
    const screen = await render(<SetupScreen />);

    const audioAnnouncementsToggle = screen.getByRole('switch', { name: /audio announcements/i });
    const goldenPointToggle = screen.getByRole('switch', { name: /golden point/i });

    await expect.element(audioAnnouncementsToggle).toHaveAttribute('aria-checked', 'true');
    expect(
      audioAnnouncementsToggle.element().compareDocumentPosition(goldenPointToggle.element()) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test('keeps the rules card internally scrollable', async () => {
    const screen = await render(<SetupScreen />);

    const rulesCard = screen.getByTestId('rules-card');

    expect(getComputedStyle(rulesCard.element()).overflowY).toBe('auto');
  });

  test('enables duration selection when countdown is turned on', async () => {
    const screen = await render(<SetupScreen />);

    const countdownToggle = screen.getByRole('switch', { name: /countdown timer/i });
    const oneHourOption = screen.getByRole('radio', { name: '1:00 h' });
    const twoHourOption = screen.getByRole('radio', { name: '2:00 h' });

    countdownToggle.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect.element(countdownToggle).toHaveAttribute('aria-checked', 'true');
    await expect.element(oneHourOption).toBeEnabled();
    await expect.element(twoHourOption).toBeEnabled();

    await twoHourOption.click();

    await expect.element(twoHourOption).toHaveAttribute('aria-checked', 'true');
    await expect.element(oneHourOption).toHaveAttribute('aria-checked', 'false');
  });

  test('supports arrow key navigation across countdown duration radios', async () => {
    const screen = await render(<SetupScreen />);

    const countdownToggle = screen.getByRole('switch', { name: /countdown timer/i });
    const durationRow = screen.getByTestId('countdown-duration-row');
    const oneHourOption = screen.getByRole('radio', { name: '1:00 h' });
    const ninetyMinuteOption = screen.getByRole('radio', { name: '1:30 h' });
    const twoHourOption = screen.getByRole('radio', { name: '2:00 h' });

    countdownToggle.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect.element(ninetyMinuteOption).toHaveAttribute('tabindex', '0');
    await expect.element(oneHourOption).toHaveAttribute('tabindex', '-1');

    durationRow
      .element()
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect.element(twoHourOption).toHaveAttribute('aria-checked', 'true');
    await expect.element(twoHourOption).toHaveAttribute('tabindex', '0');

    durationRow
      .element()
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

    await expect.element(ninetyMinuteOption).toHaveAttribute('aria-checked', 'true');
    await expect.element(ninetyMinuteOption).toHaveAttribute('tabindex', '0');
  });

  test('dims and disables first server controls when serving indicator is turned off', async () => {
    const screen = await render(<SetupScreen />);

    const servingIndicatorToggle = screen.getByRole('switch', { name: /serving indicator/i });
    const firstServerSection = screen.getByTestId('first-server-section');
    const team1ServerButton = screen.getByRole('button', { name: /^team 1$/i });
    const team2ServerButton = screen.getByRole('button', { name: /^team 2$/i });

    servingIndicatorToggle.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect.element(servingIndicatorToggle).toHaveAttribute('aria-checked', 'false');
    expect(getComputedStyle(firstServerSection.element()).opacity).toBe('0.35');
    await expect.element(team1ServerButton).toBeDisabled();
    await expect.element(team2ServerButton).toBeDisabled();
  });

  test('preserves the first server selection while the serving indicator is off', async () => {
    const screen = await render(<SetupScreen />);

    const servingIndicatorToggle = screen.getByRole('switch', { name: /serving indicator/i });
    const team1ServerButton = screen.getByRole('button', { name: /^team 1$/i });
    const team2ServerButton = screen.getByRole('button', { name: /^team 2$/i });

    await team2ServerButton.click();
    await expect.element(team2ServerButton).toHaveAttribute('aria-pressed', 'true');

    servingIndicatorToggle.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await expect.element(team2ServerButton).toBeDisabled();

    servingIndicatorToggle.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await expect.element(team2ServerButton).toBeEnabled();
    await expect.element(team2ServerButton).toHaveAttribute('aria-pressed', 'true');
    await expect.element(team1ServerButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('places the remote configuration button below the first server controls in the left column', async () => {
    const screen = await render(<SetupScreen />);

    const button = screen.getByRole('button', { name: /remote configuration/i });
    const firstServerSection = screen.getByTestId('first-server-section');

    expect(firstServerSection.element().parentElement).toBe(button.element().parentElement);
    expect(
      firstServerSection.element().compareDocumentPosition(button.element()) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  test('opens the remote configuration modal and loads empty bindings when nothing is saved', async () => {
    const screen = await render(<SetupScreen />);

    await screen.getByRole('button', { name: /remote configuration/i }).click();

    await expect.element(screen.getByTestId('remote-configuration-modal')).toBeVisible();
    expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1);
    await expect
      .element(screen.getByTestId('remote-binding-add-team-1'))
      .toHaveTextContent('Not set');

    await screen.getByRole('button', { name: /cancel/i }).click();
  });

  test('opens the remote configuration modal and loads saved bindings', async () => {
    mockLoadRemoteControllerBindings.mockResolvedValue(createRemoteControllerBindings());
    const screen = await render(<SetupScreen />);

    await screen.getByRole('button', { name: /remote configuration/i }).click();

    await expect.element(screen.getByTestId('remote-configuration-modal')).toBeVisible();
    expect(mockLoadRemoteControllerBindings).toHaveBeenCalledTimes(1);
    await expect
      .element(screen.getByTestId('remote-binding-add-team-1'))
      .toHaveTextContent('← Left');

    await screen.getByRole('button', { name: /cancel/i }).click();
  });

  test('saves the selected voice through setup storage', async () => {
    const screen = await render(<SetupScreen />);

    await screen.getByRole('button', { name: /setup voice/i }).click();

    await expect.element(screen.getByTestId('voice-selection-modal')).toBeVisible();

    await screen.getByRole('button', { name: /^accept$/i }).click();

    await vi.waitFor(() => {
      expect(mockSaveSetupPreferenceSlice).toHaveBeenCalledWith({ voiceName: 'Alex' });
    });
  });

  test('shows first-visit help spotlight on setup screen', async () => {
    // Clear any existing spotlight seen state
    localStorage.removeItem('padelbuddy_help_spotlight_seen');

    const screen = await render(<SetupScreen />);

    // Wait for the spotlight to appear
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (!overlay) throw new Error('Spotlight overlay not found');
      },
      { timeout: 5000 }
    );

    // Verify the spotlight overlay is present
    const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeInTheDocument();

    // Verify the dismiss button is present
    const dismissButton = screen.getByTestId('spotlight-dismiss');
    expect(dismissButton).toBeInTheDocument();
  });
});
