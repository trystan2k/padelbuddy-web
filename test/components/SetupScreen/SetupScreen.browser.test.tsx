import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-react';

import { SetupScreen } from '@/components/SetupScreen/SetupScreen';
import { createRemoteControllerBindings } from '@/lib/input/keyboard-aliases';
import {
  createDefaultRemoteControllerConfig,
  createKeyboardMappingConfig
} from '@/lib/input/remote-controller-config';
import { helpSpotlightSeenStorageKey } from '@/lib/user/help_spotlight_storage';

const {
  featureFlagState,
  mockClearSpeechPreferences,
  mockInvalidate,
  mockLoadSetupPreferences,
  mockLoadSpeechPreferences,
  mockNavigate,
  mockPreloadRoute,
  mockLoadRemoteControllerConfig,
  mockSaveSetupPreferenceSlice,
  mockSaveSpeechPreferences
} = vi.hoisted(() => ({
  featureFlagState: {
    ads: true,
    storeBadges: false
  },
  mockClearSpeechPreferences: vi.fn<() => Promise<void>>(),
  mockInvalidate: vi.fn<() => Promise<void>>(),
  mockLoadSetupPreferences: vi.fn<() => Promise<object | null>>(),
  mockLoadSpeechPreferences: vi.fn<() => Promise<object | null>>(),
  mockNavigate: vi.fn<(options: object) => void>(),
  mockPreloadRoute: vi.fn<() => Promise<void>>(),
  mockLoadRemoteControllerConfig: vi.fn<() => Promise<object>>(),
  mockSaveSetupPreferenceSlice: vi.fn<() => Promise<void>>(),
  mockSaveSpeechPreferences: vi.fn<() => Promise<void>>()
}));

vi.mock('@/config/feature-flags', () => ({
  getFeatureFlags: () => ({
    ads: featureFlagState.ads,
    storeBadges: featureFlagState.storeBadges
  })
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
    loadRemoteControllerConfigWithFallback: mockLoadRemoteControllerConfig
  };
});

vi.mock('@/lib/setup/setup-storage', () => ({
  defaultSetupPreferences: {
    muted: false,
    verbosity: 'standard',
    voiceName: null,
    team1Name: null,
    team2Name: null,
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
    featureFlagState.storeBadges = false;

    // Mark spotlight as seen so unrelated first-visit spotlight UI does not appear in these tests
    localStorage.setItem(helpSpotlightSeenStorageKey, 'true');
    mockLoadRemoteControllerConfig.mockResolvedValue(createDefaultRemoteControllerConfig());
    mockLoadSetupPreferences.mockResolvedValue(null);
    mockLoadSpeechPreferences.mockResolvedValue(null);
    mockSaveSetupPreferenceSlice.mockResolvedValue(undefined);
    mockSaveSpeechPreferences.mockResolvedValue(undefined);
    mockClearSpeechPreferences.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    featureFlagState.storeBadges = false;

    // Unmount React roots before shared.ts clears document.body.innerHTML.
    // Without this, React 19's async portal teardown races with the shared
    // cleanup and throws "removeChild: node is not a child of this node".
    await cleanup();
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

  test('renders store badges on web builds', async () => {
    featureFlagState.storeBadges = true;

    const screen = await render(<SetupScreen />);

    await expect.element(screen.getByTestId('store-link-android')).toBeInTheDocument();
    await expect.element(screen.getByTestId('store-link-ios')).toBeInTheDocument();
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

  test('places History in the left column and Setup remote link in the right column', async () => {
    const screen = await render(<SetupScreen />);

    const historyButton = screen.getByRole('button', { name: /^history$/i });
    const remoteButton = screen.getByRole('button', { name: /setup remote/i });
    const firstServerSection = screen.getByTestId('first-server-section');
    const rulesCard = screen.getByTestId('rules-card');

    expect(firstServerSection.element().parentElement).toBe(historyButton.element().parentElement);
    expect(firstServerSection.element().parentElement).not.toBe(
      remoteButton.element().parentElement
    );
    expect(rulesCard.element().contains(remoteButton.element())).toBe(true);
  });

  test('opens the remote configuration modal and shows unified rows by default', async () => {
    const screen = await render(<SetupScreen />);

    await screen.getByRole('button', { name: /setup remote/i }).click();

    await expect.element(screen.getByTestId('remote-configuration-modal')).toBeVisible();
    expect(mockLoadRemoteControllerConfig).toHaveBeenCalled();

    // Unified view shows four keyboard capture rows and media badges
    const captureButtons = document.querySelectorAll('[data-testid^="remote-binding-"]');
    expect(captureButtons.length).toBe(4);

    const mediaBadges = document.querySelectorAll(
      '[class*="mediaBadge"]:not([class*="Separator"]):not([class*="Label"])'
    );
    // 8 badges: 2 per row for revert rows (double icons) + 1 per row for add rows = 8 total
    expect(mediaBadges.length).toBe(8);

    await screen.getByRole('button', { name: /cancel/i }).click();

    // Wait for the modal portal to fully unmount before test cleanup
    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="remote-configuration-modal"]')).toBeNull();
    });
  });

  test('opens the remote configuration modal and loads saved keyboard bindings', async () => {
    mockLoadRemoteControllerConfig.mockResolvedValue(
      createKeyboardMappingConfig(createRemoteControllerBindings())
    );
    const screen = await render(<SetupScreen />);

    await screen.getByRole('button', { name: /setup remote/i }).click();

    await expect.element(screen.getByTestId('remote-configuration-modal')).toBeVisible();
    expect(mockLoadRemoteControllerConfig).toHaveBeenCalled();

    // Unified view shows saved keyboard bindings in capture buttons
    await expect
      .element(screen.getByTestId('remote-binding-add-team-1'))
      .toHaveTextContent('← Left');

    await screen.getByRole('button', { name: /cancel/i }).click();

    // Wait for the modal portal to fully unmount before shared.ts clears body
    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="remote-configuration-modal"]')).toBeNull();
    });
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
});
