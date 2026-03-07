export const TEAM_IDS = ['team1', 'team2'] as const
export type TeamId = (typeof TEAM_IDS)[number]

export const SUPPORTED_LOCALES = ['en', 'pt', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const MATCH_FORMATS = [1, 3, 5] as const
export type MatchFormat = (typeof MATCH_FORMATS)[number]

export const GAME_MODES = ['advantage', 'golden-point'] as const
export type GameMode = (typeof GAME_MODES)[number]

export const DECIDING_SET_MODES = ['full-set', 'super-tiebreak'] as const
export type DecidingSetMode = (typeof DECIDING_SET_MODES)[number]

export const MATCH_SET_TYPES = [
  'standard',
  'deciding-standard',
  'deciding-super-tiebreak'
] as const
export type MatchSetType = (typeof MATCH_SET_TYPES)[number]

export const MATCH_PHASES = ['setup', 'active', 'completed'] as const
export type MatchPhase = (typeof MATCH_PHASES)[number]

export const MATCH_INPUT_SOURCES = [
  'touch',
  'keyboard',
  'remote',
  'system'
] as const
export type MatchInputSource = (typeof MATCH_INPUT_SOURCES)[number]

export type MatchTeams<T> = Record<TeamId, T>

export interface MatchTeam {
  name: string
}

export interface MatchConfig {
  matchFormat: MatchFormat
  initialServerTeamId: TeamId
  gameMode: GameMode
  decidingSetMode: DecidingSetMode
}

export interface MatchPreferences {
  locale: Locale
  isMuted: boolean
  sideSwitchPrompts: boolean
}

export interface MatchGameScore {
  pointsWon: MatchTeams<number>
  isTiebreak: boolean
  tiebreakTarget: 7 | 10 | null
}

export interface MatchSetScoreBase {
  gamesWon: MatchTeams<number>
  winningTeamId: TeamId | null
}

export interface StandardMatchSetScore extends MatchSetScoreBase {
  setType: Exclude<MatchSetType, 'deciding-super-tiebreak'>
  tiebreakPoints: MatchTeams<number> | null
}

export interface DecidingSuperTiebreakSetScore extends MatchSetScoreBase {
  setType: 'deciding-super-tiebreak'
  tiebreakPoints: MatchTeams<number>
}

export type MatchSetScore =
  | StandardMatchSetScore
  | DecidingSuperTiebreakSetScore

export interface MatchScoreboard {
  currentSetIndex: number
  servingTeamId: TeamId
  currentGame: MatchGameScore
  sets: MatchSetScore[]
}

export interface MatchResult {
  winnerTeamId: TeamId
  winningSetCount: number
}

export interface MatchSharedState {
  teams: MatchTeams<MatchTeam>
  config: MatchConfig
  preferences: MatchPreferences
}

export interface MatchScoredState extends MatchSharedState {
  scoreboard: MatchScoreboard
}

export interface MatchSetupState extends MatchSharedState {
  phase: 'setup'
}

export interface RegulationActiveMatchState extends MatchScoredState {
  phase: 'active'
  officialResult: null
  isEndlessMode: false
}

export interface EndlessActiveMatchState extends MatchScoredState {
  phase: 'active'
  officialResult: MatchResult
  isEndlessMode: true
}

export type ActiveMatchState =
  | RegulationActiveMatchState
  | EndlessActiveMatchState

export interface CompletedMatchState extends MatchScoredState {
  phase: 'completed'
  officialResult: MatchResult
}

export type MatchState =
  | MatchSetupState
  | ActiveMatchState
  | CompletedMatchState

export interface UpdateTeamNameAction {
  type: 'setup.team-name-updated'
  payload: {
    teamId: TeamId
    name: string
  }
}

export interface SelectMatchFormatAction {
  type: 'setup.match-format-selected'
  payload: {
    matchFormat: MatchFormat
  }
}

export interface SelectInitialServerAction {
  type: 'setup.initial-server-selected'
  payload: {
    teamId: TeamId
  }
}

export interface SelectGameModeAction {
  type: 'setup.game-mode-selected'
  payload: {
    gameMode: GameMode
  }
}

export interface SelectDecidingSetModeAction {
  type: 'setup.deciding-set-mode-selected'
  payload: {
    decidingSetMode: DecidingSetMode
  }
}

export type MatchSetupAction =
  | UpdateTeamNameAction
  | SelectMatchFormatAction
  | SelectInitialServerAction
  | SelectGameModeAction
  | SelectDecidingSetModeAction

export interface SelectLocaleAction {
  type: 'preferences.locale-selected'
  payload: {
    locale: Locale
  }
}

export interface SetMutedAction {
  type: 'preferences.muted-set'
  payload: {
    isMuted: boolean
  }
}

export interface SetSideSwitchPromptsAction {
  type: 'preferences.side-switch-prompts-set'
  payload: {
    sideSwitchPrompts: boolean
  }
}

export type MatchPreferenceAction =
  | SelectLocaleAction
  | SetMutedAction
  | SetSideSwitchPromptsAction

export interface StartMatchAction {
  type: 'match.started'
}

export interface CompleteMatchAction {
  type: 'match.completed'
  payload: {
    officialResult: MatchResult
  }
}

export interface ScorePointAction {
  type: 'match.point-scored'
  payload: {
    teamId: TeamId
    source: MatchInputSource
  }
}

export interface UndoScoreAction {
  type: 'match.undo-requested'
  payload: {
    source: MatchInputSource
  }
}

export interface ResetMatchAction {
  type: 'match.reset-requested'
}

export interface ContinuePlayingAction {
  type: 'match.continue-playing-requested'
}

export type MatchLifecycleAction =
  | StartMatchAction
  | CompleteMatchAction
  | ScorePointAction
  | UndoScoreAction
  | ResetMatchAction
  | ContinuePlayingAction

export type MatchAction =
  | MatchSetupAction
  | MatchPreferenceAction
  | MatchLifecycleAction

export type MatchScoreAction = Extract<
  MatchLifecycleAction,
  ScorePointAction | UndoScoreAction
>
