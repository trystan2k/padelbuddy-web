import {
  countdownTimerDurations,
  matchTeamIds,
  type CountdownTimerDuration,
  type MatchTeamId
} from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isMatchTeamId(value: unknown): value is MatchTeamId {
  return typeof value === 'string' && matchTeamIds.some((candidate) => candidate === value);
}

export function isCountdownTimerDuration(value: unknown): value is CountdownTimerDuration {
  return (
    typeof value === 'number' && countdownTimerDurations.some((candidate) => candidate === value)
  );
}
