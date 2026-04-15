import { describe, expect, test } from 'vitest';

import { getMatchTeamName } from '@/core/match/team-name';
import { createMatchSetup } from '@/core/match/validation';

describe('getMatchTeamName', () => {
  test('joins player names for an existing side', () => {
    const setup = createMatchSetup({
      format: 'best-of-3',
      gameMode: 'advantage',
      initialServer: 'team-1',
      decidingSetSuperTiebreak: false,
      audioAnnouncementsEnabled: true,
      servingIndicatorEnabled: true,
      countdownTimerEnabled: true,
      countdownTimerDuration: 90,
      sideSwitchPrompts: true,
      sides: [
        { id: 'team-1', playerNames: ['Ana', 'Bea'] },
        { id: 'team-2', playerNames: ['Carla', 'Dani'] }
      ]
    });

    expect(getMatchTeamName(setup, 'team-1')).toBe('Ana & Bea');
  });

  test('falls back to team id when side is missing', () => {
    const setup = createMatchSetup({
      format: 'best-of-1',
      gameMode: 'golden-point',
      initialServer: 'team-1',
      decidingSetSuperTiebreak: false,
      audioAnnouncementsEnabled: true,
      servingIndicatorEnabled: true,
      countdownTimerEnabled: true,
      countdownTimerDuration: 90,
      sideSwitchPrompts: true,
      sides: [
        { id: 'team-1', playerNames: ['Only Team'] },
        { id: 'team-2', playerNames: ['Opponent'] }
      ]
    });

    const setupWithoutTeam2 = {
      ...setup,
      sides: setup.sides.filter((side) => side.id !== 'team-2')
    } as unknown as typeof setup;

    expect(getMatchTeamName(setupWithoutTeam2, 'team-2')).toBe('team-2');
  });
});
