export const matchFormats = ['best-of-1', 'best-of-3', 'best-of-5'] as const;
export const gameModes = ['advantage', 'golden-point'] as const;
export const matchTeamIds = ['team-1', 'team-2'] as const;
export const bestOfOneDecidingBehaviors = ['full-set', 'super-tiebreak'] as const;
export const setModes = ['standard', 'super-tiebreak'] as const;
export const countdownTimerDurations = [60, 90, 120] as const;

export type MatchFormat = (typeof matchFormats)[number];
export type MatchGameMode = (typeof gameModes)[number];
export type MatchTeamId = (typeof matchTeamIds)[number];
export type BestOfOneDecidingBehavior = (typeof bestOfOneDecidingBehaviors)[number];
export type MatchSetMode = (typeof setModes)[number];
export type CountdownTimerDuration = (typeof countdownTimerDurations)[number];

export type TeamScore<T> = Record<MatchTeamId, T>;

export interface MatchSide {
  id: MatchTeamId;
  playerNames: string[];
}

export interface MatchSetupInput {
  format: MatchFormat;
  gameMode: MatchGameMode;
  initialServer: MatchTeamId;
  decidingSetSuperTiebreak: boolean;
  audioAnnouncementsEnabled: boolean;
  servingIndicatorEnabled: boolean;
  countdownTimerEnabled: boolean;
  countdownTimerDuration: CountdownTimerDuration;
  bestOfOneDecidingBehavior?: BestOfOneDecidingBehavior;
  sideSwitchPrompts: boolean;
  sides: [MatchSide, MatchSide] | MatchSide[];
}

export interface MatchSetup {
  format: MatchFormat;
  gameMode: MatchGameMode;
  initialServer: MatchTeamId;
  decidingSetSuperTiebreak: boolean;
  audioAnnouncementsEnabled: boolean;
  servingIndicatorEnabled: boolean;
  countdownTimerEnabled: boolean;
  countdownTimerDuration: CountdownTimerDuration;
  bestOfOneDecidingBehavior: BestOfOneDecidingBehavior;
  sideSwitchPrompts: boolean;
  sides: [MatchSide, MatchSide];
  decidingSetMode: MatchSetMode;
  officialMaxSets: 1 | 3 | 5;
  officialSetsToWin: 1 | 2 | 3;
  setCap: 1 | 3 | 5 | null;
}

export interface MatchSetupValidationIssue {
  field: string;
  message: string;
}

export type MatchSetupValidationResult =
  | { success: true; data: MatchSetup }
  | { success: false; issues: MatchSetupValidationIssue[] };

export interface ScorePointAction {
  type: 'score-point';
  teamId: MatchTeamId;
}

export type MatchAction = ScorePointAction;

export const standardTiebreakTargetPoints = 7 as const;
export const superTiebreakTargetPoints = 10 as const;

export interface StandardGameState {
  kind: 'standard';
  points: TeamScore<number>;
  advantageTeam: MatchTeamId | null;
}

export interface TiebreakGameState {
  kind: 'tiebreak';
  points: TeamScore<number>;
  targetPoints: 7 | 10;
}

export type MatchGameState = StandardGameState | TiebreakGameState;

export interface MatchSetBase {
  index: number;
  mode: MatchSetMode;
  firstServer: MatchTeamId;
  games: TeamScore<number>;
}

export interface ActiveMatchSet extends MatchSetBase {
  completed: false;
  game: MatchGameState;
}

export interface CompletedMatchSet extends MatchSetBase {
  completed: true;
  winner: MatchTeamId;
  tiebreakPoints: TeamScore<number> | null;
}

export type MatchSetState = ActiveMatchSet | CompletedMatchSet;

export interface MatchState {
  sets: MatchSetState[];
  actionCount: number;
}

export interface MatchWinner {
  teamId: MatchTeamId;
  setsWon: number;
  sets: TeamScore<number>;
}

export interface MatchSideSwitchState {
  shouldPrompt: boolean;
  reason: 'odd-games' | 'tiebreak-interval' | null;
}

export interface StandardMatchScoreDisplay {
  kind: 'standard';
  points: TeamScore<string>;
}

export interface TiebreakMatchScoreDisplay {
  kind: 'tiebreak';
  points: TeamScore<number>;
}

export interface EmptyMatchScoreDisplay {
  kind: null;
  points: null;
}

export type MatchScoreDisplay =
  | StandardMatchScoreDisplay
  | TiebreakMatchScoreDisplay
  | EmptyMatchScoreDisplay;

export interface MatchDerivedState {
  status: 'in-progress' | 'completed';
  activeSetIndex: number | null;
  servingTeam: MatchTeamId | null;
  winner: MatchWinner | null;
  canContinuePlaying: boolean;
  setsWon: TeamScore<number>;
  sideSwitch: MatchSideSwitchState;
  scoreDisplay: MatchScoreDisplay;
}

export interface MatchProjection {
  setup: MatchSetup;
  state: MatchState;
  derived: MatchDerivedState;
}

export const defaultMatchFormat: MatchFormat = 'best-of-3';
export const defaultGameMode: MatchGameMode = 'advantage';
export const defaultInitialServer: MatchTeamId = 'team-1';
export const defaultBestOfOneDecidingBehavior: BestOfOneDecidingBehavior = 'full-set';
export const defaultAudioAnnouncementsEnabled = true;
export const defaultServingIndicatorEnabled = true;
export const defaultCountdownTimerEnabled = false;
export const defaultCountdownTimerDuration: CountdownTimerDuration = 90;
