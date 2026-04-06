import { describe, expect, test } from 'vitest';

import { createMatchSetup } from '@/core/match/validation';
import {
  countdownTimerDurations,
  defaultCountdownTimerDuration,
  defaultMatchFormat,
  gameModes,
  matchFormats
} from '@/core/match/types';
import { projectMatch } from '@/core/match/replay';

describe('match domain public exports', () => {
  test('exposes the supported setup baselines and replay entrypoint', () => {
    const setup = createMatchSetup({
      format: defaultMatchFormat,
      gameMode: gameModes[0],
      initialServer: 'team-1',
      decidingSetSuperTiebreak: false,
      audioAnnouncementsEnabled: true,
      servingIndicatorEnabled: true,
      countdownTimerEnabled: false,
      countdownTimerDuration: defaultCountdownTimerDuration,
      sideSwitchPrompts: false,
      sides: [
        {
          id: 'team-1',
          playerNames: ['Ana', 'Bea']
        },
        {
          id: 'team-2',
          playerNames: ['Carla', 'Dani']
        }
      ]
    });

    expect(matchFormats).toEqual(['best-of-1', 'best-of-3', 'best-of-5']);
    expect(countdownTimerDurations).toEqual([60, 90, 120]);
    expect(defaultCountdownTimerDuration).toBe(90);
    expect(defaultMatchFormat).toBe('best-of-3');
    expect(projectMatch(setup, []).derived.status).toBe('in-progress');
  });
});
