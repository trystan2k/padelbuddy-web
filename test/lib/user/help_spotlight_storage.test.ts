import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  helpSpotlightSeenStorageKey,
  hasHelpSpotlightBeenSeen,
  markHelpSpotlightSeen
} from '@/lib/user/help_spotlight_storage';

describe('help spotlight storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns false when storage is empty', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue(null);
    const setItem = vi.fn<(key: string, value: string) => void>();

    vi.stubGlobal('localStorage', { getItem, setItem });

    expect(hasHelpSpotlightBeenSeen()).toBe(false);
  });

  it('supports the legacy "1" storage value', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue('1');
    const setItem = vi.fn<(key: string, value: string) => void>();

    vi.stubGlobal('localStorage', { getItem, setItem });

    expect(hasHelpSpotlightBeenSeen()).toBe(true);
  });

  it('supports the current "true" storage value', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue('true');
    const setItem = vi.fn<(key: string, value: string) => void>();

    vi.stubGlobal('localStorage', { getItem, setItem });

    expect(hasHelpSpotlightBeenSeen()).toBe(true);
  });

  it('returns true when storage is unavailable or throws', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(hasHelpSpotlightBeenSeen()).toBe(true);

    vi.unstubAllGlobals();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn<(key: string) => string | null>().mockImplementation(() => {
        throw new Error('storage read failed');
      }),
      setItem: vi.fn<(key: string, value: string) => void>()
    });

    expect(hasHelpSpotlightBeenSeen()).toBe(true);
  });

  it('writes the current storage value when marking as seen', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue(null);
    const setItem = vi.fn<(key: string, value: string) => void>();

    vi.stubGlobal('localStorage', { getItem, setItem });

    markHelpSpotlightSeen();

    expect(setItem).toHaveBeenCalledWith(helpSpotlightSeenStorageKey, 'true');
  });

  it('swallows storage errors when marking as seen', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue(null);
    const setItem = vi.fn<(key: string, value: string) => void>().mockImplementation(() => {
      throw new Error('storage write failed');
    });

    vi.stubGlobal('localStorage', { getItem, setItem });

    expect(() => markHelpSpotlightSeen()).not.toThrow();
  });
});
