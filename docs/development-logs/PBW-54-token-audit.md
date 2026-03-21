# PBW-54: Token Audit Report

## 1. Token Definitions & Naming

### Findings

- The tier split is clear at a folder level (`base`, `semantic`, `component`, `app`), but tier usage is inconsistent in practice. Many CSS modules consume `base` and `semantic` tokens directly instead of going through `component` tokens, and several component tokens are never consumed at all.
- Most token names use kebab-case, but the typography trees break the convention with camelCase groups: `base.font.letterSpacing`, `base.font.lineHeight`, `semantic.typography.letterSpacing`, and `semantic.typography.lineHeight`.
- The hierarchy is mostly consistent, but there are a few naming smells:
  - `base.priority.s|m|l|xl|xxl` is terse and not self-describing.
  - `base.dimension.screen.tablet-landscape-min-width` is named like a tablet breakpoint but currently holds `375px`, which reads more like a phone baseline.
  - `component.button.revert.*` is named as a component tier, but the `Button` implementation bypasses most of those tokens and reads lower-tier values directly.
- Alias usage is solid in the semantic/app layers. `semantic` tokens correctly map to `base` tokens, and `app` tokens correctly map to `base.dimension` / `base.space`.
- The biggest semantic gap is color meaning: the current system uses brand/accent tokens to represent team styling. That matches current values, but not current intent.

### Missing Semantic Coverage

- Pencil's new `items` colors are not represented anywhere in `design-tokens/`.
- `base.color.brand.highlight` has no semantic alias.
- `base.color.common.overlay-soft` has no semantic alias, even though `--base-color-common-overlay-soft` is used directly in the app.
- The current semantic color layer has no `team-1` / `team-2` namespace, so team surfaces depend on `accent-primary` / `accent-secondary` instead of explicit team tokens.

### Likely Redundant / Underused Tokens

Heuristic used: token has no token-to-token alias consumers and no direct CSS variable usage under `src/`.

- Completely unused base tokens:
  - `base.font.size.232`
  - `base.font.size.30`
  - `base.font.letterSpacing.normal`
  - `base.font.letterSpacing.wide-sm`
  - `base.font.letterSpacing.wide-xl`
  - `base.priority.minus`
  - `base.priority.m`
  - `base.priority.l`
  - `base.radius.26`
  - `base.radius.54`
  - `base.space.0`
  - `base.space.40`
- Underused semantic typography tokens: most `semantic.typography.size.*`, `semantic.typography.weight.body`, `semantic.typography.letterSpacing.*`, and `semantic.typography.lineHeight.*` are generated but not consumed because CSS modules often use `base.font.*` values or hardcoded numeric letter-spacing/line-height instead.
- Unused component tokens:
  - `component.button.revert.background`
  - `component.button.revert.background-alt`
  - `component.button.revert.border`
  - `component.button.revert.border-alt`
  - `component.toggle.width`
  - `component.toggle.height`
- Unused app token:
  - `app.screen.header.subtitle-gap`

### Recommendations

- Normalize source token keys to kebab-case everywhere, especially typography groups.
- Keep `base` purely raw/foundation, `semantic` purely intent-driven, and avoid using brand/accent tokens as stand-ins for team identity.
- Either wire existing component tokens into components consistently or delete the dead component tokens.
- Treat the unused-token list as a cleanup backlog, not an automatic deletion list; a few may be reserved for near-term design work.

## 2. Pencil Design Alignment

### Variable Comparison

