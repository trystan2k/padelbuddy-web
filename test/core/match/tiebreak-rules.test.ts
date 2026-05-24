import { describe, expect, test } from 'vitest';

import { projectMatch } from '@/core/match/replay';

import {
  createTestSetup,
  reachSixAll,
  repeatAction,
  scorePoints,
  winQuickSet
} from './test-helpers';

describe('tiebreak and super-tiebreak rules', () => {
  test('enters a standard tiebreak at 6-6 and records the final set score as 7-6', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    });
    const actions = [
      ...reachSixAll(),
      ...repeatAction('team-1', 6),
      ...repeatAction('team-2', 5),
      ...scorePoints('team-1')
    ];
    const projection = projectMatch(setup, actions);
    const completedSet = projection.state.sets[0];

    expect(completedSet).toMatchObject({
      completed: true,
      winner: 'team-1',
      games: {
        'team-1': 7,
        'team-2': 6
      },
      tiebreakPoints: {
        'team-1': 7,
        'team-2': 5
      }
    });
    expect(projection.derived.status).toBe('completed');
  });

  test('uses a super tiebreak as the deciding set in best-of-3 when configured', () => {
    const setup = createTestSetup({
      decidingSetSuperTiebreak: true
    });
    const actions = [...winQuickSet('team-1'), ...winQuickSet('team-2')];
    const projection = projectMatch(setup, actions);
    const activeSet = projection.state.sets[2];

    expect(activeSet).toMatchObject({
      index: 3,
      completed: false,
      mode: 'super-tiebreak'
    });
    expect(projection.derived.scoreDisplay).toEqual({
      kind: 'tiebreak',
      points: {
        'team-1': 0,
        'team-2': 0
      }
    });
  });

  test('uses a super tiebreak as the deciding set in best-of-5 when configured', () => {
    const setup = createTestSetup({
      format: 'best-of-5',
      decidingSetSuperTiebreak: true
    });
    const actions = [
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2'),
      ...winQuickSet('team-1'),
      ...winQuickSet('team-2')
    ];
    const projection = projectMatch(setup, actions);
    const activeSet = projection.state.sets[4];

    expect(activeSet).toMatchObject({
      index: 5,
      completed: false,
      mode: 'super-tiebreak'
    });
    expect(projection.derived.activeSetIndex).toBe(5);
  });

  test.each([7, 9, 11] as const)(
    'resolves deciding-set super tiebreak target %i with win-by-2',
    (targetPoints) => {
      const setup = createTestSetup({
        decidingSetSuperTiebreak: true,
        superTiebreakTargetPoints: targetPoints
      });
      const projection = projectMatch(setup, [
        ...winQuickSet('team-1'),
        ...winQuickSet('team-2'),
        ...repeatAction('team-1', targetPoints - 1),
        ...repeatAction('team-2', targetPoints - 2),
        ...scorePoints('team-1')
      ]);

      expect(projection.derived.status).toBe('completed');
      expect(projection.derived.winner?.teamId).toBe('team-1');
      expect(projection.state.sets[2]).toMatchObject({
        completed: true,
        mode: 'super-tiebreak',
        winner: 'team-1',
        tiebreakPoints: {
          'team-1': targetPoints,
          'team-2': targetPoints - 2
        }
      });
    }
  );

  test('supports best-of-1 matches that are themselves super tiebreak deciders', () => {
    const setup = createTestSetup({
      format: 'best-of-1',
      decidingSetSuperTiebreak: true,
      bestOfOneDecidingBehavior: 'super-tiebreak',
      superTiebreakTargetPoints: 9
    });
    const projection = projectMatch(setup, [
      ...repeatAction('team-2', 7),
      ...repeatAction('team-1', 7),
      ...scorePoints('team-2', 'team-2')
    ]);

    expect(projection.derived.status).toBe('completed');
    expect(projection.derived.winner?.teamId).toBe('team-2');
    expect(projection.state.sets[0]).toMatchObject({
      completed: true,
      mode: 'super-tiebreak',
      tiebreakPoints: {
        'team-1': 7,
        'team-2': 9
      }
    });
  });
});
