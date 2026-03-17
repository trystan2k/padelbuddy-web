import { createMatchSetup, projectMatch, type MatchSetup, type MatchAction } from '@/core/match'

/**
 * Mock match data for development and based on Pencil design.
 * Node ID: VSRKf shows 41 min elapsed time: 41 minutes (approx 41 * 60 * 1000 ms)
 */
export const mockMatchSetup: MatchSetup = createMatchSetup({
  format: 'best-of-3',
  gameMode: 'golden-point',
  initialServer: 'team-1',
  decidingSetSuperTiebreak: true,
  sideSwitchPrompts: true,
  sides: [
    { id: 'team-1', playerNames: ['Alvaro', 'Enrique'] },
    { id: 'team-2', playerNames: ['Pablo', 'Thiago'] }
  ]
})

/**
 * Mock actions - Team 1 wins enough points to win first game
 */
export const mockMatchActions: MatchAction[] = Array.from({ length: 4 }, () => ({
  type: 'score-point' as const,
  teamId: 'team-1' as const
}))

/**
 * Mock started at timestamp - 41 minutes ago
 */
export const mockStartedAt: number = Date.now() - 41 * 60 * 1000

/**
 * Generate a match state from the mock setup and actions
 */
export const mockMatchProjection = projectMatch(mockMatchSetup, mockMatchActions)
