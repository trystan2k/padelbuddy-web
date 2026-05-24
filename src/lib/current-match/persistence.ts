import {
  defaultAudioAnnouncementsEnabled,
  defaultCountdownTimerDuration,
  defaultCountdownTimerEnabled,
  defaultServingIndicatorEnabled,
  type MatchAction,
  type MatchProjection,
  type MatchSetup
} from '@/core/match/types';
import {
  isCountdownTimerDuration,
  isMatchTeamId,
  isRecord,
  isSuperTiebreakTargetPoints
} from '@/core/match/guards';
import { createMatchSetup } from '@/core/match/validation';
import { projectMatch } from '@/core/match/replay';

export const currentMatchSchemaVersion = 4 as const;
const defaultCurrentMatchId = 'current-match';
const legacySuperTiebreakTargetPoints = 10 as const;

export interface CurrentMatchSaveInput {
  matchId?: string;
  setup: MatchSetup;
  actions: MatchAction[];
  startedAt?: number; // Unix timestamp in milliseconds, defaults to Date.now()
  finishedAt?: number;
  legacyInProgressSuperTiebreakTargetPoints?: typeof legacySuperTiebreakTargetPoints;
}

export interface CurrentMatchRecord {
  schemaVersion: typeof currentMatchSchemaVersion;
  matchId: string;
  setup: MatchSetup;
  actions: MatchAction[];
  startedAt: number; // Unix timestamp in milliseconds
  finishedAt?: number;
  legacyInProgressSuperTiebreakTargetPoints?: typeof legacySuperTiebreakTargetPoints;
}

export interface CurrentMatchDecodeOkResult {
  status: 'ok';
  record: CurrentMatchRecord;
}

interface CurrentMatchDecodeResetRequiredResult {
  status: 'reset-required';
  reason: 'schema-version';
  storedSchemaVersion: number;
}

export interface CurrentMatchDecodeCorruptResult {
  status: 'corrupt';
  message: string;
}

type CurrentMatchDecodeResult =
  | CurrentMatchDecodeOkResult
  | CurrentMatchDecodeResetRequiredResult
  | CurrentMatchDecodeCorruptResult;

export function createCurrentMatchRecord(input: CurrentMatchSaveInput): CurrentMatchRecord {
  const startedAt = input.startedAt ?? Date.now();
  const parsedLegacyInProgressSuperTiebreakTargetPoints =
    parseLegacyInProgressSuperTiebreakTargetPoints(
      input.legacyInProgressSuperTiebreakTargetPoints,
      input.finishedAt
    );
  const legacyInProgressSuperTiebreakTargetPoints = parsedLegacyInProgressSuperTiebreakTargetPoints;
  const setup = parseMatchSetup(input.setup, {
    ...(typeof input.finishedAt === 'undefined' ? {} : { finishedAt: input.finishedAt }),
    ...(legacyInProgressSuperTiebreakTargetPoints === undefined
      ? {}
      : { legacyInProgressSuperTiebreakTargetPoints })
  });

  return {
    schemaVersion: currentMatchSchemaVersion,
    matchId: parseMatchId(input.matchId ?? defaultCurrentMatchId),
    setup,
    actions: parseMatchActions(input.actions),
    startedAt,
    ...(typeof input.finishedAt === 'number'
      ? { finishedAt: parseFinishedAt(input.finishedAt, startedAt) }
      : {}),
    ...(legacyInProgressSuperTiebreakTargetPoints === undefined
      ? {}
      : { legacyInProgressSuperTiebreakTargetPoints })
  };
}

export function parseCurrentMatchRecord(input: unknown): CurrentMatchRecord {
  const result = decodeCurrentMatchRecord(input);

  if (result.status === 'ok') {
    return result.record;
  }

  if (result.status === 'reset-required') {
    throw new Error(`Unsupported current match schema version: ${result.storedSchemaVersion}`);
  }

  throw new Error(result.message);
}

export function replayCurrentMatchRecord(record: CurrentMatchRecord): MatchProjection {
  return projectMatch(record.setup, record.actions);
}

export function decodeCurrentMatchRecord(input: unknown): CurrentMatchDecodeResult {
  let record: Record<string, unknown>;

  try {
    record = parseRecord(input);
  } catch (error) {
    return createCorruptResult(error);
  }

  const schemaVersion = record.schemaVersion;

  if (schemaVersion !== currentMatchSchemaVersion) {
    if (typeof schemaVersion === 'number' && Number.isInteger(schemaVersion)) {
      return {
        status: 'reset-required',
        reason: 'schema-version',
        storedSchemaVersion: schemaVersion
      };
    }

    return {
      status: 'corrupt',
      message: `Invalid current match schema version: ${String(schemaVersion)}`
    };
  }

  try {
    const startedAt = parseStartedAt(record.startedAt);
    const finishedAt =
      typeof record.finishedAt === 'undefined'
        ? undefined
        : parseFinishedAt(record.finishedAt, startedAt);
    const parsedLegacyInProgressSuperTiebreakTargetPoints =
      parseLegacyInProgressSuperTiebreakTargetPoints(
        record.legacyInProgressSuperTiebreakTargetPoints,
        finishedAt
      );
    const hasPersistedSuperTiebreakTargetPoints =
      isRecord(record.setup) && typeof record.setup.superTiebreakTargetPoints !== 'undefined';
    const legacyInProgressSuperTiebreakTargetPoints =
      parsedLegacyInProgressSuperTiebreakTargetPoints ??
      (finishedAt === undefined && !hasPersistedSuperTiebreakTargetPoints
        ? legacySuperTiebreakTargetPoints
        : undefined);

    return {
      status: 'ok',
      record: {
        schemaVersion: currentMatchSchemaVersion,
        matchId: parseMatchId(record.matchId),
        setup: parseMatchSetup(record.setup, {
          ...(finishedAt === undefined ? {} : { finishedAt }),
          ...(legacyInProgressSuperTiebreakTargetPoints === undefined
            ? {}
            : { legacyInProgressSuperTiebreakTargetPoints })
        }),
        actions: parseMatchActions(record.actions),
        startedAt,
        ...(finishedAt === undefined ? {} : { finishedAt }),
        ...(legacyInProgressSuperTiebreakTargetPoints === undefined
          ? {}
          : { legacyInProgressSuperTiebreakTargetPoints })
      }
    };
  } catch (error) {
    return createCorruptResult(error);
  }
}

