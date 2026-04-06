import type { MatchAction, MatchTeamId } from '@/core/match/types';

export function undoLastScoringActionForTeam(
  actions: MatchAction[],
  teamId: MatchTeamId
): MatchAction[] {
  const actionIndex = actions.findLastIndex(
    (action) => action.type === 'score-point' && action.teamId === teamId
  );

  if (actionIndex < 0) {
    return actions;
  }

  return [...actions.slice(0, actionIndex), ...actions.slice(actionIndex + 1)];
}
