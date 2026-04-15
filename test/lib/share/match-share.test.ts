import { describe, expect, test } from 'vitest';

import { determineWinnerFromCompletedSets, getMatchDurationParts } from '@/lib/share/match-share';
import type { MatchSetState } from '@/core/match/types';

function makeSet(index: number, team1Games: number, team2Games: number, completed = true) {
  const winner =
    team1Games > team2Games
      ? ('team-1' as const)
      : team2Games > team1Games
        ? ('team-2' as const)
        : null;

  return {
    index,
    completed,
    mode: 'standard' as const,
    games: { 'team-1': team1Games, 'team-2': team2Games },
    tiebreakPoints: null,
    winner,
    firstServer: 'team-1' as const
  };
}

describe('match-share', () => {
  describe('determineWinnerFromCompletedSets', () => {
    test('returns team-1 when team-1 wins more completed sets', () => {
      const sets = [makeSet(0, 6, 4), makeSet(1, 3, 6), makeSet(2, 6, 1)];

      expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toEqual({
        teamId: 'team-1'
      });
    });

    test('returns team-2 when team-2 wins more completed sets', () => {
      const sets = [makeSet(0, 4, 6), makeSet(1, 6, 4), makeSet(2, 2, 6)];

      expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toEqual({
        teamId: 'team-2'
      });
    });

    test('returns null when completed sets are tied', () => {
      const sets = [makeSet(0, 6, 4), makeSet(1, 4, 6)];

      expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toBeNull();
    });

    test('returns null when no completed sets exist', () => {
      const sets = [makeSet(0, 3, 2, false)];

      expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toBeNull();
    });

    test('ignores in-progress sets and counts only completed ones', () => {
      const sets = [makeSet(0, 6, 4), makeSet(1, 3, 5, false)];

      expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toEqual({
        teamId: 'team-1'
      });
    });
  });

  describe('getMatchDurationParts', () => {
    test('returns zero hours and minutes for less than 60 seconds', () => {
      expect(getMatchDurationParts(59)).toEqual({ hours: 0, minutes: 0 });
    });

    test('returns correct minutes for under an hour', () => {
      expect(getMatchDurationParts(30 * 60)).toEqual({ hours: 0, minutes: 30 });
    });

    test('returns hours and minutes for over an hour', () => {
      expect(getMatchDurationParts(82 * 60)).toEqual({ hours: 1, minutes: 22 });
    });

    test('clamps negative values to zero', () => {
      expect(getMatchDurationParts(-100)).toEqual({ hours: 0, minutes: 0 });
    });
  });
});