| Pencil variable      | Pencil value | Current token coverage              | Notes                                    |
| -------------------- | ------------ | ----------------------------------- | ---------------------------------------- |
| `bg-app`             | `#F4F0E7`    | `base.color.surface.canvas`         | Aligned by value                         |
| `bg-panel`           | `#FCFAF6`    | `base.color.surface.panel`          | Aligned by value                         |
| `bg-subtle`          | `#EFE7D8`    | `base.color.surface.muted`          | Aligned by value                         |
| `ink-strong`         | `#13233B`    | `base.color.ink.strong`             | Aligned by value                         |
| `ink-mid`            | `#5E6B7D`    | `base.color.ink.mid`                | Aligned by value                         |
| `accent-green`       | `#1FA24A`    | `base.color.brand.success`          | Aligned by value                         |
| `accent-green-soft`  | `#E0F4E6`    | `base.color.brand.success-subtle`   | Aligned by value                         |
| `accent-lime`        | `#D8EA42`    | `base.color.brand.highlight`        | Aligned by value                         |
| `line-soft`          | `#D7CFBF`    | `base.color.border.subtle`          | Aligned by value                         |
| `shadow-soft`        | `#00000012`  | `base.color.common.overlay-soft`    | Aligned by value                         |
| `team-one`           | `#2F7CF6`    | `base.color.brand.primary`          | Value matches, semantic meaning does not |
| `team-one-soft`      | `#E6F0FF`    | `base.color.brand.primary-subtle`   | Value matches, semantic meaning does not |
| `team-two`           | `#E28A1A`    | `base.color.brand.secondary`        | Value matches, semantic meaning does not |
| `team-two-soft`      | `#FFF0DB`    | `base.color.brand.secondary-subtle` | Value matches, semantic meaning does not |
| `items.primary`      | `#7C3AED`    | Missing                             | Not represented in tokens                |
| `items.primary-bg`   | `#EDE9FE`    | Missing                             | Not represented in tokens                |
| `items.secondary`    | `#B45309`    | Missing                             | Not represented in tokens                |
| `items.secondary-bg` | `#FEF3C7`    | Missing                             | Not represented in tokens                |
| `font-body`          | `Inter`      | `base.font.family.body`             | Aligned by value                         |
| `font-display`       | `Outfit`     | `base.font.family.display`          | Aligned by value                         |

### Alignment Summary

- All existing Pencil colors are represented by value except the four new `items.*` variables.
- The current token system still models team colors as brand/accent colors. That is the main design-system mismatch, even where values happen to line up.
- Pencil already contains the exact replacement palette for PBW-55:
  - `items.primary = #7C3AED`
  - `items.primary-bg = #EDE9FE`
  - `items.secondary = #B45309`
  - `items.secondary-bg = #FEF3C7`
- No additional Pencil color variables were found beyond the ones listed by `get_variables()`.

## 3. Accessibility

### Key Contrast Ratios

| Combination            | Ratio     | WCAG AA normal text | Notes                                                          |
| ---------------------- | --------- | ------------------- | -------------------------------------------------------------- |
| `#13233B` on `#FCFAF6` | `15.13:1` | Pass                | Primary content on surface                                     |
| `#13233B` on `#F4F0E7` | `13.87:1` | Pass                | Primary content on canvas                                      |
| `#5E6B7D` on `#FCFAF6` | `5.20:1`  | Pass                | Secondary content on surface                                   |
| `#5E6B7D` on `#F4F0E7` | `4.76:1`  | Pass                | Secondary content on canvas                                    |
| `#2F7CF6` on `#E6F0FF` | `3.43:1`  | Fail                | Current team-1 text on soft surface only passes for large text |
| `#E28A1A` on `#FFF0DB` | `2.38:1`  | Fail                | Current team-2 text on soft surface fails even for large text  |
| `#1FA24A` on `#E0F4E6` | `2.89:1`  | Fail                | Success text on success-subtle                                 |
| `#D64A4A` on `#F9E4E4` | `3.49:1`  | Fail                | Danger text on critical-subtle only passes for large text      |
| `#FFFFFF` on `#2F7CF6` | `3.94:1`  | Fail                | Large text passes                                              |
| `#FFFFFF` on `#E28A1A` | `2.66:1`  | Fail                | Large text also fails                                          |
| `#FFFFFF` on `#1FA24A` | `3.32:1`  | Fail                | Large text passes                                              |
| `#7C3AED` on `#EDE9FE` | `4.80:1`  | Pass                | Proposed PBW-55 team-1 palette                                 |
| `#B45309` on `#FEF3C7` | `4.51:1`  | Pass                | Proposed PBW-55 team-2 palette                                 |

### Accessibility Findings

- Body copy colors are in good shape.
- The current blue/orange team palettes are not strong enough for normal-sized text on their soft backgrounds, especially the orange pair.
- The proposed Pencil `items.*` purple/amber pairs materially improve contrast and both clear AA for normal text.
- `semantic.color.border.accent-secondary` on light surfaces is also weak for non-text UI contrast (`2.56:1` against `#FCFAF6`), while the primary blue border is acceptable for non-text contrast (`3.78:1`).

