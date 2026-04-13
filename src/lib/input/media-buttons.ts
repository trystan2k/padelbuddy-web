/**
 * Fixed Media Buttons mapping for remote control scoring.
 *
 * Button          | Action
 * ----------------|----------------
 * Volume Up       | Score Team A
 * Volume Down     | Revert Team A
 * Next Track     | Score Team B
 * Previous Track | Revert Team B
 */

import type { MatchTeamId } from '@/core/match/types';

/**
 * Semantic actions exposed by the media buttons adapter.
 */
export type MediaButtonAction = 'add-team-1' | 'revert-team-1' | 'add-team-2' | 'revert-team-2';

/**
 * Mapping from media button identifier to the semantic action.
 */
export const mediaButtonMapping: Record<string, MediaButtonAction> = {
  'media-volume-up': 'add-team-1',
  'media-volume-down': 'revert-team-1',
  'media-track-next': 'add-team-2',
  'media-track-previous': 'revert-team-2'
};

/**
 * Display metadata for media buttons in the configuration UI.
 */
export type MediaButtonIconName = 'volume-up' | 'volume-down' | 'skip-forward' | 'skip-back';

/**
 * Display metadata for media buttons in the configuration UI.
 */
interface MediaButtonDisplayInfo {
  buttonId: string;
  buttonLabel: string;
  shortLabel: string;
  iconName: MediaButtonIconName;
  action: MediaButtonAction;
  actionLabel: string;
  hint: string;
}

/**
 * Returns the fixed media button display info for the configuration modal.
 */
export function getMediaButtonDisplayInfo(t: (key: string) => string): MediaButtonDisplayInfo[] {
  return [
    {
      buttonId: 'media-volume-up',
      buttonLabel: t('setup.remoteConfig.mediaButtons.volumeUp'),
      shortLabel: t('setup.remoteConfig.mediaButtons.volumeUpShort'),
      iconName: 'volume-up',
      action: 'add-team-1',
      actionLabel: t('setup.remoteConfig.actions.addTeam1'),
      hint: t('setup.remoteConfig.rows.singlePressHint')
    },
    {
      buttonId: 'media-volume-down',
      buttonLabel: t('setup.remoteConfig.mediaButtons.volumeDown'),
      shortLabel: t('setup.remoteConfig.mediaButtons.volumeDownShort'),
      iconName: 'volume-down',
      action: 'revert-team-1',
      actionLabel: t('setup.remoteConfig.actions.revertTeam1'),
      hint: t('setup.remoteConfig.rows.guardedUndoHint')
    },
    {
      buttonId: 'media-track-next',
      buttonLabel: t('setup.remoteConfig.mediaButtons.nextTrack'),
      shortLabel: t('setup.remoteConfig.mediaButtons.nextTrackShort'),
      iconName: 'skip-forward',
      action: 'add-team-2',
      actionLabel: t('setup.remoteConfig.actions.addTeam2'),
      hint: t('setup.remoteConfig.rows.singlePressHint')
    },
    {
      buttonId: 'media-track-previous',
      buttonLabel: t('setup.remoteConfig.mediaButtons.previousTrack'),
      shortLabel: t('setup.remoteConfig.mediaButtons.previousTrackShort'),
      iconName: 'skip-back',
      action: 'revert-team-2',
      actionLabel: t('setup.remoteConfig.actions.revertTeam2'),
      hint: t('setup.remoteConfig.rows.guardedUndoHint')
    }
  ];
}

/**
 * Converts a media button action to a team ID.
 */
export function actionToTeamId(action: MediaButtonAction): MatchTeamId {
  switch (action) {
    case 'add-team-1':
    case 'revert-team-1':
      return 'team-1';
    case 'add-team-2':
    case 'revert-team-2':
      return 'team-2';
  }
}

/**
 * Checks if a media button action is an add (score) action.
 */
export function isAddAction(action: MediaButtonAction): boolean {
  return action === 'add-team-1' || action === 'add-team-2';
}

/**
 * Checks if a media button action is a revert action.
 */
export function isRevertAction(action: MediaButtonAction): boolean {
  return action === 'revert-team-1' || action === 'revert-team-2';
}
