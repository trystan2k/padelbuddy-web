import {
  getActiveSet,
  getCompletedSets,
  getMatchWinner,
  getNextSetFirstServer
} from './derived-state';
import { cloneTeamScore, createTeamScore, getOpponentTeamId, incrementTeamScore } from './helpers';
import {
  standardTiebreakTargetPoints,
  superTiebreakTargetPoints,
  type ActiveMatchSet,
  type CompletedMatchSet,
  type MatchAction,
  type MatchGameState,
  type MatchSetMode,
  type MatchSetup,
  type MatchState,
  type MatchTeamId,
  type StandardGameState,
  type TeamScore,
  type TiebreakGameState
} from './types';

function createStandardGameState(): StandardGameState {
  return {
    kind: 'standard',
    points: createTeamScore(0, 0),
    advantageTeam: null
  };
}

function createTiebreakGameState(targetPoints: 7 | 10): TiebreakGameState {
  return {
    kind: 'tiebreak',
    points: createTeamScore(0, 0),
    targetPoints
  };
}

function createGameStateForSetMode(mode: MatchSetMode): MatchGameState {
  return mode === 'super-tiebreak'
    ? createTiebreakGameState(superTiebreakTargetPoints)
    : createStandardGameState();
}

export function getSetMode(setup: MatchSetup, setIndex: number): MatchSetMode {
  if (setup.setCap === null) {
    return 'standard';
  }

  if (setIndex === setup.officialMaxSets) {
    return setup.decidingSetMode;
  }

  return 'standard';
}

function createActiveSet(
  setup: MatchSetup,
  setIndex: number,
  firstServer: MatchTeamId
): ActiveMatchSet {
  const mode = getSetMode(setup, setIndex);

  return {
    index: setIndex,
    mode,
    firstServer,
    games: createTeamScore(0, 0),
    completed: false,
    game: createGameStateForSetMode(mode)
  };
}

export function createInitialMatchState(setup: MatchSetup): MatchState {
  return {
    sets: [createActiveSet(setup, 1, setup.initialServer)],
    actionCount: 0
  };
}

function isStandardGameWon(points: TeamScore<number>, teamId: MatchTeamId): boolean {
  const opponent = getOpponentTeamId(teamId);

  return points[teamId] === 4 && points[opponent] <= 2;
}

function applyPointToStandardGame(
  game: StandardGameState,
  teamId: MatchTeamId,
  gameMode: MatchSetup['gameMode']
): StandardGameState | { winner: MatchTeamId } {
  const opponent = getOpponentTeamId(teamId);

  if (game.points[teamId] < 3 || game.points[opponent] < 3) {
    const nextPoints = incrementTeamScore(game.points, teamId);

    if (isStandardGameWon(nextPoints, teamId)) {
      return {
        winner: teamId
      };
    }

    return {
      kind: 'standard',
      points: nextPoints,
      advantageTeam: null
    };
  }

  if (gameMode === 'golden-point') {
    return {
      winner: teamId
    };
  }

  if (game.advantageTeam === teamId) {
    return {
      winner: teamId
    };
  }

  if (game.advantageTeam === opponent) {
    return {
      kind: 'standard',
      points: cloneTeamScore(game.points),
      advantageTeam: null
    };
  }

  return {
    kind: 'standard',
    points: cloneTeamScore(game.points),
    advantageTeam: teamId
  };
}

function applyPointToTiebreakGame(
  game: TiebreakGameState,
  teamId: MatchTeamId
): TiebreakGameState | { winner: MatchTeamId; points: TeamScore<number> } {
  const opponent = getOpponentTeamId(teamId);
  const nextPoints = incrementTeamScore(game.points, teamId);

  if (nextPoints[teamId] >= game.targetPoints && nextPoints[teamId] - nextPoints[opponent] >= 2) {
    return {
      winner: teamId,
      points: nextPoints
    };
  }

  return {
    kind: 'tiebreak',
    points: nextPoints,
    targetPoints: game.targetPoints
  };
}

function isStandardSetWon(games: TeamScore<number>, teamId: MatchTeamId): boolean {
  const opponent = getOpponentTeamId(teamId);

  return games[teamId] >= 6 && games[teamId] - games[opponent] >= 2;
}

