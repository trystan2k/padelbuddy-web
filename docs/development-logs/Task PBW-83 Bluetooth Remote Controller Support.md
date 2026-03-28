---
title: Task PBW-83 Bluetooth Remote Controller Support
type: note
permalink: development-logs/task-pbw-83-bluetooth-remote-controller-support
---

# Development Log: PBW-83 Bluetooth Remote Controller Support

## Metadata

- Task ID: PBW-83
- Date (UTC): 2026-03-28T12:00:25Z
- Project: padelbuddy-web
- Branch: n/a
- Commit: n/a

## Objective

- Add support for Bluetooth remote controller input for scoring with configurable bindings and safe legacy fallback.

## Implementation Summary

- IndexedDB Persistence: added `remote-controller-preference` object store with DB version bumped to 5. Storage module mirrors existing locale/speech patterns for consistency.
- Layered Keyboard Resolver: refactored keyboard aliases into action model (add-team-1, revert-team-1, add-team-2, revert-team-2, undo, unknown). Custom bindings take precedence with legacy defaults as fallback when bindings are null.
- Reimplemented useInputHandler: new callback API (onAdd, onUndo), team-specific buffered add window (~380ms) to distinguish single vs double press (double = revert), guarded undo behavior (only reverts if latest scoring action belongs to that team), and preventDefault() on mapped keys. Modifier and editable-target guards added.
- Remote Configuration Modal: SetupScreen modal using Base UI Dialog for managing bindings. Supports key capture, duplicate detection (case-insensitive), replacement, clear/reset/save, closes on save, and ARIA announcements (aria-pressed, aria-live) for accessibility.
- ActiveMatchScreen Integration: loads persisted bindings on mount and wires keyboard handler. Touch scoring remains immediate (no buffer). Legacy shortcuts preserved when bindings are null.
- i18n: English, Spanish, Portuguese translations added for all new UI text.
- Tests: +18 tests (total suite: 709) covering storage, aliases, hook behaviors (buffered add, double-press revert, guarded undo), modal, integration in ActiveMatchScreen, plus regressions for legacy keyboard behaviors.

## Files Changed

- Created: src/lib/input/remote-controller-storage.ts
- Created: src/components/SetupScreen/RemoteConfigurationModal.tsx
- Created: src/components/SetupScreen/RemoteConfigurationModal.module.css
- Modified: src/lib/persistence/indexed-db.ts
- Modified: src/lib/input/keyboard-aliases.ts
- Modified: src/lib/input/use-input-handler.tsx
- Modified: src/lib/input/index.ts
- Modified: src/components/SetupScreen/SetupScreen.tsx
- Modified: src/components/SetupScreen/SetupScreen.module.css
- Modified: src/components/ActiveMatchScreen/ActiveMatchScreen.tsx
- Modified: src/lib/i18n/locales/en.ts
- Modified: src/lib/i18n/locales/es.ts
- Modified: src/lib/i18n/locales/pt.ts
- Modified: various test files
- Docs: docs/plan/Plan PBW-83 Bluetooth Remote Controller Support.md
- Docs: docs/prd/bluetooth-remote-support.md

## Key Decisions

- Remote revert implemented as a guarded undo: a revert command only undoes the last scoring action if that action belongs to the same team as the revert command.
- Buffered add approach: single press triggers an add after a ~380ms debounce window; a second press within that window is interpreted as a revert (double-press) and cancels the add.
- Touch UX left unchanged: on-screen scoring buttons are immediate and do not use the buffer, preserving expected responsiveness.
- No changes to the scoring engine: input handling and UI layer implement all behavior; backend scoring logic untouched.
- Bindings default to null so legacy keyboard shortcuts (backspace/delete) continue to work out-of-the-box; custom bindings only take effect after the user saves them.

## Validation Performed

- basic test suite: pnpm test - subsets passed (709 tests, 18 new) -- pass
- IndexedDB migration: simulated upgrade to version 5 and verified remote-controller-preference store accessible -- pass
- Modal keyboard capture: manual verification and unit tests for duplicate detection and aria announcements -- pass
- useInputHandler behavior: unit tests for buffered add, double-press revert, guarded undo; touch scoring remained immediate -- pass
- ActiveMatchScreen integration tests: restored previous tests and verified legacy shortcuts behavior preserved -- pass

## Risks and Follow-ups

- Potential timing edge cases with the 380ms buffer on very slow devices; consider making buffer window configurable if user reports false positives/negatives.
- Future: expose per-team binding presets and import/export of bindings.
- Monitor for any cross-browser IndexedDB migration issues on older Safari versions.
