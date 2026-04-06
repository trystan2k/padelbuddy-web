import { describe, expect, it } from 'vitest';

import { projectMatch } from '@/core/match/replay';
import {
  createMatchSpeechEvent,
  createPointScoredEvent,
  getPointPressureContext,
  getPressureTeam
} from '@/lib/speech/match-announcer';

import {
  createTestSetup,
  scorePoints,
  winQuickGame,
  winQuickSet
} from '../../core/match/test-helpers';

const team1Name = 'Ana & Bea';
const team2Name = 'Carla & Dani';

describe('match-announcer', () => {
  it('returns null when the action count did not change', () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, scorePoints('team-1'));

    expect(createMatchSpeechEvent(projection, projection, 1, 1, team1Name, team2Name)).toBeNull();
  });

  it('creates point-scored announcements with the current score payload', () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, scorePoints('team-1'));

    expect(createPointScoredEvent(projection, team1Name, team2Name)).toEqual({
      eventType: 'point-scored',
      gameMode: 'advantage',
      isCorrection: false,
      isTiebreak: false,
      servingIndicatorEnabled: true,
      servingTeam: 'team-1',
      team1Name,
      team1Score: '15',
      team2Name,
      team2Score: '0'
    });
  });

  it('marks undo announcements as corrections', () => {
    const setup = createTestSetup();
    const previousActions = scorePoints('team-1', 'team-1');
    const currentActions = scorePoints('team-1');
    const previousProjection = projectMatch(setup, previousActions);
    const currentProjection = projectMatch(setup, currentActions);

    expect(
      createMatchSpeechEvent(
        previousProjection,
        currentProjection,
        previousActions.length,
        currentActions.length,
        team1Name,
        team2Name
      )
    ).toEqual({
      eventType: 'point-scored',
      gameMode: 'advantage',
      isCorrection: true,
      isTiebreak: false,
      servingIndicatorEnabled: true,
      servingTeam: 'team-1',
      team1Name,
      team1Score: '15',
      team2Name,
      team2Score: '0'
    });
  });

  it('detects game winners before returning reset point scores', () => {
    const setup = createTestSetup();
    const previousActions = scorePoints('team-1', 'team-1', 'team-1');
    const currentActions = [...previousActions, ...scorePoints('team-1')];
    const previousProjection = projectMatch(setup, previousActions);
    const currentProjection = projectMatch(setup, currentActions);

    expect(
      createMatchSpeechEvent(
        previousProjection,
        currentProjection,
        previousActions.length,
        currentActions.length,
        team1Name,
        team2Name
      )
    ).toEqual({
      eventType: 'game-won',
      team1Name,
      team2Name,
      winningTeam: 'team-1'
    });
  });

  it('detects set pressure for the team that can win the set on the next point', () => {
    const setup = createTestSetup();
    const actions = [
      ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
      ...scorePoints('team-1', 'team-1', 'team-1')
    ];
    const projection = projectMatch(setup, actions);

    expect(getPressureTeam(projection, 'set')).toBe('team-1');
    expect(getPointPressureContext(projection)).toEqual({
      pressure: 'set-point',
      team: 'team-1'
    });
  });

  it('detects match pressure for the team that can win the match on the next point', () => {
    const setup = createTestSetup();
    const actions = [
      ...winQuickSet('team-1'),
      ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
      ...scorePoints('team-1', 'team-1', 'team-1')
    ];
    const projection = projectMatch(setup, actions);

    expect(getPressureTeam(projection, 'match')).toBe('team-1');
    expect(getPointPressureContext(projection)).toEqual({
      pressure: 'match-point',
      team: 'team-1'
    });
  });

  it('announces set winners when a completed set count increases', () => {
    const setup = createTestSetup();
    const previousActions = [
      ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
      ...scorePoints('team-1', 'team-1', 'team-1')
    ];
    const currentActions = [...previousActions, ...scorePoints('team-1')];
    const previousProjection = projectMatch(setup, previousActions);
    const currentProjection = projectMatch(setup, currentActions);

    expect(
      createMatchSpeechEvent(
        previousProjection,
        currentProjection,
        previousActions.length,
        currentActions.length,
        team1Name,
        team2Name
      )
    ).toEqual({
      eventType: 'set-won',
      team1Name,
      team2Name,
      winningTeam: 'team-1'
    });
  });

  it('announces match winners before set winners when the match finishes', () => {
    const setup = createTestSetup({ format: 'best-of-1' });
    const previousActions = [
      ...Array.from({ length: 5 }, () => winQuickGame('team-1')).flat(),
      ...scorePoints('team-1', 'team-1', 'team-1')
    ];
    const currentActions = [...previousActions, ...scorePoints('team-1')];
    const previousProjection = projectMatch(setup, previousActions);
    const currentProjection = projectMatch(setup, currentActions);

    expect(
      createMatchSpeechEvent(
        previousProjection,
        currentProjection,
        previousActions.length,
        currentActions.length,
        team1Name,
        team2Name
      )
    ).toEqual({
      eventType: 'match-won',
      team1Name,
      team2Name,
      winningTeam: 'team-1'
    });
  });

  it('does not flag pressure when golden point is tied at forty-all', () => {
    const setup = createTestSetup({ gameMode: 'golden-point' });
    const projection = projectMatch(
      setup,
      scorePoints('team-1', 'team-1', 'team-1', 'team-2', 'team-2', 'team-2')
    );

    expect(getPointPressureContext(projection)).toEqual({
      pressure: undefined,
      team: null
    });
  });
});
