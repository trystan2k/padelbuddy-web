import { afterEach, describe, expect, it, vi } from 'vitest';

import { getOrCreateUserId } from '@/lib/user/id';

describe('user id storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns ssr marker when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(getOrCreateUserId()).toBe('ssr');
  });

  it('returns an existing stored id when available', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue('stored-user-id');
    const setItem = vi.fn<(key: string, value: string) => void>();

    vi.stubGlobal('localStorage', { getItem, setItem });

    expect(getOrCreateUserId()).toBe('stored-user-id');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('creates and persists a new id when storage is empty', () => {
    const getItem = vi.fn<(key: string) => string | null>().mockReturnValue(null);
    const setItem = vi.fn<(key: string, value: string) => void>();

    vi.stubGlobal('localStorage', { getItem, setItem });
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn<() => string>().mockReturnValue('generated-user-id')
    });

    expect(getOrCreateUserId()).toBe('generated-user-id');
    expect(setItem).toHaveBeenCalledWith('padelbuddy_user_id', 'generated-user-id');
  });
});
