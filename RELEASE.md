# Release Process

This repository uses `Release Please` plus GitHub Actions to automate versioning, changelog updates, release previews, and production deployments.

## Overview

1. Changes merge into `main` using Conventional Commit style messages.
2. The `Release Please` workflow runs on pushes to `main`.
3. Release Please evaluates releasable commits and opens or updates a release PR.
4. Only that release PR receives a Cloudflare Pages preview deployment.
5. When the release PR is merged, Release Please publishes a GitHub release.
6. The published release triggers the production deployment workflow.

## Commit Types That Trigger Releases

Release Please follows the Node release strategy configured for this repo.

- Non-breaking releasable commit types: `feat`, `fix`, `deps`
- Breaking changes still trigger major releases, for example `feat!:` or `refactor!:`
- Non-releasable changes such as docs-only or chore-only commits do not create a release by themselves

## Workflow Sequence

### 1. Continuous Integration

`CI` runs on pull requests and pushes to `main`.

- Full verification order is:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm format:check`
  - `pnpm test`
  - `pnpm build`
- Docs-only changes take a reduced path and run `pnpm format:check`
- Superseded runs are cancelled automatically

The main CI workflow lives at `.github/workflows/ci.yml`.

### 2. Release Please

The release workflow lives at `.github/workflows/release.yml` and runs on every push to `main`.

It does the following:

- inspects commits on `main`
- updates or creates the release PR when a release is needed
- updates version metadata
- maintains `CHANGELOG.md`
- publishes the GitHub release after the release PR is merged

This workflow uses the `RELEASE_PLEASE_TOKEN` secret so the release PR and published release can trigger downstream workflows.

### 3. Release PR Preview Deployment

The preview workflow lives at `.github/workflows/preview-release-pr.yml`.

It only runs for the Release Please branch:

- branch name: `release-please--branches--main`
- event: release PR opened, reopened, or synchronized

It performs the full verification path again, prepares a clean Pages artifact, and deploys a stable preview to Cloudflare Pages.

Important:

- normal feature PRs do not get preview deployments
- only the Release Please PR gets a preview deployment
- the workflow comments the preview URL back onto the release PR

### 4. Production Deployment

The production deployment workflow lives at `.github/workflows/deploy-production.yml`.

It runs only when GitHub receives a published release event, and only when that release targets `main`.

The workflow:

- checks out the released tag
- re-runs the verification pipeline
- builds the app
- prepares a clean Pages artifact
- deploys to the production Cloudflare Pages branch alias

Production is not deployed on every push to `main`.

## Pages Artifact Preparation

This repo deploys a prepared static Pages artifact instead of publishing the entire `dist/` folder.

Why:

- `pnpm build` produces deployable static output plus additional build output such as `dist/server`
- Cloudflare Pages should receive only the static deployment payload
- the reusable local GitHub Action at `.github/actions/prepare-pages-artifact/action.yml` creates `dist/pages` from the deployable entries in `dist/`

That action is used by CI and deploy workflows so the logic is defined once and reused consistently.

## Required Secrets

GitHub Actions requires these secrets:

- `RELEASE_PLEASE_TOKEN` - token used by Release Please so downstream workflows can be triggered
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token for Pages deployments
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier
- `CLOUDFLARE_PAGES_PROJECT_NAME` - Pages project name used for preview and production deploys

## What Maintainers Need To Do

In the normal flow, maintainers do not manually version or deploy the app.

Typical process:

1. Merge releasable work into `main`.
2. Wait for Release Please to open or update the release PR.
3. Review the release PR, including the preview deployment URL.
4. Merge the release PR when it is ready.
5. Confirm the GitHub release is published and the production deploy succeeds.

## Troubleshooting

- If no release PR appears after merging work to `main`, verify the merged commits use releasable Conventional Commit types.
- If the release PR appears but no preview is deployed, verify the PR branch is `release-please--branches--main` and confirm required secrets are set.
- If the GitHub release is published but production does not deploy, inspect `.github/workflows/deploy-production.yml` and confirm the release targets `main`.
- If deployment fails during artifact packaging, inspect `.github/actions/prepare-pages-artifact/action.yml` and confirm `pnpm build` still emits the expected `dist/` structure.

For incident handling and rollback policy, see `docs/prd/release-incident-runbook.md`.
