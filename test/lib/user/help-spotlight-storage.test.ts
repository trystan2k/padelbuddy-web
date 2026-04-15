import { afterEach, describe, expect, it, vi } from 'vitest';

import { isHelpSpotlightSeen, markHelpSpotlightSeen } from '@/lib/user/help_spotlight_storage';

describe('help_spotlight_storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fails closed when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(isHelpSpotlightSeen()).toBe(true);
    expect(() => markHelpSpotlightSeen()).not.toThrow();
  });

  it('returns true only when seen marker is persisted', () => {
    const getItem = vi.fn<(key: string) => string | null>();
    const setItem = vi.fn<(key: string, value: string) => void>();

    getItem.mockReturnValueOnce(null).mockReturnValueOnce('1');

    vi.stubGlobal('localStorage', {
      getItem,
      setItem
    });

    expect(isHelpSpotlightSeen()).toBe(false);
    expect(isHelpSpotlightSeen()).toBe(true);

    markHelpSpotlightSeen();

    expect(setItem).toHaveBeenCalledWith('padelbuddy_help_spotlight_seen', '1');
  });

  it('fails closed when localStorage access throws', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockImplementation(() => {
      throw new Error('storage read failed');
    });
    const setItem = vi.fn<(key: string, value: string) => void>().mockImplementation(() => {
      throw new Error('storage write failed');
    });

    vi.stubGlobal('localStorage', {
      getItem,
      setItem
    });

    expect(isHelpSpotlightSeen()).toBe(true);
    expect(() => markHelpSpotlightSeen()).not.toThrow();
  });
});
