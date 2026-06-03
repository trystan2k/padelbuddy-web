import { getCompletedSetTiebreakPoints } from '@/core/match/helpers';
import type { CompletedMatchSet, MatchSetState, MatchTeamId, TeamScore } from '@/core/match/types';

export type VisualTeamOrder = readonly [MatchTeamId, MatchTeamId];
export const DEFAULT_VISUAL_TEAM_ORDER = ['team-1', 'team-2'] as const satisfies VisualTeamOrder;

function getCompletedSuperTiebreakScore(set: CompletedMatchSet): TeamScore<number> {
  return getCompletedSetTiebreakPoints(set) ?? set.games;
}

export function reorderVisualTeamScore<Value>(
  score: TeamScore<Value>,
  visualTeamOrder: VisualTeamOrder
): TeamScore<Value> {
  const [leftTeamId, rightTeamId] = visualTeamOrder;

  return {
    'team-1': score[leftTeamId],
    'team-2': score[rightTeamId]
  };
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

export function getSetDisplayScore(
  set: MatchSetState | null,
  visualTeamOrder: VisualTeamOrder = DEFAULT_VISUAL_TEAM_ORDER
): TeamScore<number> {
  if (set === null) {
    return { 'team-1': 0, 'team-2': 0 };
  }

  if (set.completed) {
    if (set.mode === 'super-tiebreak') {
      return reorderVisualTeamScore(getCompletedSuperTiebreakScore(set), visualTeamOrder);
    }

    return reorderVisualTeamScore(set.games, visualTeamOrder);
  }

  if (set.mode === 'super-tiebreak' && set.game.kind === 'tiebreak') {
    return reorderVisualTeamScore(set.game.points, visualTeamOrder);
  }

  return reorderVisualTeamScore(set.games, visualTeamOrder);
}

export function getSetsWonScore(
  sets: MatchSetState[],
  visualTeamOrder: VisualTeamOrder = DEFAULT_VISUAL_TEAM_ORDER
): TeamScore<number> {
  const aggregateScore = sets.reduce<TeamScore<number>>(
    (accumulator, set) => {
      if (!set.completed || typeof set.winner !== 'string') {
        return accumulator;
      }

      accumulator[set.winner] += 1;
      return accumulator;
    },
    { 'team-1': 0, 'team-2': 0 }
  );

  return reorderVisualTeamScore(aggregateScore, visualTeamOrder);
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
