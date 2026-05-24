import { describe, expect, test } from 'vitest';

import {
  getSetDisplayScore,
  getSetsHistoryAutoOpenSignature,
  getSetsWonScore
} from '@/components/ActiveMatchScreen/sets-history';
import type { MatchSetState } from '@/core/match/types';

describe('sets-history display score', () => {
  test('uses tiebreak points for completed super-tiebreak sets when available', () => {
    const set: MatchSetState = {
      index: 3,
      mode: 'super-tiebreak',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 0, 'team-2': 0 },
      tiebreakPoints: { 'team-1': 11, 'team-2': 9 }
    };

    expect(getSetDisplayScore(set)).toEqual({ 'team-1': 11, 'team-2': 9 });
  });

  test('uses legacy final tiebreak game points when completed super-tiebreak has null tiebreakPoints', () => {
    const setWithLegacyGameShape = {
      index: 3,
      mode: 'super-tiebreak',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 0, 'team-2': 0 },
      tiebreakPoints: null,
      game: {
        kind: 'tiebreak',
        points: { 'team-1': 12, 'team-2': 10 }
      }
    } as MatchSetState;

    expect(getSetDisplayScore(setWithLegacyGameShape)).toEqual({ 'team-1': 12, 'team-2': 10 });
  });

  test('falls back to set games when completed super-tiebreak has no recoverable tiebreak score', () => {
    const set: MatchSetState = {
      index: 3,
      mode: 'super-tiebreak',
      firstServer: 'team-1',
      completed: true,
      winner: 'team-1',
      games: { 'team-1': 1, 'team-2': 0 },
      tiebreakPoints: null
    };

    expect(getSetDisplayScore(set)).toEqual({ 'team-1': 1, 'team-2': 0 });
  });
});

describe('sets-history aggregate score', () => {
  test('counts completed sets won by each team', () => {
    const sets: MatchSetState[] = [
      {
        index: 1,
        mode: 'standard',
        firstServer: 'team-1',
        completed: true,
        winner: 'team-1',
        games: { 'team-1': 6, 'team-2': 4 },
        tiebreakPoints: null
      },
      {
        index: 2,
        mode: 'standard',
        firstServer: 'team-2',
        completed: true,
        winner: 'team-2',
        games: { 'team-1': 3, 'team-2': 6 },
        tiebreakPoints: null
      },
      {
        index: 3,
        mode: 'super-tiebreak',
        firstServer: 'team-1',
        completed: false,
        games: { 'team-1': 0, 'team-2': 0 },
        game: {
          kind: 'tiebreak',
          targetPoints: 11,
          points: { 'team-1': 8, 'team-2': 7 }
        }
      }
    ];

    expect(getSetsWonScore(sets)).toEqual({ 'team-1': 1, 'team-2': 1 });
  });
});

describe('sets-history auto-open signature', () => {
  test('changes only when completed sets change', () => {
    const baseSets: MatchSetState[] = [
      {
        index: 1,
        mode: 'standard',
        firstServer: 'team-1',
        completed: false,
        games: { 'team-1': 3, 'team-2': 2 },
        game: {
          kind: 'standard',
          points: { 'team-1': 30, 'team-2': 30 },
          advantageTeam: null
        }
      }
    ];

    const sameCompletedButDifferentGameProgress: MatchSetState[] = [
      {
        index: 1,
        mode: 'standard',
        firstServer: 'team-1',
        completed: false,
        games: { 'team-1': 4, 'team-2': 2 },
        game: {
          kind: 'standard',
          points: { 'team-1': 30, 'team-2': 30 },
          advantageTeam: null
        }
      }
    ];

    const afterSetCompletion: MatchSetState[] = [
      {
        index: 1,
        mode: 'standard',
        firstServer: 'team-1',
        completed: true,
        winner: 'team-1',
        games: { 'team-1': 6, 'team-2': 2 },
        tiebreakPoints: null
      }
    ];

    expect(getSetsHistoryAutoOpenSignature(baseSets)).toBe(
      getSetsHistoryAutoOpenSignature(sameCompletedButDifferentGameProgress)
    );
    expect(getSetsHistoryAutoOpenSignature(baseSets)).not.toBe(
      getSetsHistoryAutoOpenSignature(afterSetCompletion)
    );
  });
});
