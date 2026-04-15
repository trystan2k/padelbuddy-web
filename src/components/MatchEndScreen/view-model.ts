import { getMatchTeamName } from '@/core/match/team-name';
import type { MatchFormat, MatchProjection, MatchTeamId, TeamScore } from '@/core/match/types';
import { determineWinnerFromCompletedSets, getMatchDurationParts } from '@/lib/share/match-share';

export interface MatchEndScreenSetRow {
  setNumber: number;
  scores: TeamScore<number>;
  isSuperTiebreak: boolean;
}

interface MatchEndScreenSummary {
  winnerTeamId?: MatchTeamId;
  winnerName?: string;
  isFinishedEarly: boolean;
  teamNames: TeamScore<string>;
  format: MatchFormat;
  setRows: MatchEndScreenSetRow[];
  totalGames: number;
  elapsedSeconds: number;
}

interface CreateMatchEndScreenSummaryOptions {
  projection: MatchProjection;
  startedAt: number;
  finishedAt?: number;
  now?: number;
}

// Re-export for convenience (view-model consumers may need these)
export { getMatchDurationParts };

export function createMatchEndScreenSummary(
  options: CreateMatchEndScreenSummaryOptions
): MatchEndScreenSummary {
  const { projection, startedAt, finishedAt, now = Date.now() } = options;
  const winner =
    projection.derived.winner ?? determineWinnerFromCompletedSets(projection.state.sets);

  const teamNames = createTeamNames(projection);

  return {
    ...(winner
      ? {
          winnerTeamId: winner.teamId,
          winnerName: teamNames[winner.teamId]
        }
      : {}),
    isFinishedEarly: !winner,
    teamNames,
    format: projection.setup.format,
    setRows: projection.state.sets.map((set) => {
      const isSuperTiebreak = set.completed && set.mode === 'super-tiebreak';
      const tiebreakPoints = isSuperTiebreak ? set.tiebreakPoints : null;

      return {
        setNumber: set.index,
        scores:
          tiebreakPoints !== null
            ? tiebreakPoints
            : {
                'team-1': set.games['team-1'],
                'team-2': set.games['team-2']
              },
        isSuperTiebreak
      };
    }),
    totalGames: projection.state.sets.reduce(
      (total, set) => total + set.games['team-1'] + set.games['team-2'],
      0
    ),
    elapsedSeconds: Math.max(
      0,
      Math.floor(((typeof finishedAt === 'number' ? finishedAt : now) - startedAt) / 1000)
    )
  };
}

function createTeamNames(projection: MatchProjection): TeamScore<string> {
  return {
    'team-1': getMatchTeamName(projection.setup, 'team-1'),
    'team-2': getMatchTeamName(projection.setup, 'team-2')
  };
}
