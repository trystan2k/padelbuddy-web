import {
  type ActiveMatchSet,
  type CompletedMatchSet,
  type MatchDerivedState,
  type MatchScoreDisplay,
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

export function getNextSetFirstServer(set: CompletedMatchSet): MatchTeamId {
  if (set.tiebreakPoints !== null) {
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

    return {
      shouldPrompt: pointsPlayed > 0 && pointsPlayed % 6 === 0,
      reason: pointsPlayed > 0 && pointsPlayed % 6 === 0 ? 'tiebreak-interval' : null
    };
  }

  const totalGames = getTotalScore(activeSet.games);

  if (totalGames > 0 && totalGames % 2 === 1 && isInitialStandardGame(activeSet)) {
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

  return {
    status: winner ? 'completed' : 'in-progress',
    activeSetIndex: getActiveSet(state)?.index ?? null,
    servingTeam: getServingTeam(state),
    winner,
    canContinuePlaying: winner !== null && setup.setCap !== null,
    setsWon: getSetsWon(state),
    sideSwitch: getSideSwitchState(setup, state),
    scoreDisplay: getScoreDisplay(state)
  };
}
