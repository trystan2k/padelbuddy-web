import {
  bestOfOneDecidingBehaviors,
  defaultBestOfOneDecidingBehavior,
  defaultSuperTiebreakTargetPoints,
  type BestOfOneDecidingBehavior,
  type CountdownTimerDuration,
  type MatchFormat,
  type MatchGameMode,
  type MatchSetMode,
  type MatchSetup,
  type MatchTeamId,
  type MatchSetupValidationIssue,
  type SuperTiebreakTargetPoints,
  type MatchSetupValidationResult,
  type MatchSide
} from './types';
import {
  isCountdownTimerDuration,
  isMatchFormat,
  isMatchGameMode,
  isMatchTeamId,
  isRecord,
  isSuperTiebreakTargetPoints
} from './guards';

function createIssue(field: string, message: string): MatchSetupValidationIssue {
  return {
    field,
    message
  };
}

function describeValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return String(value);
  }

  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  try {
    const serializedValue = JSON.stringify(value);

    return serializedValue ?? 'unserializable value';
  } catch {
    if (Array.isArray(value)) {
      return '[unserializable array]';
    }

    return '[unserializable object]';
  }
}

function isPlayerNames(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((playerName) => typeof playerName === 'string');
}

function isBestOfOneDecidingBehavior(value: unknown): value is BestOfOneDecidingBehavior {
  return (
    typeof value === 'string' && bestOfOneDecidingBehaviors.some((candidate) => candidate === value)
  );
}

const officialMaxSetsByFormat = {
  'best-of-1': 1,
  'best-of-3': 3,
  'best-of-5': 5
} as const;

const officialSetsToWinByFormat = {
  'best-of-1': 1,
  'best-of-3': 2,
  'best-of-5': 3
} as const;

function validateMatchSide(
  value: unknown,
  index: number
): {
  side: MatchSide | null;
  issues: MatchSetupValidationIssue[];
} {
  const sideField = `sides[${index}]`;

  if (!isRecord(value)) {
    return {
      side: null,
      issues: [createIssue(sideField, 'Each side must be an object.')]
    };
  }

  const issues: MatchSetupValidationIssue[] = [];
  const id = isMatchTeamId(value.id) ? value.id : null;
  const playerNames = isPlayerNames(value.playerNames) ? value.playerNames : null;

  if (id === null) {
    issues.push(createIssue(`${sideField}.id`, 'Side identifiers must be team-1 and team-2.'));
  }

  if (playerNames === null) {
    issues.push(
      createIssue(`${sideField}.playerNames`, 'Side playerNames must be an array of strings.')
    );
  }

  if (id === null || playerNames === null) {
    return {
      side: null,
      issues
    };
  }

  return {
    side: {
      id,
      playerNames
    },
    issues
  };
}

function normalizeSides(sides: unknown): {
  normalizedSides: [MatchSide, MatchSide] | null;
  issues: MatchSetupValidationIssue[];
} {
  const issues: MatchSetupValidationIssue[] = [];

  if (!Array.isArray(sides) || sides.length !== 2) {
    issues.push(createIssue('sides', 'Match setup must include exactly two sides.'));

    return {
      normalizedSides: null,
      issues
    };
  }

  const sideMap = new Map<MatchTeamId, MatchSide>();

  for (const [index, sideEntry] of sides.entries()) {
    const { side, issues: sideIssues } = validateMatchSide(sideEntry, index);

    if (sideIssues.length > 0) {
      issues.push(...sideIssues);
      continue;
    }

    if (!side) {
      continue;
    }

    if (sideMap.has(side.id)) {
      issues.push(createIssue('sides', `Duplicate side id ${side.id} is not allowed.`));
      continue;
    }

    sideMap.set(side.id, side);
  }

  if (issues.length > 0) {
    return {
      normalizedSides: null,
      issues
    };
  }

  const teamOne = sideMap.get('team-1');
  const teamTwo = sideMap.get('team-2');

  if (!teamOne || !teamTwo) {
    issues.push(createIssue('sides', 'Both team-1 and team-2 sides are required.'));

    return {
      normalizedSides: null,
      issues
    };
  }

  return {
    normalizedSides: [teamOne, teamTwo],
    issues
  };
}

