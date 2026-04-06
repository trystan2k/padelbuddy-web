import { deriveMatchState } from './derived-state';
import { applyMatchAction, createInitialMatchState } from './engine';
import type { MatchAction, MatchProjection, MatchSetup, MatchState } from './types';

export function projectMatchState(setup: MatchSetup, actions: MatchAction[]): MatchState {
  return actions.reduce(
    (state, action) => applyMatchAction(setup, state, action),
    createInitialMatchState(setup)
  );
}

export function projectMatch(setup: MatchSetup, actions: MatchAction[]): MatchProjection {
  const state = projectMatchState(setup, actions);

  return {
    setup,
    state,
    derived: deriveMatchState(setup, state)
  };
}

export function undoLastScoringAction(actions: MatchAction[]): MatchAction[] {
  return actions.slice(0, -1);
}

export function continueMatch(setup: MatchSetup, _state: MatchState): MatchSetup {
  if (setup.setCap === null) {
    return setup;
  }

  return {
    ...setup,
    setCap: null
  };
}
