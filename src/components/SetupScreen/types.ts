import type {
  CountdownTimerDuration,
  MatchFormat,
  MatchGameMode,
  MatchTeamId,
  SuperTiebreakTargetPoints
} from '@/core/match/types';

export interface SetupFormData {
  team1Name: string;
  team2Name: string;
  format: MatchFormat;
  gameMode: MatchGameMode;
  initialServer: MatchTeamId;
  decidingSetSuperTiebreak: boolean;
  superTiebreakTargetPoints: SuperTiebreakTargetPoints;
  audioAnnouncementsEnabled: boolean;
  voiceName: string | null;
  servingIndicatorEnabled: boolean;
  countdownTimerEnabled: boolean;
  countdownTimerDuration: CountdownTimerDuration;
  autoOpenSetsHistoryModal: boolean;
  sideSwitchPrompts: boolean;
}

export interface FieldErrors {
  team1Name?: string;
  team2Name?: string;
  format?: string;
  initialServer?: string;
  countdownTimerDuration?: string;
}