function parseMatchId(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Current match matchId must be a non-empty string.');
  }

  const matchId = input.trim();

  if (matchId.length === 0) {
    throw new Error('Current match matchId must be a non-empty string.');
  }

  return matchId;
}

function parseStartedAt(input: unknown): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input <= 0) {
    throw new Error('Current match startedAt must be a positive number.');
  }
  return input;
}

function parseFinishedAt(input: unknown, startedAt: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < startedAt) {
    throw new Error(
      'Current match finishedAt must be a number greater than or equal to startedAt.'
    );
  }

  return input;
}

function withLegacyInProgressSuperTiebreakTarget(setup: MatchSetup): MatchSetup {
  return {
    ...setup,
    superTiebreakTargetPoints: legacySuperTiebreakTargetPoints
  };
}

function parseMatchSetup(
  input: unknown,
  options?: {
    finishedAt?: unknown;
    legacyInProgressSuperTiebreakTargetPoints?: typeof legacySuperTiebreakTargetPoints;
  }
): MatchSetup {
  const setup = parseRecord(input);
  const shouldUseLegacySuperTiebreakTarget =
    typeof options?.finishedAt === 'undefined' &&
    options?.legacyInProgressSuperTiebreakTargetPoints === legacySuperTiebreakTargetPoints;

  const setupInput = {
    format: setup.format,
    gameMode: setup.gameMode,
    initialServer: setup.initialServer,
    decidingSetSuperTiebreak: setup.decidingSetSuperTiebreak,
    audioAnnouncementsEnabled:
      typeof setup.audioAnnouncementsEnabled === 'boolean'
        ? setup.audioAnnouncementsEnabled
        : defaultAudioAnnouncementsEnabled,
    servingIndicatorEnabled:
      typeof setup.servingIndicatorEnabled === 'boolean'
        ? setup.servingIndicatorEnabled
        : defaultServingIndicatorEnabled,
    countdownTimerEnabled:
      typeof setup.countdownTimerEnabled === 'boolean'
        ? setup.countdownTimerEnabled
        : defaultCountdownTimerEnabled,
    countdownTimerDuration: isCountdownTimerDuration(setup.countdownTimerDuration)
      ? setup.countdownTimerDuration
      : defaultCountdownTimerDuration,
    superTiebreakTargetPoints: isSuperTiebreakTargetPoints(setup.superTiebreakTargetPoints)
      ? setup.superTiebreakTargetPoints
      : undefined,
    sideSwitchPrompts: setup.sideSwitchPrompts,
    sides: setup.sides
  };

  const normalizedSetup =
    setup.format === 'best-of-1' && typeof setup.bestOfOneDecidingBehavior === 'string'
      ? createMatchSetup({
          ...setupInput,
          bestOfOneDecidingBehavior: setup.bestOfOneDecidingBehavior
        })
      : createMatchSetup(setupInput);

  const normalizedWithLegacyTarget = shouldUseLegacySuperTiebreakTarget
    ? withLegacyInProgressSuperTiebreakTarget(normalizedSetup)
    : normalizedSetup;

  if (setup.setCap === null) {
    return {
      ...normalizedWithLegacyTarget,
      setCap: null
    };
  }

  return normalizedWithLegacyTarget;
}

function parseLegacyInProgressSuperTiebreakTargetPoints(
  input: unknown,
  finishedAt: unknown
): typeof legacySuperTiebreakTargetPoints | undefined {
  const isInProgress = typeof finishedAt === 'undefined';

  if (!isInProgress) {
    return undefined;
  }

  if (typeof input === 'undefined') {
    return undefined;
  }

  if (input === legacySuperTiebreakTargetPoints) {
    return input;
  }

  return undefined;
}

function parseMatchActions(input: unknown): MatchAction[] {
  if (!Array.isArray(input)) {
    throw new Error('Current match actions must be an array.');
  }

  return input.map((action) => parseMatchAction(action));
}

function parseMatchAction(input: unknown): MatchAction {
  const action = parseRecord(input);

  if (action.type !== 'score-point') {
    throw new Error(`Unsupported current match action type: ${String(action.type)}`);
  }

  if (!isMatchTeamId(action.teamId)) {
    throw new Error(`Invalid current match action team: ${String(action.teamId)}`);
  }

  return {
    type: 'score-point',
    teamId: action.teamId
  };
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error('Current match record must be an object.');
  }

  return input;
}

function createCorruptResult(error: unknown): CurrentMatchDecodeCorruptResult {
  return {
    status: 'corrupt',
    message: error instanceof Error ? error.message : 'Current match payload is corrupt.'
  };
}
