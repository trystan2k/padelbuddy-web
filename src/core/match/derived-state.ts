import {
  type ActiveMatchSet,
  type CompletedMatchSet,
  type MatchDerivedState,
  type MatchScoreDisplay,
  type MatchServingPlayerNumber,
  type MatchSetup,
  type MatchSideSwitchState,
  type MatchState,
  type MatchTeamId,
  type MatchWinner,
  type TeamScore
} from './types';
import {
  createTeamScore,
  getCompletedSetCount,
  getCompletedSetTiebreakPoints,
  getOpponentTeamId,
  getTotalScore,
  isInitialStandardGame,
  toggleServer
} from './helpers';

const standardPointLabels = ['0', '15', '30', '40'] as const;

export function getCompletedSets(state: MatchState): CompletedMatchSet[] {
  return state.sets.filter((set): set is CompletedMatchSet => set.completed);
}

export function getActiveSet(state: MatchState): ActiveMatchSet | null {
  const lastSet = state.sets[state.sets.length - 1];

  return lastSet && !lastSet.completed ? lastSet : null;
}

function getSetsWon(state: MatchState): TeamScore<number> {
  return getCompletedSetCount(getCompletedSets(state));
}

export function getMatchWinner(setup: MatchSetup, state: MatchState): MatchWinner | null {
  if (setup.setCap === null) {
    return null;
  }

  const setsWon = getSetsWon(state);

  if (setsWon['team-1'] >= setup.officialSetsToWin) {
    return {
      teamId: 'team-1',
      setsWon: setsWon['team-1'],
      sets: setsWon
    };
  }

  if (setsWon['team-2'] >= setup.officialSetsToWin) {
    return {
      teamId: 'team-2',
      setsWon: setsWon['team-2'],
      sets: setsWon
    };
  }

  return null;
}

function getTiebreakOpeningServer(set: ActiveMatchSet): MatchTeamId {
  return toggleServer(set.firstServer, getTotalScore(set.games));
}

function getTiebreakServingTeam(openingServer: MatchTeamId, pointsPlayed: number): MatchTeamId {
  if (pointsPlayed === 0) {
    return openingServer;
  }

  const block = Math.floor((pointsPlayed - 1) / 2);

  return block % 2 === 0 ? getOpponentTeamId(openingServer) : openingServer;
}

function recordServiceTurn(counts: TeamScore<number>, teamId: MatchTeamId): void {
  counts[teamId] += 1;
}

function recordStandardServiceTurns(
  counts: TeamScore<number>,
  firstServer: MatchTeamId,
  completedGames: number
): void {
  for (let gameIndex = 0; gameIndex < completedGames; gameIndex += 1) {
    recordServiceTurn(counts, toggleServer(firstServer, gameIndex));
  }
}

function recordTiebreakServiceTurns(
  counts: TeamScore<number>,
  openingServer: MatchTeamId,
  pointsPlayed: number,
  includePartialLastTurn: boolean
): void {
  if (pointsPlayed <= 0) {
    return;
  }

  let server = openingServer;
  let remainingPoints = pointsPlayed;
  let turnLength = 1;

  while (remainingPoints > 0) {
    if (!includePartialLastTurn && remainingPoints < turnLength) {
      return;
    }

    recordServiceTurn(counts, server);
    remainingPoints -= turnLength;
    server = getOpponentTeamId(server);
    turnLength = 2;
  }
}

function getCompletedSetServiceGameCount(set: CompletedMatchSet): number {
  if (set.mode === 'super-tiebreak') {
    return 0;
  }

  if (set.tiebreakPoints === null) {
    return getTotalScore(set.games);
  }

  return 12;
}

function getCompletedSetSideSwitchGameCount(set: CompletedMatchSet): number {
  if (set.mode === 'super-tiebreak') {
    return 0;
  }

  return getTotalScore(set.games);
}

