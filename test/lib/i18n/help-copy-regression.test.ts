import en from '@/lib/i18n/locales/en';
import es from '@/lib/i18n/locales/es';
import pt from '@/lib/i18n/locales/pt';
import { describe, expect, test } from 'vitest';

describe('help copy regressions for configurable super tiebreak target', () => {
  test('english help copy no longer hardcodes 10 points', () => {
    expect(en.help.page.setup.superTiebreak.body).not.toContain('10 points');
    expect(en.help.page.liveMatch.superTiebreak.body).not.toContain('10 points');
  });

  test('spanish help copy no longer hardcodes 10 points', () => {
    expect(es.help.page.setup.superTiebreak.body).not.toContain('10 puntos');
    expect(es.help.page.liveMatch.superTiebreak.body).not.toContain('10 puntos');
  });

  test('portuguese help copy no longer hardcodes 10 points', () => {
    expect(pt.help.page.setup.superTiebreak.body).not.toContain('10 pontos');
    expect(pt.help.page.liveMatch.superTiebreak.body).not.toContain('10 pontos');
  });
});
