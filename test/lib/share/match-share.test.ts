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

function makeSuperTiebreakSet(
  index: number,
  team1Points: number,
  team2Points: number,
  completed = true
) {
  const winner =
    team1Points > team2Points
      ? ('team-1' as const)
      : team2Points > team1Points
        ? ('team-2' as const)
        : null;

  return {
    index,
    completed,
    mode: 'super-tiebreak' as const,
    games: { 'team-1': 0, 'team-2': 0 },
    tiebreakPoints: { 'team-1': team1Points, 'team-2': team2Points },
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

    describe('super-tiebreak sets', () => {
      test('returns team-1 when team-1 wins completed super-tiebreak', () => {
        const sets = [makeSuperTiebreakSet(0, 10, 7)];

        expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toEqual({
          teamId: 'team-1'
        });
      });

      test('returns team-2 when team-2 wins completed super-tiebreak', () => {
        const sets = [makeSuperTiebreakSet(0, 6, 10)];

        expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toEqual({
          teamId: 'team-2'
        });
      });

      test('ignores in-progress super-tiebreak (completed=false)', () => {
        const sets = [makeSuperTiebreakSet(0, 5, 3, false)];

        expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toBeNull();
      });

      test('ignores super-tiebreak with null tiebreakPoints', () => {
        const sets = [
          {
            index: 0,
            completed: true,
            mode: 'super-tiebreak' as const,
            games: { 'team-1': 0, 'team-2': 0 },
            tiebreakPoints: null,
            winner: null,
            firstServer: 'team-1' as const
          }
        ];

        expect(determineWinnerFromCompletedSets(sets as unknown as MatchSetState[])).toBeNull();
      });

      test('counts both standard and super-tiebreak completed sets', () => {
        const sets = [makeSet(0, 6, 4), makeSuperTiebreakSet(1, 10, 8)];

        expect(determineWinnerFromCompletedSets(sets as MatchSetState[])).toEqual({
          teamId: 'team-1'
        });
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
