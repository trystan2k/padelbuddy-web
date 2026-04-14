/**
 * Cross-platform media buttons mapping for remote control scoring.
 *
 * Button         | Single Press | Double Press
 * ---------------|--------------|-----------------
 * Previous Track | Score Team A | Revert Team A
 * Next Track     | Score Team B | Revert Team B
 */

import type { MatchTeamId } from '@/core/match/types';

/**
 * Semantic actions exposed by the media buttons adapter.
 */
type MediaButtonAction = 'add-team-1' | 'revert-team-1' | 'add-team-2' | 'revert-team-2';

/**
 * Mapping from media button identifier to the semantic action.
 */
export const mediaButtonMapping: Record<string, MediaButtonAction> = {
  'media-track-previous': 'add-team-1',
  'media-track-next': 'add-team-2'
};

const mediaButtonKeyboardMapping: Record<string, keyof typeof mediaButtonMapping> = {
  MediaTrackNext: 'media-track-next',
  MediaNextTrack: 'media-track-next',
  AudioTrackNext: 'media-track-next',
  MediaTrackPrevious: 'media-track-previous',
  MediaPreviousTrack: 'media-track-previous',
  AudioTrackPrevious: 'media-track-previous'
};

/**
 * Display metadata for media buttons in the configuration UI.
 */
export type MediaButtonIconName = 'skip-forward' | 'skip-back';

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
      buttonId: 'media-track-previous',
      buttonLabel: t('setup.remoteConfig.mediaButtons.previousTrack'),
      shortLabel: t('setup.remoteConfig.mediaButtons.previousTrackShort'),
      iconName: 'skip-back',
      action: 'add-team-1',
      actionLabel: t('setup.remoteConfig.actions.addTeam1'),
      hint: t('setup.remoteConfig.rows.addPointHint')
    },
    {
      buttonId: 'media-track-previous-double',
      buttonLabel: t('setup.remoteConfig.mediaButtons.previousTrackDouble'),
      shortLabel: t('setup.remoteConfig.mediaButtons.previousTrackShortDouble'),
      iconName: 'skip-back',
      action: 'revert-team-1',
      actionLabel: t('setup.remoteConfig.actions.revertTeam1'),
      hint: t('setup.remoteConfig.rows.revertPointHint')
    },
    {
      buttonId: 'media-track-next',
      buttonLabel: t('setup.remoteConfig.mediaButtons.nextTrack'),
      shortLabel: t('setup.remoteConfig.mediaButtons.nextTrackShort'),
      iconName: 'skip-forward',
      action: 'add-team-2',
      actionLabel: t('setup.remoteConfig.actions.addTeam2'),
      hint: t('setup.remoteConfig.rows.addPointHint')
    },
    {
      buttonId: 'media-track-next-double',
      buttonLabel: t('setup.remoteConfig.mediaButtons.nextTrackDouble'),
      shortLabel: t('setup.remoteConfig.mediaButtons.nextTrackShortDouble'),
      iconName: 'skip-forward',
      action: 'revert-team-2',
      actionLabel: t('setup.remoteConfig.actions.revertTeam2'),
      hint: t('setup.remoteConfig.rows.revertPointHint')
    }
  ];
}

/**
 * Converts a semantic media-button action to a team ID.
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

/**
 * Maps DOM media key values from different browsers to the fixed media button IDs.
 */
export function getMediaButtonIdFromKeyboardInput(input: string): string | null {
  return mediaButtonKeyboardMapping[input] ?? null;
}
