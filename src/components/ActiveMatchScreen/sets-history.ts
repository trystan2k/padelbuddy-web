import type { CompletedMatchSet, MatchSetState, TeamScore } from '@/core/match/types';

type LegacyCompletedSuperTiebreakSetShape = {
  game?: {
    kind?: unknown;
    points?: TeamScore<number>;
  };
};

function getCompletedSuperTiebreakScore(set: CompletedMatchSet): TeamScore<number> {
  if (set.tiebreakPoints !== null) {
    return set.tiebreakPoints;
  }

  const legacyShape = set as MatchSetState & LegacyCompletedSuperTiebreakSetShape;
  if (legacyShape.game?.kind === 'tiebreak' && legacyShape.game.points !== undefined) {
    return legacyShape.game.points;
  }

  return set.games;
}

export function getCurrentSet(
  sets: MatchSetState[],
  currentSetIndex: number | null
): MatchSetState | null {
  if (currentSetIndex !== null && currentSetIndex >= 0 && currentSetIndex < sets.length) {
    return sets[currentSetIndex] ?? null;
  }

  return sets[sets.length - 1] ?? null;
}

export function getSetDisplayScore(set: MatchSetState | null): TeamScore<number> {
  if (set === null) {
    return { 'team-1': 0, 'team-2': 0 };
  }

  if (set.completed) {
    if (set.mode === 'super-tiebreak') {
      return getCompletedSuperTiebreakScore(set);
    }

    return set.games;
  }

  if (set.mode === 'super-tiebreak' && set.game.kind === 'tiebreak') {
    return set.game.points;
  }

  return set.games;
}

export function getSetsWonScore(sets: MatchSetState[]): TeamScore<number> {
  return sets.reduce<TeamScore<number>>(
    (score, set) => {
      if (!set.completed || typeof set.winner !== 'string') {
        return score;
      }

      score[set.winner] += 1;
      return score;
    },
    { 'team-1': 0, 'team-2': 0 }
  );
}

export function getSetsHistoryAutoOpenSignature(sets: MatchSetState[]): string {
  return sets
    .filter((set) => set.completed)
    .map((set) => {
      const score = getSetDisplayScore(set);
      return `${set.index}:${score['team-1']}-${score['team-2']}`;
    })
    .join('|');
}
