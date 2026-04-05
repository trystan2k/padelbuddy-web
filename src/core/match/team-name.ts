import type { MatchSetup, MatchTeamId } from './types'

export function getMatchTeamName(setup: MatchSetup, teamId: MatchTeamId): string {
  const side = setup.sides.find((candidate) => candidate.id === teamId)

  if (!side) {
    return teamId
  }

  return side.playerNames.join(' & ')
}
