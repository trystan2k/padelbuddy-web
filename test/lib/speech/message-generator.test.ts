import { beforeEach, describe, expect, it } from 'vitest'

import { i18n, initializeI18n } from '@/lib/i18n'
import { resetI18nInitialization } from '@/lib/i18n/i18n'

import { formatScoreDisplay, generateSpeechMessage } from '@/lib/speech/message-generator'

// Test translations for speech messages
const testTranslations = {
  score: {
    points: {
      '0': 'Love',
      '15': 'Fifteen',
      '30': 'Thirty',
      '40': 'Forty',
      Ad: 'Advantage'
    },
    announcements: {
      game: 'Game',
      set: 'Set',
      match: 'Match',
      serving: 'Serving',
      all: 'all'
    }
  }
}

describe('message-generator', () => {
  beforeEach(async () => {
    // Reset i18n initialization state for each test
    resetI18nInitialization()

    // Initialize i18n without backend for tests (resources added manually)
    await initializeI18n()

    // Add test translations directly to i18n
    i18n.addResourceBundle('en', 'translation', testTranslations, true, true)
    await i18n.changeLanguage('en')
  })

  describe('point-scored', () => {
    it('returns null for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0',
        verbosity: 'minimal'
      })
      expect(message).toBeNull()
    })

    it('returns simple score for standard verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0',
        verbosity: 'standard'
      })
      expect(message).toBe('15-0')
    })

    it('returns numeric score for tiebreak', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: 5,
        team2Score: 3,
        isTiebreak: true,
        verbosity: 'standard'
      })
      expect(message).toBe('5-3')
    })

    it('returns "all" score when scores are equal (verbose)', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '15',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'verbose'
      })
      expect(message).toBe('Fifteen all')
    })
  })

  describe('game-won', () => {
    it('returns just "Game" for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'game-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'minimal'
      })
      expect(message).toBe('Game')
    })

    it('includes team name for standard verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'game-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'standard'
      })
      expect(message).toBe('Game, Team A')
    })

    it('includes team name for verbose verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'game-won',
        winningTeam: 'team-2',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'verbose'
      })
      expect(message).toBe('Game, Team B')
    })
  })

  describe('set-won', () => {
    it('returns just "Set" for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'set-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'minimal'
      })
      expect(message).toBe('Set')
    })

    it('includes team name for standard verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'set-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'standard'
      })
      expect(message).toBe('Set, Team A')
    })
  })

  describe('match-won', () => {
    it('returns just "Match" for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'match-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'minimal'
      })
      expect(message).toBe('Match')
    })

    it('includes team name for standard verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'match-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'standard'
      })
      expect(message).toBe('Match, Team A')
    })
  })

  describe('server-change', () => {
    it('returns null for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'server-change',
        servingTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'minimal'
      })
      expect(message).toBeNull()
    })

    it('returns server announcement for standard verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'server-change',
        servingTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'standard'
      })
      expect(message).toBe('Serving Team A')
    })

    it('returns server announcement for verbose verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'server-change',
        servingTeam: 'team-2',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'verbose'
      })
      expect(message).toBe('Serving Team B')
    })

    it('returns null when servingTeam is missing', () => {
      const message = generateSpeechMessage({
        eventType: 'server-change',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'standard'
      })
      expect(message).toBeNull()
    })

    it('returns null when team name is missing for the serving team', () => {
      const message = generateSpeechMessage({
        eventType: 'server-change',
        servingTeam: 'team-1',
        team2Name: 'Team B',
        verbosity: 'standard'
      })
      expect(message).toBeNull()
    })
  })

  describe('unknown event type', () => {
    it('returns null for unknown event types', () => {
      // Cast to bypass TypeScript for testing unknown event type
      const message = generateSpeechMessage({
        eventType: 'unknown-event' as 'point-scored',
        verbosity: 'standard'
      })
      expect(message).toBeNull()
    })
  })

  describe('formatVerboseScore', () => {
    it('returns verbose score without serving info when no servingTeam', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '30',
        team2Score: '15',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'verbose'
      })
      expect(message).toBe('Thirty Fifteen')
    })

    it('returns verbose score with serving info when servingTeam is team-1', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '40',
        team2Score: '15',
        team1Name: 'Team A',
        team2Name: 'Team B',
        servingTeam: 'team-1',
        verbosity: 'verbose'
      })
      expect(message).toBe('Forty Fifteen, Serving Team A')
    })

    it('returns verbose score with serving info when servingTeam is team-2', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '0',
        team2Score: '40',
        team1Name: 'Team A',
        team2Name: 'Team B',
        servingTeam: 'team-2',
        verbosity: 'verbose'
      })
      expect(message).toBe('Love Forty, Serving Team B')
    })

    it('uses default team names when not provided', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0',
        servingTeam: 'team-1',
        verbosity: 'verbose'
      })
      expect(message).toBe('Fifteen Love, Serving Team 1')
    })

    it('handles advantage score in verbose mode', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: 'Ad',
        team2Score: '40',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'verbose'
      })
      expect(message).toBe('Advantage Forty')
    })

    it('handles unknown score values by passing through', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: 'unknown' as '15',
        team2Score: '0',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'verbose'
      })
      expect(message).toBe('unknown Love')
    })
  })

  describe('tiebreak in verbose mode', () => {
    it('returns numeric score for tiebreak even in verbose mode', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: 7,
        team2Score: 5,
        isTiebreak: true,
        verbosity: 'verbose'
      })
      expect(message).toBe('7-5')
    })

    it('returns numeric score for tiebreak in minimal mode (null)', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: 7,
        team2Score: 5,
        isTiebreak: true,
        verbosity: 'minimal'
      })
      expect(message).toBeNull()
    })
  })

  describe('formatScoreDisplay', () => {
    it('returns simple score for minimal verbosity', () => {
      const display = formatScoreDisplay(15, 0, 'minimal')
      expect(display).toBe('15-0')
    })

    it('returns translated score for standard verbosity', () => {
      const display = formatScoreDisplay('15', '0', 'standard')
      expect(display).toBe('Fifteen-Love')
    })

    it('returns translated score for verbose verbosity', () => {
      const display = formatScoreDisplay('30', '40', 'verbose')
      expect(display).toBe('Thirty-Forty')
    })

    it('handles numeric scores', () => {
      const display = formatScoreDisplay(6, 4, 'standard')
      expect(display).toBe('6-4')
    })

    it('handles advantage score', () => {
      const display = formatScoreDisplay('Ad', '40', 'standard')
      expect(display).toBe('Advantage-Forty')
    })

    it('passes through unknown score values', () => {
      const display = formatScoreDisplay('unknown' as '15', '0', 'standard')
      expect(display).toBe('unknown-Love')
    })
  })
})
