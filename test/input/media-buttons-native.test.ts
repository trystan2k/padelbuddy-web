import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  buttonIdToTeamId,
  dispatchNativeMediaButton,
  listenToNativeMediaButtons
} from '@/lib/input/media-buttons-native';

const mockIsNativePlatform = vi.fn<() => boolean>();
const mockAddListener =
  vi.fn<
    (eventName: string, callback: (event: unknown) => void) => Promise<{ remove: () => void }>
  >();

// Mutable plugins object so tests can add/remove MediaButtons at runtime
const mockPlugins: Record<string, unknown> = {
  MediaButtons: {
    addListener: (eventName: string, callback: (event: unknown) => void) =>
      mockAddListener(eventName, callback),
    dispatchButton: vi.fn<(...args: unknown[]) => Promise<void>>()
  }
};

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNativePlatform(),
    get Plugins() {
      return mockPlugins;
    }
  }
}));

describe('media-buttons-native', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buttonIdToTeamId', () => {
    test('maps media-volume-up to team-1', () => {
      expect(buttonIdToTeamId('media-volume-up')).toBe('team-1');
    });

    test('maps media-volume-down to team-1', () => {
      expect(buttonIdToTeamId('media-volume-down')).toBe('team-1');
    });

    test('maps media-track-next to team-2', () => {
      expect(buttonIdToTeamId('media-track-next')).toBe('team-2');
    });

    test('maps media-track-previous to team-2', () => {
      expect(buttonIdToTeamId('media-track-previous')).toBe('team-2');
    });

    test('returns null for unknown button ID', () => {
      expect(buttonIdToTeamId('unknown-button')).toBeNull();
    });
  });

  describe('listenToNativeMediaButtons', () => {
    test('returns a no-op cleanup when not on a native platform', () => {
      mockIsNativePlatform.mockReturnValue(false);

      const callback = vi.fn<() => void>();
      const cleanup = listenToNativeMediaButtons(callback);

      expect(typeof cleanup).toBe('function');
      // Calling cleanup should not throw
      cleanup();
    });

    test('returns a no-op cleanup when MediaButtons plugin is not available', () => {
      mockIsNativePlatform.mockReturnValue(true);

      // Temporarily remove MediaButtons from Plugins
      const saved = mockPlugins['MediaButtons'];
      delete mockPlugins['MediaButtons'];

      const callback = vi.fn<() => void>();
      const cleanup = listenToNativeMediaButtons(callback);

      expect(typeof cleanup).toBe('function');
      expect(mockAddListener).not.toHaveBeenCalled();

      // Calling cleanup should not throw
      cleanup();

      // Restore MediaButtons for subsequent tests
      mockPlugins['MediaButtons'] = saved;
    });

    test('registers a listener and returns a cleanup function on native platform', async () => {
      mockIsNativePlatform.mockReturnValue(true);

      const mockRemove = vi.fn<() => void>();
      mockAddListener.mockResolvedValue({ remove: mockRemove });

      const callback = vi.fn<() => void>();
      const cleanup = listenToNativeMediaButtons(callback);

      // Wait for async addListener
      await vi.waitFor(() => {
        expect(mockAddListener).toHaveBeenCalledWith('mediaButton', expect.any(Function));
      });

      // Simulate a native event for volume up
      const listenerCallback = mockAddListener.mock.calls[0]![1] as (event: {
        buttonId: string;
      }) => void;
      listenerCallback({ buttonId: 'media-volume-up' });

      expect(callback).toHaveBeenCalledWith('add-team-1');

      // Cleanup removes the subscription
      cleanup();
      await vi.waitFor(() => {
        expect(mockRemove).toHaveBeenCalled();
      });
    });

    test('ignores unknown button IDs from native events', async () => {
      mockIsNativePlatform.mockReturnValue(true);

      const mockRemove = vi.fn<() => void>();
      mockAddListener.mockResolvedValue({ remove: mockRemove });

      const callback = vi.fn<() => void>();
      listenToNativeMediaButtons(callback);

      await vi.waitFor(() => {
        expect(mockAddListener).toHaveBeenCalled();
      });

      const listenerCallback = mockAddListener.mock.calls[0]![1] as (event: {
        buttonId: string;
      }) => void;
      listenerCallback({ buttonId: 'unknown-button' });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('dispatchNativeMediaButton', () => {
    test('does nothing when not on a native platform', async () => {
      mockIsNativePlatform.mockReturnValue(false);

      await dispatchNativeMediaButton('media-volume-up');

      // Should not throw and should not call any native method
    });
  });
});
