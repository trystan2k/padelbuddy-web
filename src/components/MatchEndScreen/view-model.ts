import type { MatchFormat, MatchProjection, MatchTeamId, TeamScore } from '@/core/match'

export interface MatchEndScreenSetRow {
  setNumber: number
  scores: TeamScore<number>
}

export interface MatchEndScreenSummary {
  winnerTeamId: MatchTeamId
  winnerName: string
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
  const winner = projection.derived.winner

  if (!winner) {
    throw new Error('Match end screen summary requires a completed match projection.')
  }

  const teamNames = createTeamNames(projection)
  const completedSets = projection.state.sets.filter((set) => set.completed)

  return {
    winnerTeamId: winner.teamId,
    winnerName: teamNames[winner.teamId],
    teamNames,
    format: projection.setup.format,
    setRows: completedSets.map((set) => ({
      setNumber: set.index,
      scores: {
        'team-1': set.games['team-1'],
        'team-2': set.games['team-2']
      }
    })),
    totalGames: completedSets.reduce(
      (total, set) => total + set.games['team-1'] + set.games['team-2'],
      0
    ),
    elapsedSeconds: Math.max(
      0,
      Math.floor(((typeof finishedAt === 'number' ? finishedAt : now) - startedAt) / 1000)
    )
  }
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