## 4. Team Color Usage

### Hardcoded Hex Colors in `src/`

- No runtime hardcoded team colors were found in `src/`.
- The only hardcoded team hex values are comments in `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css`.

### Direct Team Styling Inventory

- `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css`
  - Uses `--base-color-brand-primary-subtle` / `--base-color-brand-secondary-subtle` for panel backgrounds.
  - Uses `--semantic-color-border-accent-primary` / `--semantic-color-border-accent-secondary` for borders.
  - Uses `--semantic-color-content-accent-primary` / `--semantic-color-content-accent-secondary` for team-name text.
- `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx`
  - Conditionally applies `styles.team1Panel` / `styles.team2Panel`.
  - Still references `styles.team1Text` / `styles.team2Text`, but those classes do not exist in the CSS module. This is a stale reference and a correctness bug.
- `src/components/ActiveMatchScreen/ActiveMatchScreen.tsx`
  - Wraps the two score columns with `styles.team1Panel` / `styles.team2Panel` and gives the revert buttons `accent="primary"` / `accent="secondary"`.
- `src/components/MatchEndScreen/WinnerCard.tsx` + `src/components/MatchEndScreen/WinnerCard.module.css`
  - Winner heading color is chosen conditionally through `styles.teamPrimary` / `styles.teamSecondary`.
  - The CSS classes map to `--semantic-color-content-accent-primary` / `--semantic-color-content-accent-secondary`.
- `src/components/MatchEndScreen/MatchSummaryCard.tsx` + `src/components/MatchEndScreen/MatchSummaryCard.module.css`
  - Team names and per-set scores use `styles.teamPrimary` / `styles.teamSecondary`.
  - The CSS classes map to `--semantic-color-content-accent-primary` / `--semantic-color-content-accent-secondary`.
- `src/components/SetupScreen/SetupScreen.tsx` + `src/components/SetupScreen/SetupScreen.module.css`
  - Team setup surfaces still rely on shared accent APIs:
    - `SectionLabel accent="primary"|"secondary"`
    - `Card accent="primary"|"secondary"`
    - `TextInput accent="primary"|"secondary"`
    - `Chip accent="primary"|"secondary"`
  - Selected chip labels use `styles.team1` / `styles.team2` with accent token colors.

### Shared Primitive Dependencies Used by Team UI

- `src/components/ui/Card/Card.module.css` -> accent border colors.
- `src/components/ui/TextInput/TextInput.module.css` -> accent-specific focus outline colors.
- `src/components/ui/Chip/Chip.module.css` -> pressed state, dot color, and secondary variant all depend on accent tokens.
- `src/components/ui/SectionLabel/SectionLabel.module.css` -> accent text colors.
- `src/components/ui/Button/Button.module.css` -> `solid.accentPrimary` / `solid.accentSecondary` and shared accent-driven variants.

### Generic Accent Usage That Is Not Team-Specific

These should stay out of PBW-55 unless product scope changes:

- `src/styles.css`
- `src/routes/index.module.css`
- `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.module.css`
- `src/components/NotFoundPage/NotFoundPage.module.css`
- Route-level error reset buttons in `src/routes/__root.tsx` and `src/routes/-route-utils.tsx`

### Neutral Screen Confirmations

- `src/components/ActiveMatchScreen/SetsCard/SetsCard.module.css` stays neutral and does not use team accent colors.

## 5. Generated CSS Output

### Findings

- `design-tokens/dist/variables.css` currently generates 215 CSS custom properties and includes every token source file covered by the current config.
- Variable naming is mechanically consistent with Style Dictionary output (`.` -> `-`, lowercase hex values, and resolved aliases).
- The output also mirrors source inconsistencies:
  - camelCase source groups become kebab-case CSS variables (`letterSpacing` -> `letter-spacing`, `lineHeight` -> `line-height`), which means the generated CSS looks more consistent than the source JSON.
  - dead tokens are still emitted, which increases noise in the output.
- Formatting is clean and valid. The file is readable, starts with the expected auto-generated header, and uses a single `:root` block.

### Gaps / Risks

- There are no generated `--base-color-items-*` or `--semantic-color-*-team-*` variables yet, which matches the audit finding that the new Pencil team palette has not been tokenized.
- Because tokens are fully resolved in output, it is harder to inspect alias intent from the generated CSS alone.

