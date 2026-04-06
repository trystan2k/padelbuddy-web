import type { ActiveMatchSet, CompletedMatchSet, MatchTeamId, TeamScore } from './types';

export function createTeamScore<T>(teamOne: T, teamTwo: T): TeamScore<T> {
  return {
    'team-1': teamOne,
    'team-2': teamTwo
  };
}

export function cloneTeamScore<T>(score: TeamScore<T>): TeamScore<T> {
  return {
    'team-1': score['team-1'],
    'team-2': score['team-2']
  };
}

export function getOpponentTeamId(teamId: MatchTeamId): MatchTeamId {
  return teamId === 'team-1' ? 'team-2' : 'team-1';
}

export function incrementTeamScore(
  score: TeamScore<number>,
  teamId: MatchTeamId
): TeamScore<number> {
  return {
    ...score,
    [teamId]: score[teamId] + 1
  };
}

export function getTotalScore(score: TeamScore<number>): number {
  return score['team-1'] + score['team-2'];
}

export function toggleServer(server: MatchTeamId, rotations = 1): MatchTeamId {
  return rotations % 2 === 0 ? server : getOpponentTeamId(server);
}

export function isInitialStandardGame(set: ActiveMatchSet): boolean {
  if (set.game.kind !== 'standard') {
    return false;
  }

  return (
    set.game.points['team-1'] === 0 &&
    set.game.points['team-2'] === 0 &&
    set.game.advantageTeam === null
  );
}

export function getCompletedSetCount(sets: CompletedMatchSet[]): TeamScore<number> {
  return sets.reduce(
    (score, set) => {
      score[set.winner] += 1;

      return score;
    },
    createTeamScore(0, 0)
  );
}
