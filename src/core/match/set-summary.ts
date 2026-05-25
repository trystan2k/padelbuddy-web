import type { CompletedMatchSet, MatchSetState, TeamScore } from './types';

export interface SetSummaryScorePart {
  games: string;
  tiebreakPoints?: string;
}

export function formatSetSummaryScorePart(value: SetSummaryScorePart): string {
  if (value.tiebreakPoints !== undefined) {
    return `${value.games} (${value.tiebreakPoints})`;
  }

  return value.games;
}

function toStringScore(scores: TeamScore<number>): TeamScore<string> {
  return {
    'team-1': `${scores['team-1']}`,
    'team-2': `${scores['team-2']}`
  };
}

function getBaseSetSummaryScores(set: MatchSetState): TeamScore<number> {
  if (set.completed && set.mode === 'super-tiebreak' && set.tiebreakPoints !== null) {
    return set.tiebreakPoints;
  }

  return set.games;
}

function isCompletedStandardTiebreakSetWithPoints(
  set: MatchSetState
): set is CompletedMatchSet & { mode: 'standard'; tiebreakPoints: TeamScore<number> } {
  if (!set.completed) {
    return false;
  }

  if (set.mode !== 'standard' || set.tiebreakPoints === null) {
    return false;
  }

  const team1Games = set.games['team-1'];
  const team2Games = set.games['team-2'];

  return (team1Games === 7 && team2Games === 6) || (team1Games === 6 && team2Games === 7);
}

export function getSetSummaryScores(set: MatchSetState): TeamScore<string> {
  const scoreParts = getSetSummaryScoreParts(set);

  return {
    'team-1': formatSetSummaryScorePart(scoreParts['team-1']),
    'team-2': formatSetSummaryScorePart(scoreParts['team-2'])
  };
}

export function getSetSummaryScoreParts(set: MatchSetState): TeamScore<SetSummaryScorePart> {
  const baseScores = toStringScore(getBaseSetSummaryScores(set));

  if (!isCompletedStandardTiebreakSetWithPoints(set)) {
    return {
      'team-1': { games: baseScores['team-1'] },
      'team-2': { games: baseScores['team-2'] }
    };
  }

  return {
    'team-1': {
      games: `${set.games['team-1']}`,
      tiebreakPoints: `${set.tiebreakPoints['team-1']}`
    },
    'team-2': {
      games: `${set.games['team-2']}`,
      tiebreakPoints: `${set.tiebreakPoints['team-2']}`
    }
  };
}

export function formatSetSummaryScore(
  set: MatchSetState,
  options: { separator?: string } = {}
): string {
  const { separator = ' - ' } = options;
  const score = getSetSummaryScores(set);
  return `${score['team-1']}${separator}${score['team-2']}`;
}
