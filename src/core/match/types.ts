export const matchFormats = ['best-of-3', 'best-of-5'] as const

export type MatchFormat = (typeof matchFormats)[number]

export interface MatchSide {
  id: string
  playerNames: string[]
}

export interface MatchSetup {
  format: MatchFormat
  sides: [MatchSide, MatchSide]
}

export const defaultMatchFormat: MatchFormat = matchFormats[0]
