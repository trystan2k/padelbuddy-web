---
title: Task PBW-9 Quality Tooling and Test Harness
type: note
permalink: development-logs/task-pbw-9-quality-tooling-and-test-harness
---

# Development Log: PBW-9

## Metadata

- Task ID: PBW-9
- Date (UTC): 2026-03-11T13:00:59Z
- Project: padelbuddy-web
- Branch: feature/PBW-9-quality-tooling-and-test-harness
- Commit: n/a

## Objective

- Provide project-quality tooling and a test harness for unit and browser testing; ensure CI-friendly checks via a non-mutating `pnpm run complete-check`.

## Implementation Summary

- Implemented Oxlint/Oxfmt configuration and scripts for linting/formatting.
- Configured Vitest with separate unit and browser projects, set coverage thresholds to 80% for lines/branches/functions/statements.
- Browser component tests moved to `vitest-browser-react` and NotFoundPage browser test converted to browser mode.
- Shared test utilities updated: `test/utils/render-component.tsx` now only provides the unit/server markup helper; browser mount helper removed.
- Added Stylelint for CSS Modules (config + script) and integrated into lint scripts.
- Integrated Husky and lint-staged; lint-staged moved from JSON to `.mjs` and now runs JS/TS lint fixes, CSS Module stylelint fixes, then Oxfmt sequentially.
- Created a non-mutating wrapper for `pnpm run complete-check` to be used in CI and locally.
- Updated README and architecture docs with guidance for running tests and installing browser runtimes; documentation updated to reflect final lint/test workflow.

## Files Changed

- Oxlint/Oxfmt configuration and scripts (lint/format tooling)
- vitest.config.ts (unit + browser projects; coverage thresholds)
- vitest-browser-react (new location for browser component tests)
- test/utils/render-component.tsx (removed browser mount helper; unit/server helper remains)
- shared test utilities (testing/utils/\*)
- NotFoundPage browser test (converted to browser mode)
- Husky and lint-staged configuration (moved to .mjs)
- Stylelint configuration and integration for CSS Modules
- README.md / docs/architecture.md (test and tooling docs)
- tooling/browser-install-wrapper (guidance wrapper)

## Key Decisions

- Use Vitest for both unit and browser testing to keep the test stack unified, with browser components isolated under `vitest-browser-react`.
- Coverage gates set at 80% across metrics to balance strictness and onboarding velocity.
- Enforce zero-warning lint policy in CI/local by running `oxlint --deny-warnings` so `pnpm lint` fails on warnings.
- Add Stylelint targeting CSS Modules only to keep linting focused and fast.
- Prefer non-mutating `complete-check` workflow so developer machines are not unexpectedly changed by CI checks.

## Validation Performed

- pnpm run complete-check: pass - stronger validation now; lint no longer reports warnings (previous two warnings were fixed in vitest.config.ts and test/routes/\_\_root.test.tsx).
- pnpm lint: pass - now fails on warnings; current run clean.
- vitest --run: pass - unit + browser projects executed in CI-like environment (local validation recorded).

## Risks and Follow-ups

- Follow-up: address `as never` typing occurrences in vitest.config.ts if desired for stricter TypeScript hygiene (non-blocking).
- Follow-up: evaluate shallow config spread vs mergeConfig in vitest config to prefer explicit merging to avoid future config drift.
- Minor test and config cleanup suggestions surfaced in review; schedule a small follow-up PR to address them.
