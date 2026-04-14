import { useCallback, useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';

import { RemoteConfigurationModal } from '@/components/SetupScreen/RemoteConfigurationModal';
import {
  createDefaultRemoteControllerConfig,
  createKeyboardMappingConfig
} from '@/lib/input/remote-controller-config';
import { createRemoteControllerBindings } from '@/lib/input/keyboard-aliases';

const { mockLoadRemoteControllerConfig, mockSaveRemoteControllerConfig } = vi.hoisted(() => ({
  mockLoadRemoteControllerConfig: vi.fn<() => Promise<object>>(),
  mockSaveRemoteControllerConfig: vi.fn<() => Promise<void>>()
}));

vi.mock('@/lib/input/remote-controller-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/input/remote-controller-storage')>();

  return {
    ...actual,
    loadRemoteControllerConfigWithFallback: mockLoadRemoteControllerConfig,
    saveRemoteControllerConfig: mockSaveRemoteControllerConfig
  };
});

/**
 * Wrapper that manages isOpen state so the portal unmounts properly on close.
 */
function ModalWrapper() {
  const [isOpen, setIsOpen] = useState(true);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return <RemoteConfigurationModal isOpen={isOpen} onClose={handleClose} />;
}

function getModal() {
  return document.querySelector<HTMLElement>('[data-testid="remote-configuration-modal"]');
}

function queryInModal(selector: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(selector);
}

