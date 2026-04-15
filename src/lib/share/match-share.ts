import type { MatchSetState, MatchTeamId } from '@/core/match/types';

// ============================================================================
// Shared types
// ============================================================================

interface MatchDurationParts {
  hours: number;
  minutes: number;
}

export interface ShareLabels {
  shareText: string;
  finishedEarlyShareText: string;
  errorMessage: string;
  downloadMessage: string;
}

export interface ShareSummary {
  winnerTeamId?: MatchTeamId;
  isFinishedEarly: boolean;
  teamNames: { 'team-1': string; 'team-2': string };
  setRows: Array<{
    setNumber: number;
    scores: { 'team-1': number; 'team-2': number };
    isSuperTiebreak: boolean;
  }>;
  totalGames: number;
  elapsedSeconds: number;
}

export interface UseMatchShareOptions {
  captureRef: import('react').RefObject<HTMLDivElement | null>;
  finishedAt: number;
  summary: ShareSummary;
  labels: ShareLabels;
  shareScreenReady: boolean;
  onCaptureComplete: () => void;
}

export interface UseMatchShareResult {
  downloadMessage: string | null;
  errorMessage: string | null;
  handleShareClick: () => void;
  isSharing: boolean;
}

// ============================================================================
// Shared utilities
// ============================================================================

/**
 * Determines the winner based on completed sets only.
 * Used to determine match winner when a match is finished early.
 */
export function determineWinnerFromCompletedSets(
  sets: MatchSetState[]
): { teamId: MatchTeamId } | null {
  let team1Wins = 0;
  let team2Wins = 0;

  for (const set of sets) {
    if (set.mode === 'super-tiebreak') {
      if (!set.completed || set.tiebreakPoints === null) {
        continue;
      }

      if (set.tiebreakPoints['team-1'] > set.tiebreakPoints['team-2']) {
        team1Wins += 1;
        continue;
      }

      if (set.tiebreakPoints['team-2'] > set.tiebreakPoints['team-1']) {
        team2Wins += 1;
      }

      continue;
    }

    if (!set.completed) {
      continue;
    }

    if (set.games['team-1'] > set.games['team-2']) {
      team1Wins += 1;
      continue;
    }

    if (set.games['team-2'] > set.games['team-1']) {
      team2Wins += 1;
    }
  }

  if (team1Wins === 0 && team2Wins === 0) {
    return null;
  }

  if (team1Wins > team2Wins) {
    return { teamId: 'team-1' };
  }

  if (team2Wins > team1Wins) {
    return { teamId: 'team-2' };
  }

  return null;
}

/**
 * Formats elapsed seconds into hours and minutes.
 */
export function getMatchDurationParts(elapsedSeconds: number): MatchDurationParts {
  const totalMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
}
