---
title: Task PBW-11 Scoring Engine and Match Domain
type: note
permalink: development-logs/task-pbw-11-scoring-engine-and-match-domain
---

# Development Log: PBW-11

## Metadata

- Task ID: PBW-11
- Date (UTC): 2026-03-13T00:00:00Z
- Project: padelbuddy-web
- Branch: feature/PBW-11-scoring-engine-and-match-domain
- Commit: n/a

## Objective

- Implement a deterministic, replay-driven scoring domain and match model that centralizes scoring rules and supports continued (endless) play past previous set limits while preserving score/history and existing rules.

## Implementation Summary

- Expanded src/core/match into a pure replay-driven scoring domain with:
  - runtime-validated setup/types
  - a scoring reducer for deterministic state transitions from typed score actions
  - derived-state selectors (serve/side-switch prompts and other derived properties)
  - replay and undo helpers
  - continue-playing support that uncaps the set limit while preserving existing score/history and rules
- Removed duplicate next-set server logic so engine and derived-state share one source of truth.
- Added/updated unit tests under test/core/match covering setup validation, scoring transitions, tiebreaks, serve/derived state, replay determinism, best-of-5 deciding-set behavior, and validation guard branches.

## Files Changed

- docs/plan/Plan PBW-11 Scoring Engine and Match Domain.md
- src/core/match/ (implementation files: types, reducer, helpers)
- test/core/match/ (new and updated tests)

## Key Decisions

- Use a replay-driven scoring domain (single source of truth) to ensure deterministic score transitions and enable undo/replay.
- Continue-playing (endless play) implemented as "uncapped sets": continue the same finished match from its current score/history with no maximum set cap while preserving the match rules and history.
- Side-switch prompts are derived-only (no persisted prompts) and remain part of derived state selectors.
- Consolidated next-set server logic into the match engine to avoid duplication and divergence.

## Validation Performed

- pnpm complete-check: pass — full QA/CI checks completed locally
- Unit tests: 37 tests passed in test/core/match
- Coverage: match-domain coverage improved to ~93% statements / ~93% branches

## Risks and Follow-ups

- Review requested follow-up fixes (minor) documented in PR comments; changes are acceptable for commit after those follow-ups.
- Monitor for edge-case tiebreak interactions discovered during tests; add targeted tests if future regressions appear.
- Ensure downstream UI code uses unified selectors/helpers instead of any removed duplicate logic.

## References

- Planning file: docs/plan/Plan PBW-11 Scoring Engine and Match Domain.md
- Branch: feature/PBW-11-scoring-engine-and-match-domain

**What**: Implemented a replay-driven scoring engine and match domain per PBW-11
**Why**: Centralize scoring logic, improve determinism, support endless play and better testability
**Where**: src/core/match/, test/core/match/, docs/plan/Plan PBW-11 Scoring Engine and Match Domain.md
**Learned**: Removing duplicated server logic reduces maintenance surface; derived-state selectors are the correct place for UI prompts like side-switch.
