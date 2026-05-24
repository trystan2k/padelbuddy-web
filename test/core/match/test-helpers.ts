import {
  defaultSuperTiebreakTargetPoints,
  type MatchAction,
  type MatchSetup,
  type MatchSetupInput,
  type MatchTeamId
} from '@/core/match/types';
import { createMatchSetup } from '@/core/match/validation';

const defaultSides: MatchSetupInput['sides'] = [
  {
    id: 'team-1',
    playerNames: ['Ana', 'Bea']
  },
  {
    id: 'team-2',
    playerNames: ['Carla', 'Dani']
  }
];

export function createTestSetup(overrides: Partial<MatchSetupInput> = {}): MatchSetup {
  return createMatchSetup({
    format: 'best-of-3',
    gameMode: 'advantage',
    initialServer: 'team-1',
    decidingSetSuperTiebreak: false,
    audioAnnouncementsEnabled: true,
    servingIndicatorEnabled: true,
    countdownTimerEnabled: false,
    countdownTimerDuration: 90,
    superTiebreakTargetPoints: defaultSuperTiebreakTargetPoints,
    sideSwitchPrompts: false,
    sides: defaultSides,
    ...overrides
  });
}

export function scorePoints(...teamIds: MatchTeamId[]): MatchAction[] {
  return teamIds.map((teamId) => ({
    type: 'score-point',
    teamId
  }));
}

export function repeatAction(teamId: MatchTeamId, times: number): MatchAction[] {
  return Array.from({ length: times }, () => ({
    type: 'score-point',
    teamId
  }));
}

export function winQuickGame(teamId: MatchTeamId): MatchAction[] {
  return repeatAction(teamId, 4);
}

export function winQuickSet(teamId: MatchTeamId): MatchAction[] {
  return Array.from({ length: 6 }, () => winQuickGame(teamId)).flat();
}

export function reachSixAll(): MatchAction[] {
  return Array.from({ length: 12 }, (_, index) =>
    index % 2 === 0 ? winQuickGame('team-1') : winQuickGame('team-2')
  ).flat();
}
