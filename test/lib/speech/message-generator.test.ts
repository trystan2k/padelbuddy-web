import { beforeEach, describe, expect, it } from 'vitest';

import { i18n, initializeI18n, resetI18nInitialization } from '@/lib/i18n/i18n';
import { formatScoreDisplay, generateSpeechMessage } from '@/lib/speech/message-generator';

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
      all: 'All',
      deuce: 'Deuce',
      goldenPoint: 'Golden Point',
      correction: 'Correction.',
      advantageTeam: 'Advantage {{teamName}}',
      gamePoint: 'Game point {{teamName}}',
      breakPoint: 'Break point',
      setPoint: 'Set point {{teamName}}',
      matchPoint: 'Match point {{teamName}}'
    }
  },
  setup: {
    teams: {
      team1Default: 'Team A',
      team2Default: 'Team B'
    }
  }
};

describe('message-generator', () => {
  beforeEach(async () => {
    await resetI18nInitialization();
    await initializeI18n();
    i18n.addResourceBundle('en', 'translation', testTranslations, true, true);
    await i18n.changeLanguage('en');
  });

  describe('point-scored', () => {
    it('returns null for minimal verbosity', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '0',
          verbosity: 'minimal'
        })
      ).toBeNull();
    });

    it('uses chair-umpire standard score phrasing', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '0',
          verbosity: 'standard'
        })
      ).toBe('Fifteen - Love');
    });

    it('announces all scores with the all term', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '30',
          team2Score: '30',
          verbosity: 'standard'
        })
      ).toBe('Thirty - All');
    });

    it('announces deuce in advantage mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '40',
          team2Score: '40',
          gameMode: 'advantage',
          verbosity: 'standard'
        })
      ).toBe('Deuce');
    });

    it('announces golden point in golden-point mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '40',
          team2Score: '40',
          gameMode: 'golden-point',
          verbosity: 'standard'
        })
      ).toBe('Golden Point');
    });

    it('prefixes corrections on undo announcements', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '30',
          team2Score: '15',
          isCorrection: true,
          verbosity: 'standard'
        })
      ).toBe('Correction. Thirty - Fifteen');
    });

    it('appends game point for the serving team', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '40',
          team2Score: '15',
          servingTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          pointPressure: 'game-point',
          verbosity: 'standard'
        })
      ).toBe('Forty - Fifteen. Game point Team A');
    });

    it('appends break point for the receiving team', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '40',
          servingTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          pointPressure: 'break-point',
          verbosity: 'standard'
        })
      ).toBe('Fifteen - Forty. Break point');
    });

    it('appends set point for the team that can win the set next', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '40',
          team2Score: '30',
          team1Name: 'Team A',
          team2Name: 'Team B',
          pointPressure: 'set-point',
          pointPressureTeam: 'team-1',
          verbosity: 'standard'
        })
      ).toBe('Forty - Thirty. Set point Team A');
    });

    it('appends match point for the team that can win the match next', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '40',
          team2Score: '15',
          team1Name: 'Team A',
          team2Name: 'Team B',
          pointPressure: 'match-point',
          pointPressureTeam: 'team-1',
          verbosity: 'standard'
        })
      ).toBe('Forty - Fifteen. Match point Team A');
    });

    it('announces serving team score first when team-1 serves', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '0',
          servingTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Fifteen - Love');
    });

    it('announces serving team score first when team-2 serves and team-2 leads', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '0',
          team2Score: '15',
          servingTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Fifteen - Love');
    });

    it('announces receiving team score first when team-2 serves and team-1 leads', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: '0',
          servingTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Love - Fifteen');
    });

    it('does not change tiebreak score order based on serving team', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: 7,
          team2Score: 5,
          servingTeam: 'team-2',
          isTiebreak: true,
          verbosity: 'standard'
        })
      ).toBe('7-5');
    });

    it('keeps tiebreak announcements numeric', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: 7,
          team2Score: 5,
          isTiebreak: true,
          verbosity: 'standard'
        })
      ).toBe('7-5');
    });

    it('prefixes corrections on tiebreak announcements', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: 7,
          team2Score: 5,
          isTiebreak: true,
          isCorrection: true,
          verbosity: 'standard'
        })
      ).toBe('Correction. 7-5');
    });

    it('appends match point on tiebreak announcements', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: 6,
          team2Score: 5,
          isTiebreak: true,
          team1Name: 'Team A',
          team2Name: 'Team B',
          pointPressure: 'match-point',
          pointPressureTeam: 'team-1',
          verbosity: 'standard'
        })
      ).toBe('6-5. Match point Team A');
    });

    it('normalizes lowercase advantage score labels', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: 'ad',
          team2Score: '40',
          verbosity: 'standard'
        })
      ).toBe('Advantage Team A');
    });

    it('announces advantage for team 2 by team name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '40',
          team2Score: 'ad',
          team1Name: 'Sharks',
          team2Name: 'Lions',
          verbosity: 'standard'
        })
      ).toBe('Advantage Lions');
    });

    it('uses chair-umpire phrasing in verbose mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '30',
          team2Score: '15',
          verbosity: 'verbose'
        })
      ).toBe('Thirty - Fifteen');
    });

    it('returns null when team1Score is undefined', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: undefined as unknown as '15',
          team2Score: '0',
          verbosity: 'standard'
        })
      ).toBeNull();
    });

    it('returns null when team1Score is null', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: null as unknown as '15',
          team2Score: '0',
          verbosity: 'standard'
        })
      ).toBeNull();
    });

    it('returns null when team2Score is undefined', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: undefined as unknown as '0',
          verbosity: 'standard'
        })
      ).toBeNull();
    });

    it('returns null when team2Score is null', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: '15',
          team2Score: null as unknown as '0',
          verbosity: 'standard'
        })
      ).toBeNull();
    });
  });

  describe('game-won', () => {
    it('returns the minimal announcement without a team name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'game-won',
          winningTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'minimal'
        })
      ).toBe('Game');
    });

    it('includes the winning team name outside minimal mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'game-won',
          winningTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Game, Team B');
    });

    it('announces game won by team-2 with name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'game-won',
          winningTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Game, Team B');
    });

    it('returns Game when winningTeam is invalid', () => {
      expect(
        generateSpeechMessage({
          eventType: 'game-won',
          winningTeam: 'invalid-team' as 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Game');
    });

    it('returns Game when winner name is missing despite non-minimal verbosity', () => {
      expect(
        generateSpeechMessage({
          eventType: 'game-won',
          winningTeam: 'team-1',
          team1Name: '',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Game');
    });
  });

  describe('set-won', () => {
    it('returns the minimal announcement without a team name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'set-won',
          winningTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'minimal'
        })
      ).toBe('Set');
    });

    it('includes the winning team name outside minimal mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'set-won',
          winningTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Set, Team A');
    });

    it('announces set won by team-2 with name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'set-won',
          winningTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Set, Team B');
    });

    it('returns Set when winningTeam is invalid', () => {
      expect(
        generateSpeechMessage({
          eventType: 'set-won',
          winningTeam: 'invalid-team' as 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Set');
    });

    it('returns Set when winner name is missing despite non-minimal verbosity', () => {
      expect(
        generateSpeechMessage({
          eventType: 'set-won',
          winningTeam: 'team-1',
          team1Name: '',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Set');
    });
  });

  describe('match-won', () => {
    it('returns the minimal announcement without a team name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'match-won',
          winningTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'minimal'
        })
      ).toBe('Match');
    });

    it('includes the winning team name outside minimal mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'match-won',
          winningTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Match, Team A');
    });

    it('announces match won by team-2 with name', () => {
      expect(
        generateSpeechMessage({
          eventType: 'match-won',
          winningTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Match, Team B');
    });

    it('returns Match when winningTeam is invalid', () => {
      expect(
        generateSpeechMessage({
          eventType: 'match-won',
          winningTeam: 'invalid-team' as 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Match');
    });

    it('returns Match when winner name is missing despite non-minimal verbosity', () => {
      expect(
        generateSpeechMessage({
          eventType: 'match-won',
          winningTeam: 'team-1',
          team1Name: '',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Match');
    });
  });

  describe('server-change', () => {
    it('returns null for minimal verbosity', () => {
      expect(
        generateSpeechMessage({
          eventType: 'server-change',
          servingTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'minimal'
        })
      ).toBeNull();
    });

    it('announces the serving team in standard mode', () => {
      expect(
        generateSpeechMessage({
          eventType: 'server-change',
          servingTeam: 'team-1',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Serving Team A');
    });

    it('returns null when the serving team is missing', () => {
      expect(
        generateSpeechMessage({
          eventType: 'server-change',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBeNull();
    });

    it('returns null when the serving team name is missing', () => {
      expect(
        generateSpeechMessage({
          eventType: 'server-change',
          servingTeam: 'team-1',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBeNull();
    });

    it('announces server change for team-2', () => {
      expect(
        generateSpeechMessage({
          eventType: 'server-change',
          servingTeam: 'team-2',
          team1Name: 'Team A',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBe('Serving Team B');
    });

    it('returns null when servingTeam name is empty string', () => {
      expect(
        generateSpeechMessage({
          eventType: 'server-change',
          servingTeam: 'team-1',
          team1Name: '',
          team2Name: 'Team B',
          verbosity: 'standard'
        })
      ).toBeNull();
    });
  });

  describe('getScoreWord fallback', () => {
    it('returns String(score) for unknown score values', () => {
      expect(
        generateSpeechMessage({
          eventType: 'point-scored',
          team1Score: 'unknown' as '15',
          team2Score: '0',
          verbosity: 'standard'
        })
      ).toBe('unknown - Love');
    });
  });

  describe('unknown event type', () => {
    it('returns null', () => {
      expect(
        generateSpeechMessage({
          eventType: 'unknown-event' as never,
          verbosity: 'standard'
        })
      ).toBeNull();
    });
  });

  describe('formatScoreDisplay', () => {
    it('keeps minimal display numeric', () => {
      expect(formatScoreDisplay(15, 0, 'minimal')).toBe('15-0');
    });

    it('translates standard display scores', () => {
      expect(formatScoreDisplay('15', '0', 'standard')).toBe('Fifteen-Love');
    });

    it('normalizes lowercase ad for display formatting', () => {
      expect(formatScoreDisplay('ad', '40', 'standard')).toBe('Advantage-Forty');
    });
  });
});