describe('RemoteConfigurationModal', () => {
  let renderResult: RenderResult | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadRemoteControllerConfig.mockResolvedValue(createDefaultRemoteControllerConfig());
    mockSaveRemoteControllerConfig.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    // Ensure the modal portal is cleaned up before shared.ts clears body
    if (renderResult) {
      await renderResult.unmount();
      renderResult = null;
    }

    // Wait a tick for React to unmount portals
    vi.restoreAllMocks();
  });

  async function openAndVerify() {
    renderResult = await render(<ModalWrapper />);
    const modal = getModal();

    if (modal) {
      await vi.waitFor(() => {
        expect(modal).toBeVisible();
      });
    }

    return renderResult;
  }

  describe('unified row display', () => {
    test('shows four unified rows with action labels', async () => {
      await openAndVerify();

      const rows = queryInModal('[class*="rowText"]');
      expect(rows.length).toBe(4);
    });

    test('each row has a keyboard capture button', async () => {
      await openAndVerify();

      const captureButtons = queryInModal('[data-testid^="remote-binding-"]');
      expect(captureButtons.length).toBe(4);

      // Verify each action has a capture button
      const expectedActions = ['add-team-1', 'revert-team-1', 'add-team-2', 'revert-team-2'];

      for (const action of expectedActions) {
        const button = document.querySelector(`[data-testid="remote-binding-${action}"]`);
        expect(button).not.toBeNull();
      }
    });

    test('each row has a media badge with aria-label for accessibility', async () => {
      await openAndVerify();

      // Use a selector that matches .mediaBadge but not .mediaBadgeSeparator or .mediaBadgeLabel
      const mediaBadges = document.querySelectorAll(
        '[class*="mediaBadge"]:not([class*="Separator"]):not([class*="Label"])'
      );
      // 8 badges: 4 rows, each row has 1 badge (revert rows have double icons but single badge span)
      expect(mediaBadges.length).toBe(8);

      // Verify badge aria-labels contain the expected short label text (for screen readers)
      const badgeAriaLabels = Array.from(mediaBadges).map((badge) =>
        badge.getAttribute('aria-label')
      );
      // previous track labels contain <<
      expect(badgeAriaLabels.some((label) => label?.includes('<<'))).toBe(true);
      // next track labels contain >>
      expect(badgeAriaLabels.some((label) => label?.includes('>>'))).toBe(true);

      // Verify textContent is empty or just '+' for double-press badges (icon only, no visible text)
      const badgeTexts = Array.from(mediaBadges).map((badge) => badge.textContent?.trim());
      expect(badgeTexts.every((text) => text === '' || text === null || text === '+')).toBe(true);
    });

    test('media badges are read-only spans, not buttons', async () => {
      await openAndVerify();

      const mediaBadges = document.querySelectorAll(
        '[class*="mediaBadge"]:not([class*="Separator"]):not([class*="Label"])'
      );

      for (const badge of Array.from(mediaBadges)) {
        expect(badge.tagName).toBe('SPAN');
      }
    });

    test('each row has a separator between capture button and media badge', async () => {
      await openAndVerify();

      const separators = queryInModal('[class*="mediaBadgeSeparator"]');
      expect(separators.length).toBe(4);

      for (const separator of Array.from(separators)) {
        expect(separator.textContent).toBe('/');
      }
    });

    test('capture buttons show "Not set" when no keyboard binding is configured', async () => {
      await openAndVerify();

      const captureButtons = queryInModal('[data-testid^="remote-binding-"]');

      for (const button of Array.from(captureButtons)) {
        expect(button.textContent).toContain('Not set');
      }
    });

    test('capture buttons show binding labels when keyboard bindings exist', async () => {
      mockLoadRemoteControllerConfig.mockResolvedValue(
        createKeyboardMappingConfig(createRemoteControllerBindings())
      );

      await openAndVerify();

      const addTeam1Binding = document.querySelector<HTMLElement>(
        '[data-testid="remote-binding-add-team-1"]'
      );
      expect(addTeam1Binding?.textContent).toContain('← Left');

      const revertTeam1Binding = document.querySelector<HTMLElement>(
        '[data-testid="remote-binding-revert-team-1"]'
      );
      expect(revertTeam1Binding?.textContent).toContain('Backspace');
    });
  });

  describe('keyboard capture', () => {
    test('enters listening mode when a capture button is clicked', async () => {
      await openAndVerify();

      const captureButton = document.querySelector<HTMLElement>(
        '[data-testid="remote-binding-add-team-1"]'
      );
      expect(captureButton).not.toBeNull();
      captureButton!.click();

      await vi.waitFor(() => {
        expect(captureButton!.textContent).toContain('Listening');
      });
    });

    test('captures a key press and shows the binding label', async () => {
      await openAndVerify();

      // Click capture button for add-team-1
      const captureButton = document.querySelector<HTMLElement>(
        '[data-testid="remote-binding-add-team-1"]'
      );
      captureButton!.click();

      await vi.waitFor(() => {
        expect(captureButton!.textContent).toContain('Listening');
      });

      // Simulate pressing 'Enter'
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      await vi.waitFor(() => {
        expect(captureButton!.textContent).toContain('Enter');
        expect(captureButton!.textContent).not.toContain('Listening');
      });
    });

    test('ignores modifier-only key presses during capture', async () => {
      await openAndVerify();

      const captureButton = document.querySelector<HTMLElement>(
        '[data-testid="remote-binding-add-team-1"]'
      );
      captureButton!.click();

      await vi.waitFor(() => {
        expect(captureButton!.textContent).toContain('Listening');
      });

      // Press a modifier key — should still be listening
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }));

      // Should still be in listening mode
      expect(captureButton!.textContent).toContain('Listening');
    });
  });

  describe('save behavior', () => {
    test('saves the config when save is clicked', async () => {
      const onClose = vi.fn<() => void>();

      renderResult = await render(<RemoteConfigurationModal isOpen={true} onClose={onClose} />);

      await vi.waitFor(() => {
        expect(getModal()).not.toBeNull();
      });

      const saveButton = Array.from(document.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Save')
      );
      expect(saveButton).not.toBeNull();
      saveButton!.click();

      await vi.waitFor(() => {
        expect(mockSaveRemoteControllerConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            keyboardBindings: expect.any(Object)
          })
        );
      });
    });

    test('saves config with captured key binding', async () => {
      const onClose = vi.fn<() => void>();

      renderResult = await render(<RemoteConfigurationModal isOpen={true} onClose={onClose} />);

      await vi.waitFor(() => {
        expect(getModal()).not.toBeNull();
      });

      // Capture a key for add-team-1
      const captureButton = document.querySelector<HTMLElement>(
        '[data-testid="remote-binding-add-team-1"]'
      );
      captureButton!.click();

      await vi.waitFor(() => {
        expect(captureButton!.textContent).toContain('Listening');
      });

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      await vi.waitFor(() => {
        expect(captureButton!.textContent).toContain('Enter');
      });

      // Save
      const saveButton = Array.from(document.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Save')
      );
      saveButton!.click();

      await vi.waitFor(() => {
        expect(mockSaveRemoteControllerConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            keyboardBindings: expect.objectContaining({
              'add-team-1': 'Enter'
            })
          })
        );
      });
    });
  });

  describe('close behavior', () => {
    test('calls onClose when cancel is clicked', async () => {
      const onClose = vi.fn<() => void>();

      renderResult = await render(<RemoteConfigurationModal isOpen={true} onClose={onClose} />);

      await vi.waitFor(() => {
        expect(getModal()).not.toBeNull();
      });

      const cancelButton = Array.from(document.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Cancel')
      );
      cancelButton!.click();

      expect(onClose).toHaveBeenCalled();
    });

    test('does not save when cancel is clicked', async () => {
      const onClose = vi.fn<() => void>();

      renderResult = await render(<RemoteConfigurationModal isOpen={true} onClose={onClose} />);

      await vi.waitFor(() => {
        expect(getModal()).not.toBeNull();
      });

      const cancelButton = Array.from(document.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Cancel')
      );
      cancelButton!.click();

      expect(mockSaveRemoteControllerConfig).not.toHaveBeenCalled();
    });
  });

  describe('footer', () => {
    test('shows Cancel, Save, Clear, and Reset Defaults buttons', async () => {
      await openAndVerify();

      const allButtons = document.querySelectorAll('button');
      const buttonTexts = Array.from(allButtons).map((btn) => btn.textContent);

      // Should NOT have mode tabs
      expect(buttonTexts.some((text) => text?.includes('Media Buttons'))).toBe(false);
      expect(buttonTexts.some((text) => text?.includes('Keyboard Mapping'))).toBe(false);

      // Should have Cancel, Save, Clear, and Reset Defaults
      expect(buttonTexts.some((text) => text?.includes('Cancel'))).toBe(true);
      expect(buttonTexts.some((text) => text?.includes('Save'))).toBe(true);
      expect(buttonTexts.some((text) => text?.includes('Clear'))).toBe(true);
      expect(buttonTexts.some((text) => text?.includes('Reset Defaults'))).toBe(true);
    });
  });
});