export function validateMatchSetup(input: unknown): MatchSetupValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      issues: [createIssue('setup', 'Match setup must be an object.')]
    };
  }

  const issues: MatchSetupValidationIssue[] = [];
  const formatValue = input.format;
  const gameModeValue = input.gameMode;
  const initialServerValue = input.initialServer;
  const decidingSetSuperTiebreakValue = input.decidingSetSuperTiebreak;
  const audioAnnouncementsEnabledValue = input.audioAnnouncementsEnabled;
  const servingIndicatorEnabledValue = input.servingIndicatorEnabled;
  const countdownTimerEnabledValue = input.countdownTimerEnabled;
  const countdownTimerDurationValue = input.countdownTimerDuration;
  const superTiebreakTargetPointsValue = input.superTiebreakTargetPoints;
  const bestOfOneDecidingBehaviorValue = input.bestOfOneDecidingBehavior;
  const sideSwitchPromptsValue = input.sideSwitchPrompts;
  const sidesValue = input.sides;

  let format: MatchFormat | null = null;
  let gameMode: MatchGameMode | null = null;
  let initialServer: MatchTeamId | null = null;
  let decidingSetSuperTiebreak: boolean | null = null;
  let audioAnnouncementsEnabled: boolean | null = null;
  let servingIndicatorEnabled: boolean | null = null;
  let countdownTimerEnabled: boolean | null = null;
  let countdownTimerDuration: CountdownTimerDuration | null = null;
  let superTiebreakTargetPoints: SuperTiebreakTargetPoints = defaultSuperTiebreakTargetPoints;
  let sideSwitchPrompts: boolean | null = null;
  let bestOfOneDecidingBehavior: BestOfOneDecidingBehavior | undefined;

  if (isMatchFormat(formatValue)) {
    format = formatValue;
  } else {
    issues.push(createIssue('format', `Unsupported match format: ${describeValue(formatValue)}`));
  }

  if (isMatchGameMode(gameModeValue)) {
    gameMode = gameModeValue;
  } else {
    issues.push(createIssue('gameMode', `Unsupported game mode: ${describeValue(gameModeValue)}`));
  }

  if (isMatchTeamId(initialServerValue)) {
    initialServer = initialServerValue;
  } else {
    issues.push(
      createIssue(
        'initialServer',
        `Unsupported initial server: ${describeValue(initialServerValue)}`
      )
    );
  }

  if (typeof sideSwitchPromptsValue === 'boolean') {
    sideSwitchPrompts = sideSwitchPromptsValue;
  } else {
    issues.push(createIssue('sideSwitchPrompts', 'Side-switch prompts must be a boolean value.'));
  }

  if (typeof countdownTimerEnabledValue === 'boolean') {
    countdownTimerEnabled = countdownTimerEnabledValue;
  } else {
    issues.push(
      createIssue('countdownTimerEnabled', 'Countdown timer enabled must be a boolean value.')
    );
  }

  if (typeof servingIndicatorEnabledValue === 'boolean') {
    servingIndicatorEnabled = servingIndicatorEnabledValue;
  } else {
    issues.push(
      createIssue('servingIndicatorEnabled', 'Serving indicator enabled must be a boolean value.')
    );
  }

  if (typeof audioAnnouncementsEnabledValue === 'boolean') {
    audioAnnouncementsEnabled = audioAnnouncementsEnabledValue;
  } else {
    issues.push(
      createIssue(
        'audioAnnouncementsEnabled',
        'Audio announcements enabled must be a boolean value.'
      )
    );
  }

  if (isCountdownTimerDuration(countdownTimerDurationValue)) {
    countdownTimerDuration = countdownTimerDurationValue;
  } else {
    issues.push(
      createIssue(
        'countdownTimerDuration',
        `Unsupported countdown timer duration: ${describeValue(countdownTimerDurationValue)}`
      )
    );
  }

  if (superTiebreakTargetPointsValue !== undefined) {
    if (isSuperTiebreakTargetPoints(superTiebreakTargetPointsValue)) {
      superTiebreakTargetPoints = superTiebreakTargetPointsValue;
    } else {
      issues.push(
        createIssue(
          'superTiebreakTargetPoints',
          `Unsupported super tiebreak target points: ${describeValue(superTiebreakTargetPointsValue)}`
        )
      );
    }
  }

  if (typeof decidingSetSuperTiebreakValue === 'boolean') {
    decidingSetSuperTiebreak = decidingSetSuperTiebreakValue;
  } else {
    issues.push(
      createIssue(
        'decidingSetSuperTiebreak',
        'Deciding-set super tiebreak must be a boolean value.'
      )
    );
  }

  if (bestOfOneDecidingBehaviorValue !== undefined) {
    if (isBestOfOneDecidingBehavior(bestOfOneDecidingBehaviorValue)) {
      bestOfOneDecidingBehavior = bestOfOneDecidingBehaviorValue;
    } else {
      issues.push(
        createIssue(
          'bestOfOneDecidingBehavior',
          `Unsupported best-of-1 deciding behavior: ${describeValue(bestOfOneDecidingBehaviorValue)}`
        )
      );
    }
  }

  const { normalizedSides, issues: sideIssues } = normalizeSides(sidesValue);
  issues.push(...sideIssues);

  if (format === 'best-of-1') {
    if (decidingSetSuperTiebreak === true && bestOfOneDecidingBehavior === undefined) {
      issues.push(
        createIssue(
          'bestOfOneDecidingBehavior',
          'Best-of-1 matches must define the deciding behavior when deciding-set super tiebreak is enabled.'
        )
      );
    }
  } else if (bestOfOneDecidingBehavior !== undefined) {
    issues.push(
      createIssue(
        'bestOfOneDecidingBehavior',
        'Best-of-1 deciding behavior is only allowed for best-of-1 matches.'
      )
    );
  }

  if (bestOfOneDecidingBehavior === 'super-tiebreak' && decidingSetSuperTiebreak === false) {
    issues.push(
      createIssue(
        'bestOfOneDecidingBehavior',
        'Best-of-1 super-tiebreak deciding behavior requires deciding-set super tiebreak to be enabled.'
      )
    );
  }

  if (
    issues.length > 0 ||
    format === null ||
    gameMode === null ||
    initialServer === null ||
    decidingSetSuperTiebreak === null ||
    audioAnnouncementsEnabled === null ||
    servingIndicatorEnabled === null ||
    countdownTimerEnabled === null ||
    countdownTimerDuration === null ||
    sideSwitchPrompts === null ||
    normalizedSides === null
  ) {
    return {
      success: false,
      issues
    };
  }

  const normalizedBestOfOneDecidingBehavior =
    format === 'best-of-1'
      ? (bestOfOneDecidingBehavior ?? defaultBestOfOneDecidingBehavior)
      : defaultBestOfOneDecidingBehavior;

  const decidingSetMode: MatchSetMode =
    format === 'best-of-1'
      ? normalizedBestOfOneDecidingBehavior === 'super-tiebreak'
        ? 'super-tiebreak'
        : 'standard'
      : decidingSetSuperTiebreak
        ? 'super-tiebreak'
        : 'standard';

  return {
    success: true,
    data: {
      format,
      gameMode,
      initialServer,
      decidingSetSuperTiebreak,
      audioAnnouncementsEnabled,
      servingIndicatorEnabled,
      countdownTimerEnabled,
      countdownTimerDuration,
      superTiebreakTargetPoints,
      bestOfOneDecidingBehavior: normalizedBestOfOneDecidingBehavior,
      sideSwitchPrompts,
      sides: normalizedSides,
      decidingSetMode,
      officialMaxSets: officialMaxSetsByFormat[format],
      officialSetsToWin: officialSetsToWinByFormat[format],
      setCap: officialMaxSetsByFormat[format]
    }
  };
}

export function createMatchSetup(input: unknown): MatchSetup {
  const result = validateMatchSetup(input);

  if (!result.success) {
    throw new Error(
      [
        'Invalid match setup:',
        ...result.issues.map((issue) => `- ${issue.field}: ${issue.message}`)
      ].join('\n')
    );
  }

  return result.data;
}
