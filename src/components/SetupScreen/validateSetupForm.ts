import { countdownTimerDurations } from '@/core/match/types';

import type { SetupFormData, FieldErrors } from './types';

export function validateSetupForm(data: SetupFormData): { isValid: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {};

  // Validate team names
  if (!data.team1Name.trim()) {
    errors.team1Name = 'setup.validation.teamNamesRequired';
  }
  if (!data.team2Name.trim()) {
    errors.team2Name = 'setup.validation.teamNamesRequired';
  }

  if (!countdownTimerDurations.includes(data.countdownTimerDuration)) {
    errors.countdownTimerDuration = 'setup.validation.invalidCountdownDuration';
  }

  // Format is always selected by default (best-of-3), so no validation needed

  // Initial server is always selected by default (team-1), so no validation needed

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
