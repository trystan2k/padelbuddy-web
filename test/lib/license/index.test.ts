import { describe, expect, test, vi } from 'vitest';

import { isAppAllowed, LicenseStatusValues } from '@/lib/license';

const mockCapacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn<() => boolean>()
}));

vi.mock('@capacitor/core', () => mockCapacitor);

describe('license lib', () => {
  describe('isAppAllowed', () => {
    test('allows when licensed', () => {
      expect(
        isAppAllowed({
          status: LicenseStatusValues.LICENSED,
          isLicensed: true,
          isGraceActive: false
        })
      ).toBe(true);
    });

    test('allows when grace period active', () => {
      expect(
        isAppAllowed({ status: LicenseStatusValues.ERROR, isLicensed: false, isGraceActive: true })
      ).toBe(true);
    });

    test('blocks when not licensed and no grace', () => {
      expect(
        isAppAllowed({
          status: LicenseStatusValues.NOT_LICENSED,
          isLicensed: false,
          isGraceActive: false
        })
      ).toBe(false);
    });
  });
});
