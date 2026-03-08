# Release and Incident Runbook

Version: 2.0
Status: Operational

## 1) Release Trigger

- Release cadence: on-demand
- Production deploy is automatic when required checks are green and changes reach `main`
- Deployment target in v1: `*.pages.dev` only

## 2) Pre-Release Checklist (per deploy train)

- Required CI checks green
- Coverage gate satisfied
- PWA/installability checks passing
- No unresolved blocking defects in linked tasks

For owner-flagged feature milestones, additionally:
- Full manual hardware regression complete
- At least one known-good presenter validated
- Task owner records validation result in the linked GitHub issue

## 3) Rollback Policy

- Rollback approach: best effort
- Preferred response may be rollback or fix-forward based on impact and confidence

## 4) Production Error Handling

- User-facing critical error state MUST show friendly recovery UI
- Recovery action: `Reset and continue` only
- Technical error detail: console logging (errors only)

## 5) Data Recovery Cases

- Recoverable active match on startup: prompt resume/discard, with resume emphasized
- Corrupted state: hard fail recovery UI
- Incompatible schema version: silent reset allowed, plus one-time non-blocking notice

## 6) Security and Privacy Guardrails

- No analytics collection in v1
- No external monitoring services in v1
- Baseline security headers configured on static hosting

## 7) Main Branch Health

- If CI fails after merge, handling is owner discretion (no strict SLA)

## 8) Support Horizon

- Once v2 begins, v1 receives no parallel support under this policy
