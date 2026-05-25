import { describe, expect, test } from 'vitest';

import {
  formatSetSummaryScore,
  getSetSummaryScoreParts,
  getSetSummaryScores
} from '@/core/match/set-summary';
import type { MatchSetState } from '@/core/match/types';

describe('set summary formatter', () => {
  test('shows both tiebreak point totals for completed standard tiebreak when team-1 wins', () => {
    const set: MatchSetState = {
      index: 1,
      mode: 'standard',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 7, 'team-2': 6 },
      tiebreakPoints: { 'team-1': 8, 'team-2': 6 }
    };

    expect(getSetSummaryScores(set)).toEqual({ 'team-1': '7 (8)', 'team-2': '6 (6)' });
    expect(formatSetSummaryScore(set)).toBe('7 (8) - 6 (6)');
    expect(getSetSummaryScoreParts(set)).toEqual({
      'team-1': { games: '7', tiebreakPoints: '8' },
      'team-2': { games: '6', tiebreakPoints: '6' }
    });
  });

  test('shows both tiebreak point totals when team-2 wins', () => {
    const set: MatchSetState = {
      index: 2,
      mode: 'standard',
      firstServer: 'team-2',
      completed: true,
      winner: 'team-2',
      games: { 'team-1': 6, 'team-2': 7 },
      tiebreakPoints: { 'team-1': 8, 'team-2': 10 }
    };

    expect(formatSetSummaryScore(set)).toBe('6 (8) - 7 (10)');
  });

  test('keeps plain score for non-tiebreak standard sets', () => {
    const set: MatchSetState = {
      index: 1,
      mode: 'standard',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 6, 'team-2': 4 },
      tiebreakPoints: null
    };

    expect(formatSetSummaryScore(set)).toBe('6 - 4');
  });

  test('keeps super tiebreak behavior using completed tiebreak points', () => {
    const set: MatchSetState = {
      index: 3,
      mode: 'super-tiebreak',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 1, 'team-2': 0 },
      tiebreakPoints: { 'team-1': 11, 'team-2': 9 }
    };

    expect(formatSetSummaryScore(set)).toBe('11 - 9');
  });

  test('does not show completed tiebreak winner notation early for in-progress sets', () => {
    const set: MatchSetState = {
      index: 1,
      mode: 'standard',
      firstServer: 'team-1',
      completed: false,
      games: { 'team-1': 6, 'team-2': 6 },
      game: {
        kind: 'tiebreak',
        targetPoints: 7,
        points: { 'team-1': 5, 'team-2': 4 }
      }
    };

    expect(formatSetSummaryScore(set)).toBe('6 - 6');
  });

  test('falls back to plain score when legacy completed tiebreak has null tiebreakPoints', () => {
    const set: MatchSetState = {
      index: 1,
      mode: 'standard',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 7, 'team-2': 6 },
      tiebreakPoints: null
    };

    expect(formatSetSummaryScore(set)).toBe('7 - 6');
  });
});
