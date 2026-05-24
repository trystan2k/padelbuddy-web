import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('SetupScreen focus style regressions', () => {
  test('countdown duration option keeps visible focus ring', () => {
    const stylesheet = readFileSync('src/components/SetupScreen/SetupScreen.module.css', 'utf8');

    expect(stylesheet).toMatch(
      /\.countdownDurationOption:focus-visible\s*\{[^}]*outline:\s*2px\s+solid/s
    );
    expect(stylesheet).toMatch(
      /\.countdownDurationOption:focus-visible\s*\{[^}]*outline-offset:\s*2px/s
    );
  });
});
