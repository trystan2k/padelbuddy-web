## Task Analysis

- Main objective: Deliver a three-phase rollout for PBW-53 so team-specific multiplayer colors move from reused brand/accent tokens to new Pencil-derived `items` base tokens and explicit `items.primary`/`items.secondary` semantic tokens, with PBW-54 remaining review-only until user approval.
- Identified dependencies: `docs/design/padelbuddyweb.pen`; Style Dictionary config in `design-tokens/style-dictionary.config.json`; token source files `design-tokens/base/color.tokens.json` and `design-tokens/semantic/color.tokens.json`; generated output `design-tokens/dist/variables.css`; in-scope screens `src/components/ActiveMatchScreen/TeamPanel/*`, `src/components/MatchEndScreen/*`, `src/components/SetupScreen/*`; shared UI primitives in `src/components/ui/Card/*`, `src/components/ui/TextInput/*`, `src/components/ui/Chip/*`, `src/components/ui/SectionLabel/*`, `src/components/ui/Button/*` that use accent props for items styling; QA via `pnpm tokens:build` and `pnpm complete-check`.
- System impact: Mostly presentation-layer and token-pipeline changes, but the audit identified two correctness issues: (1) `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx` references missing `team1Text`/`team2Text` classes, (2) ~20 unused tokens across tiers. Both are included in scope for this task.
- Semantic token naming decision: Tokens use `items.{primary|secondary}.{content|background|border}` — NOT team-coupled names. Team identity is only applied at the component level, keeping the semantic layer product-agnostic.

## Chosen Approach

- Proposed solution: Use a gated three-phase plan. PBW-54 inventories all direct and indirect team color consumers, documents the recommended token map and naming cleanup, and stops for approval. PBW-55 adds the new `items` base tokens plus a semantic `items` layer that maps `items.primary`/`items.secondary` to content/background/border intents — decoupled from team identity. PBW-56 migrates all approved team surfaces and shared UI primitives (Card, TextInput, Chip, SectionLabel, Button) to consume the new `items` semantic tokens. Audit item 3 (stale `team1Text`/`team2Text` reference) is fixed in PBW-56. Audit item 7 (unused tokens cleanup) is addressed as a final step.
- Justification: The `items` semantic layer keeps tokens decoupled from team identity. Shared UI primitives can use `items.primary`/`items.secondary` as accent colors without being team-aware. Components decide when `items.primary` means "team 1" vs a generic accent. This preserves the existing Style Dictionary structure, keeps `brand` and `accent` tokens untouched, and avoids inventing a team-coupled semantic tier.
- Components to be modified/created: Modify `design-tokens/base/color.tokens.json`, `design-tokens/semantic/color.tokens.json`, regenerated `design-tokens/dist/variables.css`; update screen styles in `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css`, `src/components/MatchEndScreen/WinnerCard.module.css`, `src/components/MatchEndScreen/MatchSummaryCard.module.css`, `src/components/SetupScreen/SetupScreen.module.css`; update shared UI primitive styles in `src/components/ui/Card/*`, `src/components/ui/TextInput/*`, `src/components/ui/Chip/*`, `src/components/ui/SectionLabel/*`, `src/components/ui/Button/*`; fix stale references in companion TSX files; remove unused tokens from base/semantic/component/app token files.

## Implementation Steps

### Phase 1: PBW-54 — Audit (Complete)

1. Run the audit: compare Pencil colors and current token files, search the repo for all places where team surfaces use `brand`, `accent`, or shared accent props.
2. Capture concrete findings in `docs/development-logs/Task PBW-54 Token Audit.md`.
3. Present findings to the user and receive approval — including corrected semantic token naming (`items.{primary|secondary}.{content|background|border}`, NOT team-coupled).

### Phase 2: PBW-55 — Add Tokens

4. Add the new `items` base tokens in `design-tokens/base/color.tokens.json`:
   - `base.color.items.primary.color` → `#7C3AED`
   - `base.color.items.primary.bg-color` → `#EDE9FE`
   - `base.color.items.secondary.color` → `#B45309`
   - `base.color.items.secondary.bg-color` → `#FEF3C7`
5. Add the `items` semantic layer in `design-tokens/semantic/color.tokens.json`:
   - `semantic.color.items.primary.content` → `{base.color.items.primary.color}`
   - `semantic.color.items.primary.background` → `{base.color.items.primary.bg-color}`
   - `semantic.color.items.primary.border` → `{base.color.items.primary.color}`
   - `semantic.color.items.secondary.content` → `{base.color.items.secondary.color}`
   - `semantic.color.items.secondary.background` → `{base.color.items.secondary.bg-color}`
   - `semantic.color.items.secondary.border` → `{base.color.items.secondary.color}`
6. Run `pnpm tokens:build` and verify that `design-tokens/dist/variables.css` gains the expected `--base-color-items-*` and `--semantic-color-items-*` variables with no accidental changes to unrelated variables.

### Phase 3: PBW-56 — Migrate Components

7. Migrate shared UI primitives to use `items` semantic tokens (decoupled from team identity):
   - `src/components/ui/Card/Card.module.css` — accent border colors → `items.primary.border` / `items.secondary.border`
   - `src/components/ui/TextInput/TextInput.module.css` — accent focus outline → `items.primary.border` / `items.secondary.border`
   - `src/components/ui/Chip/Chip.module.css` — pressed state, dot color → `items.primary.*` / `items.secondary.*`
   - `src/components/ui/SectionLabel/SectionLabel.module.css` — accent text → `items.primary.content` / `items.secondary.content`
   - `src/components/ui/Button/Button.module.css` — accent variants → `items.primary.*` / `items.secondary.*`
8. Migrate direct screen-level consumers from legacy blue/amber references to `items` semantic tokens:
   - `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css`
   - `src/components/MatchEndScreen/WinnerCard.module.css`
   - `src/components/MatchEndScreen/MatchSummaryCard.module.css`
   - `src/components/SetupScreen/SetupScreen.module.css`
9. Fix audit item 3: Remove stale `team1Text`/`team2Text` references in `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx`.
10. Keep `src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css` unchanged (neutral).
11. Audit item 7: Remove unused tokens from token source files (identified list from audit report).

### Phase 4: Validation

12. Search repo to confirm no leftover legacy team color references in approved files.
13. Run `pnpm complete-check`.
14. Manual visual review on Setup, Active Match, and Match End screens.

## Validation

- Success criteria: PBW-54 produces an audit artifact and user approval before code changes; PBW-55 introduces the exact new `items` base tokens and `items.{primary|secondary}` semantic tokens (decoupled from team identity) without mutating existing brand/accent tokens; PBW-56 updates all team-specific surfaces AND shared UI primitives to consume the new `items` semantic tokens; stale `team1Text`/`team2Text` reference is fixed; unused tokens are cleaned up; `pnpm complete-check` passes.
- Checkpoints: Pre-implementation — audit report completed and approval received with corrected naming; during token work — `pnpm tokens:build` succeeds and generated variable names match the approved naming map; during component migration — repo searches show no leftover legacy team color references; post-implementation — `pnpm complete-check` passes and manual UI review confirms the new purple/amber pairing matches Pencil on all screens.
