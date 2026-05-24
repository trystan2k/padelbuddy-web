import {
  countdownTimerDurations,
  gameModes,
  matchFormats,
  matchTeamIds,
  superTiebreakTargetPointsOptions,
  type CountdownTimerDuration,
  type MatchFormat,
  type MatchGameMode,
  type MatchTeamId,
  type SuperTiebreakTargetPoints
} from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isMatchTeamId(value: unknown): value is MatchTeamId {
  return typeof value === 'string' && matchTeamIds.some((candidate) => candidate === value);
}

export function isMatchFormat(value: unknown): value is MatchFormat {
  return typeof value === 'string' && matchFormats.some((candidate) => candidate === value);
}

export function isMatchGameMode(value: unknown): value is MatchGameMode {
  return typeof value === 'string' && gameModes.some((candidate) => candidate === value);
}

export function isCountdownTimerDuration(value: unknown): value is CountdownTimerDuration {
  return (
    typeof value === 'number' && countdownTimerDurations.some((candidate) => candidate === value)
  );
}

export function isSuperTiebreakTargetPoints(value: unknown): value is SuperTiebreakTargetPoints {
  return (
    typeof value === 'number' &&
    superTiebreakTargetPointsOptions.some((candidate) => candidate === value)
  );
}
