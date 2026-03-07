## Task Analysis
- Main objective: Scaffold the repository with the current TanStack Start React template using pnpm, keep it strictly client-only, and document pinned Node LTS in `README.md` and `package.json` `engines` so the app boots locally with no extra features.
- Identified dependencies: `docs/priority.md` lists issue `#1` with no dependencies; constraints require React 19 + TanStack Start, local-only scope (no CI/workflow changes), and Node pinning docs via README + `package.json` only.
- System impact: Introduces initial app/runtime files at repo root (`package.json`, lockfile, Vite/TypeScript config, route files, starter assets, README) and establishes baseline local developer workflow (`pnpm install`, `pnpm dev`).

## Chosen Approach
- Proposed solution: Generate a fresh TanStack Start starter in a temporary directory using `pnpm create @tanstack/start@latest`, then copy only the required scaffold files into this repo, enable SPA mode (`spa.enabled`) for client-only behavior, and add Node pinning docs in README + `package.json` `engines`.
- Justification for simplicity: This reuses the official current template (lowest maintenance), avoids hand-rolling framework files, and reduces overwrite risk in this non-empty repository by merging from a temporary scaffold instead of forcing generation in-place.
- Components to be modified/created: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json`, `.gitignore`, `src/**` (or template-equivalent app source directory), `public/**` (if template includes it), `README.md`.

## Implementation Steps
1. Validate prerequisites and scope guardrails before file generation: confirm `docs/priority.md` still shows `#1` with no dependency blockers, capture `git status`, and set explicit non-goals (no `.github/workflows/**` updates, no feature work beyond starter shell).
2. Generate the official TanStack Start baseline in a temporary folder with pnpm (`pnpm create @tanstack/start@latest`), selecting the minimal React + TypeScript starter and skipping optional extras (lint presets, UI extras, or feature add-ons) unless required by template defaults.
3. Merge scaffold output into repo via an allowlist copy (core runtime/config/source files only) instead of bulk copy; exclude temporary metadata and non-essential template extras. Risk mitigation: review diff immediately after copy to prevent accidental overwrite of existing docs/config. Rollback: remove newly copied scaffold files and re-run generation/copy with corrected allowlist.
4. Apply client-only setup by enabling TanStack Start SPA mode in `vite.config.ts` (`tanstackStart({ spa: { enabled: true } })`) and ensuring starter routes/components remain minimal (no server functions or extra domain features introduced in this issue).
5. Pin and document Node LTS exactly where requested: set `package.json` `engines.node` to the agreed Node LTS (`24.14.0`), keep package manager as pnpm, and do not add `.nvmrc`.
6. Create/update root `README.md` with concise local setup instructions: required Node version, pnpm install/dev commands, and a short note that Node version source of truth is `package.json` `engines` (compatible with existing mise usage).
7. Install dependencies and validate boot path locally: run `pnpm install`, then run `pnpm dev` and verify the starter app serves successfully on local dev server without runtime errors.
8. Run post-implementation scope and regression checks: confirm only scaffold + docs/pinning files changed, confirm no CI/workflow edits, and optionally run `pnpm build` to verify production build viability for the baseline scaffold.

## Validation
- Success criteria: (1) `pnpm install` + `pnpm dev` boot the TanStack Start app locally, (2) pinned Node LTS is explicitly documented in `README.md` and enforced in `package.json` `engines`, (3) solution remains client-only and within local-scope constraints.
- Checkpoints: Pre-implementation: dependency/scope check against `docs/priority.md` and no-go list finalized; During implementation: scaffold generation completed from official template, allowlist merge verified, SPA mode present in `vite.config.ts`, `engines.node` + README pinning confirmed; Post-implementation: local boot verified (`pnpm dev`), optional build verification (`pnpm build`), and diff audit confirms no `.github/workflows/**` or extra feature additions.
