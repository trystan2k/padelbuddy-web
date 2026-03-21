import type {
  MatchFormat,
  MatchProjection,
  MatchSetState,
  MatchTeamId,
  TeamScore
} from '@/core/match'

export interface MatchEndScreenSetRow {
  setNumber: number
  scores: TeamScore<number>
}

export interface MatchEndScreenSummary {
  winnerTeamId?: MatchTeamId
  winnerName?: string
  isFinishedEarly: boolean
  teamNames: TeamScore<string>
  format: MatchFormat
  setRows: MatchEndScreenSetRow[]
  totalGames: number
  elapsedSeconds: number
}

export interface CreateMatchEndScreenSummaryOptions {
  projection: MatchProjection
  startedAt: number
  finishedAt?: number
  now?: number
}

export interface MatchDurationParts {
  hours: number
  minutes: number
}

export function createMatchEndScreenSummary(
  options: CreateMatchEndScreenSummaryOptions
): MatchEndScreenSummary {
  const { projection, startedAt, finishedAt, now = Date.now() } = options
  const winner =
    projection.derived.winner ?? determineWinnerFromCompletedSets(projection.state.sets)

  const teamNames = createTeamNames(projection)

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
    setRows: projection.state.sets.map((set) => ({
      setNumber: set.index,
      scores: {
        'team-1': set.games['team-1'],
        'team-2': set.games['team-2']
      }
    })),
    totalGames: projection.state.sets.reduce(
      (total, set) => total + set.games['team-1'] + set.games['team-2'],
      0
    ),
    elapsedSeconds: Math.max(
      0,
      Math.floor(((typeof finishedAt === 'number' ? finishedAt : now) - startedAt) / 1000)
    )
  }
}

function determineWinnerFromCompletedSets(sets: MatchSetState[]): { teamId: MatchTeamId } | null {
  const completedSets = sets.filter((set) => set.completed)

  if (completedSets.length === 0) {
    return null
  }

  let team1Wins = 0
  let team2Wins = 0

  for (const set of completedSets) {
    if (set.games['team-1'] > set.games['team-2']) {
      team1Wins += 1
      continue
    }

    if (set.games['team-2'] > set.games['team-1']) {
      team2Wins += 1
    }
  }

  if (team1Wins > team2Wins) {
    return { teamId: 'team-1' }
  }

  if (team2Wins > team1Wins) {
    return { teamId: 'team-2' }
  }

  return null
}

export function getMatchDurationParts(elapsedSeconds: number): MatchDurationParts {
  const totalMinutes = Math.max(0, Math.floor(elapsedSeconds / 60))

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  }
}

function createTeamNames(projection: MatchProjection): TeamScore<string> {
  return {
    'team-1': getTeamName(projection, 'team-1'),
    'team-2': getTeamName(projection, 'team-2')
  }
}

function getTeamName(projection: MatchProjection, teamId: MatchTeamId): string {
  const side = projection.setup.sides.find((candidate) => candidate.id === teamId)

  if (!side) {
    return teamId
  }

  return side.playerNames.join(' & ')
}