function getStandardSideSwitchCount(completedGames: number): number {
  if (completedGames <= 0) {
    return 0;
  }

  return Math.floor((completedGames + 1) / 2);
}

function getTiebreakSideSwitchCount(pointsPlayed: number): number {
  if (pointsPlayed <= 0) {
    return 0;
  }

  return Math.floor(pointsPlayed / 6);
}

function getCompletedSetSideSwitchCount(set: CompletedMatchSet): number {
  const completedGames = getCompletedSetSideSwitchGameCount(set);
  const tiebreakPointsPlayed = getTotalScore(
    getCompletedSetTiebreakPoints(set) ?? createTeamScore(0, 0)
  );

  return (
    getStandardSideSwitchCount(completedGames) + getTiebreakSideSwitchCount(tiebreakPointsPlayed)
  );
}

function getActiveSetSideSwitchCount(set: ActiveMatchSet): number {
  const completedGames = getTotalScore(set.games);
  const tiebreakPointsPlayed = set.game.kind === 'tiebreak' ? getTotalScore(set.game.points) : 0;

  return (
    getStandardSideSwitchCount(completedGames) + getTiebreakSideSwitchCount(tiebreakPointsPlayed)
  );
}

function getMatchSideSwitchCount(state: MatchState): number {
  const completedSetSwitchCount = getCompletedSets(state).reduce(
    (count, set) => count + getCompletedSetSideSwitchCount(set),
    0
  );
  const activeSet = getActiveSet(state);

  return completedSetSwitchCount + (activeSet ? getActiveSetSideSwitchCount(activeSet) : 0);
}

function isScoreboardMirrored(setup: MatchSetup, state: MatchState): boolean {
  if (!setup.sideSwitchPrompts) {
    return false;
  }

  return getMatchSideSwitchCount(state) % 2 === 1;
}

function getServiceTurnCountsBeforeActiveTurn(state: MatchState): TeamScore<number> {
  const counts = createTeamScore(0, 0);

  for (const set of getCompletedSets(state)) {
    const completedServiceGames = getCompletedSetServiceGameCount(set);

    recordStandardServiceTurns(counts, set.firstServer, completedServiceGames);

    const completedSetTiebreakPoints = getCompletedSetTiebreakPoints(set);

    if (completedSetTiebreakPoints !== null) {
      recordTiebreakServiceTurns(
        counts,
        toggleServer(set.firstServer, completedServiceGames),
        getTotalScore(completedSetTiebreakPoints),
        true
      );
    }
  }

  const activeSet = getActiveSet(state);

  if (!activeSet) {
    return counts;
  }

  recordStandardServiceTurns(counts, activeSet.firstServer, getTotalScore(activeSet.games));

  if (activeSet.game.kind === 'tiebreak') {
    recordTiebreakServiceTurns(
      counts,
      getTiebreakOpeningServer(activeSet),
      getTotalScore(activeSet.game.points),
      false
    );
  }

  return counts;
}

export function getServingTeam(state: MatchState): MatchTeamId | null {
  const activeSet = getActiveSet(state);

  if (!activeSet) {
    return null;
  }

  if (activeSet.game.kind === 'standard') {
    return toggleServer(activeSet.firstServer, getTotalScore(activeSet.games));
  }

  return getTiebreakServingTeam(
    getTiebreakOpeningServer(activeSet),
    getTotalScore(activeSet.game.points)
  );
}

export function getServingPlayerNumber(state: MatchState): MatchServingPlayerNumber | null {
  const servingTeam = getServingTeam(state);

  return getServingPlayerNumberForTeam(state, servingTeam);
}

function getServingPlayerNumberForTeam(
  state: MatchState,
  servingTeam: MatchTeamId | null
): MatchServingPlayerNumber | null {
  if (servingTeam === null) {
    return null;
  }

  return getServiceTurnCountsBeforeActiveTurn(state)[servingTeam] % 2 === 0 ? 1 : 2;
}

