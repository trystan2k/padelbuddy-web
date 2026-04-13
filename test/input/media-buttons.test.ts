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
    test('maps volume-up to add-team-1', () => {
      expect(mediaButtonMapping['media-volume-up']).toBe('add-team-1');
    });

    test('maps volume-down to revert-team-1', () => {
      expect(mediaButtonMapping['media-volume-down']).toBe('revert-team-1');
    });

    test('maps track-next to add-team-2', () => {
      expect(mediaButtonMapping['media-track-next']).toBe('add-team-2');
    });

    test('maps track-previous to revert-team-2', () => {
      expect(mediaButtonMapping['media-track-previous']).toBe('revert-team-2');
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

    test('returns volume-up row with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const volumeUp = rows[0]!;

      expect(volumeUp.buttonId).toBe('media-volume-up');
      expect(volumeUp.action).toBe('add-team-1');
      expect(volumeUp.buttonLabel).toBe('setup.remoteConfig.mediaButtons.volumeUp');
      expect(volumeUp.actionLabel).toBe('setup.remoteConfig.actions.addTeam1');
      expect(volumeUp.hint).toBe('setup.remoteConfig.rows.singlePressHint');
      expect(volumeUp.shortLabel).toBe('setup.remoteConfig.mediaButtons.volumeUpShort');
    });

    test('returns volume-down row with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const volumeDown = rows[1]!;

      expect(volumeDown.buttonId).toBe('media-volume-down');
      expect(volumeDown.action).toBe('revert-team-1');
      expect(volumeDown.buttonLabel).toBe('setup.remoteConfig.mediaButtons.volumeDown');
      expect(volumeDown.actionLabel).toBe('setup.remoteConfig.actions.revertTeam1');
      expect(volumeDown.hint).toBe('setup.remoteConfig.rows.guardedUndoHint');
      expect(volumeDown.shortLabel).toBe('setup.remoteConfig.mediaButtons.volumeDownShort');
    });

    test('returns track-next row with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const trackNext = rows[2]!;

      expect(trackNext.buttonId).toBe('media-track-next');
      expect(trackNext.action).toBe('add-team-2');
      expect(trackNext.buttonLabel).toBe('setup.remoteConfig.mediaButtons.nextTrack');
      expect(trackNext.actionLabel).toBe('setup.remoteConfig.actions.addTeam2');
      expect(trackNext.hint).toBe('setup.remoteConfig.rows.singlePressHint');
      expect(trackNext.shortLabel).toBe('setup.remoteConfig.mediaButtons.nextTrackShort');
    });

    test('returns track-previous row with correct button ID, action, and short label', () => {
      const rows = getMediaButtonDisplayInfo(t);
      const trackPrev = rows[3]!;

      expect(trackPrev.buttonId).toBe('media-track-previous');
      expect(trackPrev.action).toBe('revert-team-2');
      expect(trackPrev.buttonLabel).toBe('setup.remoteConfig.mediaButtons.previousTrack');
      expect(trackPrev.actionLabel).toBe('setup.remoteConfig.actions.revertTeam2');
      expect(trackPrev.hint).toBe('setup.remoteConfig.rows.guardedUndoHint');
      expect(trackPrev.shortLabel).toBe('setup.remoteConfig.mediaButtons.previousTrackShort');
    });

    test('passes the translation function through for each label', () => {
      const calls: string[] = [];
      const trackingT = (key: string) => {
        calls.push(key);

        return key;
      };

      getMediaButtonDisplayInfo(trackingT);

      expect(calls).toContain('setup.remoteConfig.mediaButtons.volumeUp');
      expect(calls).toContain('setup.remoteConfig.mediaButtons.volumeDown');
      expect(calls).toContain('setup.remoteConfig.mediaButtons.nextTrack');
      expect(calls).toContain('setup.remoteConfig.mediaButtons.previousTrack');
    });
  });
});