function replaceLastSet(
  state: MatchState,
  nextSet: ActiveMatchSet | CompletedMatchSet
): MatchState {
  return {
    ...state,
    sets: [...state.sets.slice(0, -1), nextSet]
  };
}

function appendSet(state: MatchState, set: ActiveMatchSet): MatchState {
  return {
    ...state,
    sets: [...state.sets, set]
  };
}

function finalizeSet(
  setup: MatchSetup,
  state: MatchState,
  completedSet: CompletedMatchSet
): MatchState {
  const withCompletedSet = replaceLastSet(state, completedSet);

  if (getMatchWinner(setup, withCompletedSet)) {
    return withCompletedSet;
  }

  const nextSet = createActiveSet(
    setup,
    withCompletedSet.sets.length + 1,
    getNextSetFirstServer(completedSet)
  );

  return appendSet(withCompletedSet, nextSet);
}

function finishStandardGame(
  setup: MatchSetup,
  state: MatchState,
  set: ActiveMatchSet,
  teamId: MatchTeamId
): MatchState {
  const nextGames = incrementTeamScore(set.games, teamId);

  if (isStandardSetWon(nextGames, teamId)) {
    return finalizeSet(setup, state, {
      index: set.index,
      mode: set.mode,
      firstServer: set.firstServer,
      games: nextGames,
      completed: true,
      winner: teamId,
      tiebreakPoints: null
    });
  }

  if (nextGames['team-1'] === 6 && nextGames['team-2'] === 6) {
    return replaceLastSet(state, {
      ...set,
      games: nextGames,
      game: createTiebreakGameState(standardTiebreakTargetPoints)
    });
  }

  return replaceLastSet(state, {
    ...set,
    games: nextGames,
    game: createStandardGameState()
  });
}

function finishTiebreakGame(
  setup: MatchSetup,
  state: MatchState,
  set: ActiveMatchSet,
  teamId: MatchTeamId,
  tiebreakPoints: TeamScore<number>
): MatchState {
  const completedGames =
    set.mode === 'super-tiebreak'
      ? cloneTeamScore(set.games)
      : incrementTeamScore(set.games, teamId);

  return finalizeSet(setup, state, {
    index: set.index,
    mode: set.mode,
    firstServer: set.firstServer,
    games: completedGames,
    completed: true,
    winner: teamId,
    tiebreakPoints
  });
}

export function applyMatchAction(
  setup: MatchSetup,
  state: MatchState,
  action: MatchAction
): MatchState {
  if (action.type !== 'score-point') {
    return state;
  }

  if (getMatchWinner(setup, state)) {
    return state;
  }

  const activeSet = getActiveSet(state);

  if (!activeSet) {
    const completedSets = getCompletedSets(state);
    const lastSet = completedSets[completedSets.length - 1];

    if (!lastSet) {
      return state;
    }

    const nextState = appendSet(
      state,
      createActiveSet(setup, state.sets.length + 1, getNextSetFirstServer(lastSet))
    );

    return applyMatchAction(setup, nextState, action);
  }

  if (activeSet.game.kind === 'standard') {
    const nextGame = applyPointToStandardGame(activeSet.game, action.teamId, setup.gameMode);

    if ('winner' in nextGame) {
      return {
        ...finishStandardGame(setup, state, activeSet, nextGame.winner),
        actionCount: state.actionCount + 1
      };
    }

    return {
      ...replaceLastSet(state, {
        ...activeSet,
        game: nextGame
      }),
      actionCount: state.actionCount + 1
    };
  }

  const nextGame = applyPointToTiebreakGame(activeSet.game, action.teamId);

  if ('winner' in nextGame) {
    return {
      ...finishTiebreakGame(setup, state, activeSet, nextGame.winner, nextGame.points),
      actionCount: state.actionCount + 1
    };
  }

  return {
    ...replaceLastSet(state, {
      ...activeSet,
      game: nextGame
    }),
    actionCount: state.actionCount + 1
  };
}

export function scorePoint(setup: MatchSetup, state: MatchState, teamId: MatchTeamId): MatchState {
  return applyMatchAction(setup, state, {
    type: 'score-point',
    teamId
  });
}