## 6. Style Dictionary Configuration

### Findings

- `design-tokens/style-dictionary.config.json` is valid and minimal.
- The source glob is correct for the current repo layout: `design-tokens/**/*.tokens.json` matches all token source files and does not include the generated `dist/` output.
- The config matches the current scripts in `package.json`, where `pnpm tokens:build` runs `style-dictionary build --config design-tokens/style-dictionary.config.json` from the repo root.
- For the current app, a single CSS platform is sufficient, but the config is intentionally bare-bones.

### Best-Practice Gaps

- There is no secondary output target for TypeScript/JavaScript consumption, token docs, or Figma/Pencil inspection tooling.
- There is no custom filtering or linting step to detect dead tokens, naming mismatches, or missing semantic aliases.
- There is no `outputReferences` configuration for the CSS build, so alias relationships are flattened in the generated output.

## 7. Recommendations Summary

1. Add the new Pencil-derived `items` base tokens and explicit `team-1` / `team-2` semantic tokens before any more team UI styling changes.
2. Stop using `accent-primary` / `accent-secondary` as the semantic source of truth for team identity.
3. Migrate all team-specific surfaces first: `TeamPanel`, `WinnerCard`, `MatchSummaryCard`, and the team-specific parts of `SetupScreen`.
4. Decide explicitly whether shared primitives (`Card`, `TextInput`, `Chip`, `SectionLabel`, and possibly `Button`) should gain team-specific variants, or whether `SetupScreen` should move away from shared accent props and style those surfaces locally.
5. Clean up the stale `team1Text` / `team2Text` reference in `src/components/ActiveMatchScreen/TeamPanel/TeamPanel.tsx` as part of the PBW-55/PBW-56 implementation.
6. Normalize naming in source tokens: convert camelCase groups to kebab-case and review terse `priority` keys.
7. Review the unused-token list and remove or wire up dead tokens after the PBW-55 migration lands.
8. Consider adding a lightweight token-audit script to CI so dead tokens, missing semantic aliases, and Pencil/token drift are detected automatically.

## 8. Proposed Token Map for PBW-55

### Recommended Base Tokens

These match the approved PBW-53 plan and the current Pencil variables exactly.

```json
{
  "base": {
    "color": {
      "items": {
        "primary": {
          "color": { "value": "#7C3AED", "type": "color" },
          "bg-color": { "value": "#EDE9FE", "type": "color" }
        },
        "secondary": {
          "color": { "value": "#B45309", "type": "color" },
          "bg-color": { "value": "#FEF3C7", "type": "color" }
        }
      }
    }
  }
}
```

### Recommended Semantic Tokens

Map team identity to the new `items` base tokens, not to existing brand/accent tokens.

```json
{
  "semantic": {
    "color": {
      "content": {
        "team-1": { "value": "{base.color.items.primary.color}", "type": "color" },
        "team-2": { "value": "{base.color.items.secondary.color}", "type": "color" }
      },
      "background": {
        "team-1": { "value": "{base.color.items.primary.bg-color}", "type": "color" },
        "team-2": { "value": "{base.color.items.secondary.bg-color}", "type": "color" }
      },
      "border": {
        "team-1": { "value": "{base.color.items.primary.color}", "type": "color" },
        "team-2": { "value": "{base.color.items.secondary.color}", "type": "color" }
      }
    }
  }
}
```

### Expected Generated CSS Variables

- `--base-color-items-primary-color: #7c3aed`
- `--base-color-items-primary-bg-color: #ede9fe`
- `--base-color-items-secondary-color: #b45309`
- `--base-color-items-secondary-bg-color: #fef3c7`
- `--semantic-color-content-team-1: #7c3aed`
- `--semantic-color-content-team-2: #b45309`
- `--semantic-color-background-team-1: #ede9fe`
- `--semantic-color-background-team-2: #fef3c7`
- `--semantic-color-border-team-1: #7c3aed`
- `--semantic-color-border-team-2: #b45309`

### Why This Map

- It keeps `base` value-driven and free of product semantics.
- It gives the app an explicit team semantic layer.
- It preserves all current brand/accent tokens for generic UI.
- It aligns the implementation with Pencil and improves contrast at the same time.
