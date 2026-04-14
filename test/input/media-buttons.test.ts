import { describe, expect, test } from 'vitest';

import {
  actionToTeamId,
  getMediaButtonDisplayInfo,
  isAddAction,
  isRevertAction,
  mediaButtonMapping
} from '@/lib/input/media-buttons';

// Translation function for testing getMediaButtonDisplayInfo
const t = (key: string) => key;

describe('media-buttons', () => {
  describe('mediaButtonMapping', () => {
    test('maps track-previous to add-team-1', () => {
      expect(mediaButtonMapping['media-track-previous']).toBe('add-team-1');
    });

    test('maps track-next to add-team-2', () => {
      expect(mediaButtonMapping['media-track-next']).toBe('add-team-2');
    });
  });

  describe('actionToTeamId', () => {
    test('returns team-1 for add-team-1', () => {
      expect(actionToTeamId('add-team-1')).toBe('team-1');
    });

    test('returns team-1 for revert-team-1', () => {
      expect(actionToTeamId('revert-team-1')).toBe('team-1');
    });

    test('returns team-2 for add-team-2', () => {
      expect(actionToTeamId('add-team-2')).toBe('team-2');
    });

    test('returns team-2 for revert-team-2', () => {
      expect(actionToTeamId('revert-team-2')).toBe('team-2');
    });
  });

  describe('isAddAction', () => {
    test('returns true for add-team-1', () => {
      expect(isAddAction('add-team-1')).toBe(true);
    });

    test('returns true for add-team-2', () => {
      expect(isAddAction('add-team-2')).toBe(true);
    });

    test('returns false for revert-team-1', () => {
      expect(isAddAction('revert-team-1')).toBe(false);
    });

    test('returns false for revert-team-2', () => {
      expect(isAddAction('revert-team-2')).toBe(false);
    });
  });

  describe('isRevertAction', () => {
    test('returns true for revert-team-1', () => {
      expect(isRevertAction('revert-team-1')).toBe(true);
    });

    test('returns true for revert-team-2', () => {
      expect(isRevertAction('revert-team-2')).toBe(true);
    });

    test('returns false for add-team-1', () => {
      expect(isRevertAction('add-team-1')).toBe(false);
    });

    test('returns false for add-team-2', () => {
      expect(isRevertAction('add-team-2')).toBe(false);
    });
  });

  describe('getMediaButtonDisplayInfo', () => {
    test('returns exactly four rows', () => {
      const rows = getMediaButtonDisplayInfo(t);
      expect(rows).toHaveLength(4);
    });

    test('returns track-previous row (add) with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const addPrev = rows[0]!;

      expect(addPrev.buttonId).toBe('media-track-previous');
      expect(addPrev.action).toBe('add-team-1');
      expect(addPrev.buttonLabel).toBe('setup.remoteConfig.mediaButtons.previousTrack');
      expect(addPrev.actionLabel).toBe('setup.remoteConfig.actions.addTeam1');
      expect(addPrev.hint).toBe('setup.remoteConfig.rows.addPointHint');
      expect(addPrev.shortLabel).toBe('setup.remoteConfig.mediaButtons.previousTrackShort');
    });

    test('returns track-previous row (revert) with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const revertPrev = rows[1]!;

      expect(revertPrev.buttonId).toBe('media-track-previous-double');
      expect(revertPrev.action).toBe('revert-team-1');
      expect(revertPrev.buttonLabel).toBe('setup.remoteConfig.mediaButtons.previousTrackDouble');
      expect(revertPrev.actionLabel).toBe('setup.remoteConfig.actions.revertTeam1');
      expect(revertPrev.hint).toBe('setup.remoteConfig.rows.revertPointHint');
      expect(revertPrev.shortLabel).toBe(
        'setup.remoteConfig.mediaButtons.previousTrackShortDouble'
      );
    });

    test('returns track-next row (add) with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const addNext = rows[2]!;

      expect(addNext.buttonId).toBe('media-track-next');
      expect(addNext.action).toBe('add-team-2');
      expect(addNext.buttonLabel).toBe('setup.remoteConfig.mediaButtons.nextTrack');
      expect(addNext.actionLabel).toBe('setup.remoteConfig.actions.addTeam2');
      expect(addNext.hint).toBe('setup.remoteConfig.rows.addPointHint');
      expect(addNext.shortLabel).toBe('setup.remoteConfig.mediaButtons.nextTrackShort');
    });

    test('returns track-next row (revert) with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const revertNext = rows[3]!;

      expect(revertNext.buttonId).toBe('media-track-next-double');
      expect(revertNext.action).toBe('revert-team-2');
      expect(revertNext.buttonLabel).toBe('setup.remoteConfig.mediaButtons.nextTrackDouble');
      expect(revertNext.actionLabel).toBe('setup.remoteConfig.actions.revertTeam2');
      expect(revertNext.hint).toBe('setup.remoteConfig.rows.revertPointHint');
      expect(revertNext.shortLabel).toBe('setup.remoteConfig.mediaButtons.nextTrackShortDouble');
    });

    test('passes the translation function through for each label', () => {
      const calls: string[] = [];
      const trackingT = (key: string) => {
        calls.push(key);

        return key;
      };

      getMediaButtonDisplayInfo(trackingT);

      expect(calls).toContain('setup.remoteConfig.mediaButtons.previousTrack');
      expect(calls).toContain('setup.remoteConfig.mediaButtons.nextTrack');
    });
  });
});
