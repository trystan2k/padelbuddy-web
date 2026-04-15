import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';

import { RemoteConfigurationModal } from '@/components/SetupScreen/RemoteConfigurationModal';
import { createEmptyRemoteControllerBindings } from '@/lib/input/keyboard-aliases';
import type { RemoteControllerConfig } from '@/lib/input/remote-controller-storage';

const { mockLoadRemoteControllerConfig, mockSaveRemoteControllerConfig } = vi.hoisted(() => ({
  mockLoadRemoteControllerConfig: vi.fn<() => Promise<RemoteControllerConfig>>(),
  mockSaveRemoteControllerConfig: vi.fn<(config: RemoteControllerConfig) => Promise<void>>()
}));

const { addErrorToast, addSuccessToast } = vi.hoisted(() => ({
  addErrorToast: vi.fn<(title: string) => void>(),
  addSuccessToast: vi.fn<(title: string) => void>()
}));

const { translations } = vi.hoisted(() => ({
  translations: {
    'setup.remoteConfig.title': 'Remote control',
    'setup.remoteConfig.description': 'Configure your remote shortcuts.',
    'setup.remoteConfig.actions.clear': 'Clear',
    'setup.remoteConfig.actions.resetDefaults': 'Reset defaults',
    'setup.remoteConfig.actions.cancel': 'Cancel',
    'setup.remoteConfig.actions.save': 'Save',
    'setup.remoteConfig.actions.addTeam1': 'Team 1 +',
    'setup.remoteConfig.actions.revertTeam1': 'Team 1 -',
    'setup.remoteConfig.actions.addTeam2': 'Team 2 +',
    'setup.remoteConfig.actions.revertTeam2': 'Team 2 -',
    'setup.remoteConfig.rows.addPointHint': 'Add point hint',
    'setup.remoteConfig.rows.revertPointHint': 'Revert point hint',
    'setup.remoteConfig.notSet': 'Not set',
    'setup.remoteConfig.listening': 'Listening…',
    'setup.remoteConfig.feedback.loadError': 'Unable to load remote configuration.',
    'setup.remoteConfig.feedback.saveSuccess': 'Configuration saved.',
    'setup.remoteConfig.feedback.saveError': 'Unable to save configuration.',
    'setup.remoteConfig.feedback.resetSuccess': 'Defaults restored.',
    'setup.remoteConfig.mediaButtons.notConfigurable': 'Not configurable'
  } as const
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => translations[key as keyof typeof translations] ?? key
    })
  };
});

vi.mock('@/components/ui/Toast/useToast', () => ({
  useToast: () => ({
    addErrorToast,
    addSuccessToast,
    addToast: vi.fn<(title: string, options?: unknown) => void>(),
    addInfoToast: vi.fn<(title: string, options?: unknown) => void>(),
    toastManager: {
      add: vi.fn<(toast: unknown) => void>(),
      remove: vi.fn<(toastId: unknown) => void>(),
      subscribe: vi.fn<(listener: unknown) => () => void>()
    }
  })
}));

vi.mock('@/lib/input/remote-controller-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/input/remote-controller-storage')>();

  return {
    ...actual,
    loadRemoteControllerConfigWithFallback: mockLoadRemoteControllerConfig,
    saveRemoteControllerConfig: mockSaveRemoteControllerConfig
  };
});

const defaultConfig = {
  mode: 'keyboard-mapping' as const,
  keyboardBindings: createEmptyRemoteControllerBindings(),
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const findButton = (label: string) =>
  Array.from(document.querySelectorAll('button')).find(
    (button) => button.textContent?.trim().toLowerCase() === label.toLowerCase()
  ) ?? null;

describe('ConfigurationModal.spec', () => {
  let renderResult: RenderResult | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadRemoteControllerConfig.mockResolvedValue(defaultConfig);
    mockSaveRemoteControllerConfig.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    if (renderResult) {
      await renderResult.unmount();
      renderResult = null;
    }
  });

  test('renders default view when open', async () => {
    renderResult = await render(
      <RemoteConfigurationModal isOpen={true} onClose={vi.fn<() => void>()} />
    );

    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="remote-configuration-modal"]')).toBeVisible();
    });

    expect(document.body.textContent).toContain('Remote');

    const saveButton = document.querySelector('button:last-of-type');
    expect(saveButton).not.toBeNull();

    const captureButtons = document.querySelectorAll('[data-testid^="remote-binding-"]');
    expect(captureButtons.length).toBe(4);
  });

  test('shows an error message when initial loading fails', async () => {
    mockLoadRemoteControllerConfig.mockRejectedValueOnce(new Error('boom'));

    renderResult = await render(
      <RemoteConfigurationModal isOpen={true} onClose={vi.fn<() => void>()} />
    );

    await vi.waitFor(() => {
      expect(addErrorToast).toHaveBeenCalledTimes(1);
      expect(addErrorToast).toHaveBeenCalledWith(expect.stringMatching(/remote/i));
    });

    expect(document.body.textContent).toContain('Not set');
  });

  test('shows action buttons and triggers callbacks when clicked', async () => {
    const onClose = vi.fn<() => void>();
    const onSaved = vi.fn<(config: RemoteControllerConfig) => void>();

    renderResult = await render(
      <RemoteConfigurationModal isOpen={true} onClose={onClose} onSaved={onSaved} />
    );

    await vi.waitFor(() => {
      expect(findButton('clear')).not.toBeNull();
      expect(findButton('reset defaults')).not.toBeNull();
      expect(findButton('cancel')).not.toBeNull();
      expect(findButton('save')).not.toBeNull();
    });

    findButton('reset defaults')?.click();
    expect(addSuccessToast).toHaveBeenCalledTimes(1);

    findButton('save')?.click();

    await vi.waitFor(() => {
      expect(mockSaveRemoteControllerConfig).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