export function getNextSetFirstServer(set: CompletedMatchSet): MatchTeamId {
  if (getCompletedSetTiebreakPoints(set) !== null) {
    const gamesBeforeTiebreak = set.mode === 'super-tiebreak' ? 0 : 12;
    const openingServer = toggleServer(set.firstServer, gamesBeforeTiebreak);

    return getOpponentTeamId(openingServer);
  }

  return toggleServer(set.firstServer, getTotalScore(set.games));
}

function getLatestCompletedSetPrompt(state: MatchState): MatchSideSwitchState {
  const activeSet = getActiveSet(state);

  if (!activeSet || !isInitialStandardGame(activeSet)) {
    return {
      shouldPrompt: false,
      reason: null
    };
  }

  const completedSets = getCompletedSets(state);
  const latestCompletedSet = completedSets[completedSets.length - 1];

  if (latestCompletedSet && getTotalScore(latestCompletedSet.games) % 2 === 1) {
    return {
      shouldPrompt: true,
      reason: 'odd-games'
    };
  }

  return {
    shouldPrompt: false,
    reason: null
  };
}

function getSideSwitchState(setup: MatchSetup, state: MatchState): MatchSideSwitchState {
  if (!setup.sideSwitchPrompts) {
    return {
      shouldPrompt: false,
      reason: null
    };
  }

  const activeSet = getActiveSet(state);

  if (!activeSet) {
    return {
      shouldPrompt: false,
      reason: null
    };
  }

  if (activeSet.game.kind === 'tiebreak') {
    const pointsPlayed = getTotalScore(activeSet.game.points);
    const shouldPrompt = getTiebreakSideSwitchCount(pointsPlayed) > 0 && pointsPlayed % 6 === 0;

    return {
      shouldPrompt,
      reason: shouldPrompt ? 'tiebreak-interval' : null
    };
  }

  const totalGames = getTotalScore(activeSet.games);

  if (
    isInitialStandardGame(activeSet) &&
    getStandardSideSwitchCount(totalGames) > 0 &&
    totalGames % 2 === 1
  ) {
    return {
      shouldPrompt: true,
      reason: 'odd-games'
    };
  }

  return getLatestCompletedSetPrompt(state);
}

function formatStandardPointLabel(point: number): string {
  return standardPointLabels[point] ?? '40';
}

function getScoreDisplay(state: MatchState): MatchScoreDisplay {
  const activeSet = getActiveSet(state);

  if (!activeSet) {
    return {
      kind: null,
      points: null
    };
  }

  if (activeSet.game.kind === 'tiebreak') {
    return {
      kind: 'tiebreak',
      points: activeSet.game.points
    };
  }

  const { points, advantageTeam } = activeSet.game;

  if (points['team-1'] === 3 && points['team-2'] === 3) {
    if (advantageTeam === 'team-1') {
      return {
        kind: 'standard',
        points: createTeamScore('ad', '40')
      };
    }

    if (advantageTeam === 'team-2') {
      return {
        kind: 'standard',
        points: createTeamScore('40', 'ad')
      };
    }
  }

  return {
    kind: 'standard',
    points: createTeamScore(
      formatStandardPointLabel(points['team-1']),
      formatStandardPointLabel(points['team-2'])
    )
  };
}

export function deriveMatchState(setup: MatchSetup, state: MatchState): MatchDerivedState {
  const winner = getMatchWinner(setup, state);
  const servingTeam = getServingTeam(state);

  return {
    status: winner ? 'completed' : 'in-progress',
    activeSetIndex: getActiveSet(state)?.index ?? null,
    servingTeam,
    servingPlayerNumber: getServingPlayerNumberForTeam(state, servingTeam),
    winner,
    canContinuePlaying: winner !== null && setup.setCap !== null,
    setsWon: getSetsWon(state),
    isScoreboardMirrored: isScoreboardMirrored(setup, state),
    sideSwitch: getSideSwitchState(setup, state),
    scoreDisplay: getScoreDisplay(state)
  };
}
