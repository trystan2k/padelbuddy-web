import { describe, expect, test } from 'vitest';

import { continueMatch, projectMatch } from '@/core/match/replay';
import {
  getActiveSet,
  getNextSetFirstServer,
  getServingPlayerNumber,
  getServingTeam
} from '@/core/match/derived-state';

import {
  createTestSetup,
  reachSixAll,
  repeatAction,
  scorePoints,
  winQuickGame,
  winQuickSet
} from './test-helpers';

describe('serve rotation and derived state', () => {
  test('alternates the serving team by completed game', () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, winQuickGame('team-1'));

    expect(projection.derived.servingTeam).toBe('team-2');
    expect(projection.derived.servingPlayerNumber).toBe(1);
    expect(getActiveSet(projection.state)?.firstServer).toBe('team-1');
  });

  test('alternates each team serving player across standard service turns', () => {
    const setup = createTestSetup();
    const atStart = projectMatch(setup, []);
    const afterOneGame = projectMatch(setup, winQuickGame('team-1'));
    const afterTwoGames = projectMatch(setup, [
      ...winQuickGame('team-1'),
      ...winQuickGame('team-2')
    ]);

    expect(atStart.derived.servingPlayerNumber).toBe(1);
    expect(afterOneGame.derived.servingPlayerNumber).toBe(1);
    expect(afterTwoGames.derived.servingPlayerNumber).toBe(2);
  });

  test('follows deterministic tiebreak serving math', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    });

    const sixAllActions = reachSixAll();
    const atTiebreakStart = projectMatch(setup, sixAllActions);
    const afterOnePoint = projectMatch(setup, [...sixAllActions, ...scorePoints('team-1')]);
    const afterThreePoints = projectMatch(setup, [
      ...sixAllActions,
      ...scorePoints('team-1', 'team-2', 'team-2')
    ]);

    expect(atTiebreakStart.derived.servingTeam).toBe('team-1');
    expect(atTiebreakStart.derived.servingPlayerNumber).toBe(1);
    expect(afterOnePoint.derived.servingTeam).toBe('team-2');
    expect(afterOnePoint.derived.servingPlayerNumber).toBe(1);
    expect(afterThreePoints.derived.servingTeam).toBe('team-1');
    expect(afterThreePoints.derived.servingPlayerNumber).toBe(2);
  });

  test('carries next-set first server continuity through a tiebreak set', () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, [
      ...reachSixAll(),
      ...repeatAction('team-1', 6),
      ...repeatAction('team-2', 5),
      ...scorePoints('team-1')
    ]);
    const completedSet = projection.state.sets[0];

    expect(projection.derived.activeSetIndex).toBe(2);
    expect(getActiveSet(projection.state)?.firstServer).toBe('team-2');
    expect(projection.derived.servingTeam).toBe('team-2');
    expect(projection.derived.servingPlayerNumber).toBe(2);
    expect(
      completedSet && completedSet.completed ? getNextSetFirstServer(completedSet) : null
    ).toBe('team-2');
  });

  test('keeps serving-player rotation through a super tiebreak', () => {
    const setup = createTestSetup({
      format: 'best-of-1',
      decidingSetSuperTiebreak: true,
      bestOfOneDecidingBehavior: 'super-tiebreak'
    });
    const atStart = projectMatch(setup, []);
    const afterOnePoint = projectMatch(setup, scorePoints('team-1'));
    const afterThreePoints = projectMatch(setup, scorePoints('team-1', 'team-2', 'team-2'));

    expect(atStart.derived.servingTeam).toBe('team-1');
    expect(atStart.derived.servingPlayerNumber).toBe(1);
    expect(afterOnePoint.derived.servingTeam).toBe('team-2');
    expect(afterOnePoint.derived.servingPlayerNumber).toBe(1);
    expect(afterThreePoints.derived.servingTeam).toBe('team-1');
    expect(afterThreePoints.derived.servingPlayerNumber).toBe(2);
  });

  test('derives side-switch prompts from odd games within a set and every six tiebreak points', () => {
    const setup = createTestSetup({
      sideSwitchPrompts: true,
      format: 'best-of-1'
    });

    const afterOneGame = projectMatch(setup, winQuickGame('team-1'));
    const duringTiebreak = projectMatch(setup, [
      ...reachSixAll(),
      ...scorePoints('team-1', 'team-2', 'team-1', 'team-2', 'team-1', 'team-2')
    ]);

    expect(afterOneGame.derived.sideSwitch).toEqual({
      shouldPrompt: true,
      reason: 'odd-games'
    });
    expect(duringTiebreak.derived.sideSwitch).toEqual({
      shouldPrompt: true,
      reason: 'tiebreak-interval'
    });
  });

  test('prompts for the next set when the previous completed set had an odd total game count', () => {
    const setup = createTestSetup({
      sideSwitchPrompts: true
    });
    const projection = projectMatch(setup, [
      ...winQuickGame('team-1'),
      ...winQuickGame('team-1'),
      ...winQuickGame('team-1'),
      ...winQuickGame('team-1'),
      ...winQuickGame('team-1'),
      ...winQuickGame('team-2'),
      ...winQuickGame('team-1')
    ]);

    expect(projection.derived.activeSetIndex).toBe(2);
    expect(projection.derived.sideSwitch).toEqual({
      shouldPrompt: true,
      reason: 'odd-games'
    });
  });

  test('returns no serving team or side-switch prompt once the capped match is complete', () => {
    const setup = createTestSetup({
      format: 'best-of-1',
      sideSwitchPrompts: true
    });
    const projection = projectMatch(setup, winQuickSet('team-1'));

    expect(getServingTeam(projection.state)).toBeNull();
    expect(getServingPlayerNumber(projection.state)).toBeNull();
    expect(projection.derived.servingTeam).toBeNull();
    expect(projection.derived.servingPlayerNumber).toBeNull();
    expect(projection.derived.sideSwitch).toEqual({
      shouldPrompt: false,
      reason: null
    });
  });

  test('continues the same completed match without the original set cap', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    });
    const actions = winQuickSet('team-1');
    const completedProjection = projectMatch(setup, actions);
    const continuedSetup = continueMatch(setup, completedProjection.state);
    const continuedProjection = projectMatch(continuedSetup, actions);

    expect(completedProjection.derived.canContinuePlaying).toBe(true);
    expect(continuedSetup.setCap).toBeNull();
    expect(continuedProjection.derived.status).toBe('in-progress');
    expect(continuedProjection.derived.activeSetIndex).toBe(2);
    expect(continuedProjection.derived.canContinuePlaying).toBe(false);
    expect(getActiveSet(continuedProjection.state)?.firstServer).toBe('team-1');
  });
});
