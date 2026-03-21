# PBW-38 Remaining Implementation Plan

## Context

PBW-52 (Loading States & View Transitions) is done. Resume match bug is fixed.
Remaining: PBW-49 (Happy Path), PBW-50 (Match Recovery), PBW-51 (Error Handling).

## Current State Analysis

Most integration logic already works:

- Setup → Match → End → Setup: ✅ Routes handle transitions
- Resume unfinished match: ✅ Fixed (navigates to /match/$id)
- Deep linking: ✅ Routes validate matchId and redirect appropriately
- Route state resolution: ✅ `resolveMatchRouteState` handles all cases

## Remaining Work

### 1. Error Toast/Modal (PBW-51 - primary gap)

When match routes redirect home due to errors, no user feedback is shown.

**Approach**: Use router `search` params to pass error context to home route.

- `match.$id.tsx`: When redirecting home, include `search: { error: 'invalid-match' | 'no-match' | 'corrupt' }`
- `match.finish.$id.tsx`: Same pattern
- `index.tsx`: Read `search.error` from route, show a dismissible toast/notice, then clear the search param
- Toast pattern: Reuse the `aside.notice` pattern from `CurrentMatchStartupGate` (role="status", dismiss button)

### 2. Route Validation with Search Schema (TanStack Router)

- Add `validateSearch` to the `/` route to accept typed error params
- Use `useSearch` to read the error param
- Auto-dismiss or clear after showing

### 3. i18n Keys for Error Toasts

Add translation keys in en.json, es.json, pt.json:

- `error.invalidMatch.title`: "Match not found"
- `error.invalidMatch.body`: "The match you're looking for doesn't exist or has been cleared."
- `error.corruptMatch.title`: "Match data corrupted"
- `error.corruptMatch.body`: "The saved match data couldn't be read. Please start a new match."
- `error.noMatch.title`: "No active match"
- `error.noMatch.body`: "There's no match data available. Please start a new match."

### 4. Integration Tests (PBW-49 + PBW-50)

Add browser tests verifying:

- Complete happy path flow (Setup → Match → End → Setup)
- Page refresh during active match shows resume dialog
- Resume navigates to correct match route
- Invalid match ID redirects to setup with error toast
- Corrupt data redirects to setup with error toast

## Files to Create/Modify

### Create

- `test/integration/app-flow.browser.test.tsx` - Integration tests for full flows

### Modify

- `src/routes/index.tsx` - Add search validation, error toast UI
- `src/routes/match.$id.tsx` - Pass error search params on redirect
- `src/routes/match.finish.$id.tsx` - Pass error search params on redirect
- `public/locales/en.json` - Add error toast translations
- `public/locales/es.json` - Add error toast translations
- `public/locales/pt.json` - Add error toast translations

## Validation

- `pnpm complete-check`
