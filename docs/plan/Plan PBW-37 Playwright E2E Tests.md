# Plan PBW-37: Playwright E2E Tests

## Task Analysis

- **Main objective**: Set up Playwright E2E testing infrastructure and write smoke tests for the Setup Screen
- **Identified dependencies**:
  - Playwright already installed (~1.58.2)
  - Setup Screen component exists at `src/routes/index.tsx`
  - CI workflow exists at `.github/workflows/ci.yml`
  - Vitest browser mode uses Playwright for component tests (separate from E2E)
- **System impact**:
  - New `playwright.config.ts` file
  - New `e2e/` directory structure
  - Updated `package.json` scripts
  - Updated CI workflow

## Chosen Approach

- **Proposed solution**: Standalone Playwright configuration with dev server integration
- **Justification for simplicity**:
  - Playwright already installed as dependency
  - Standard `webServer` pattern provides real E2E testing
  - Clean separation between `test/` (unit/browser) and `e2e/` (E2E)
  - Minimal CI changes required
- **Components to be modified/created**:
  - `playwright.config.ts` (new)
  - `e2e/setup-screen.spec.ts` (new)
  - `e2e/fixtures.ts` (new - shared test utilities)
  - `package.json` (scripts only)
  - `.github/workflows/ci.yml` (add E2E job)

## Implementation Steps

### Phase 1: Playwright Configuration

#### Step 1.1: Create `playwright.config.ts`

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

**Dependencies**: None
**Validation**: Config file parses without errors

---

#### Step 1.2: Create `e2e/` directory structure

**Files**:

- `e2e/.gitkeep` (placeholder)
- `e2e/fixtures.ts` (shared utilities)

```typescript
// e2e/fixtures.ts
import { test as base, expect } from '@playwright/test'

// Re-export for convenience
export { expect }
export const test = base.extend({})
```

**Dependencies**: Step 1.1
**Validation**: Directory structure exists

---

### Phase 2: Package.json Scripts

#### Step 2.1: Add E2E test scripts

**File**: `package.json`

Add to scripts section:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

**Dependencies**: Step 1.1
**Validation**: `pnpm test:e2e --list` shows no errors

---

### Phase 3: Setup Screen E2E Tests

#### Step 3.1: Create Setup Screen smoke tests

**File**: `e2e/setup-screen.spec.ts`

Test cases to implement:

1. **Page Load Test**
   - Navigate to `/`
   - Verify page title contains app name
   - Verify main heading is visible
   - Verify both team name inputs are present
   - Verify format options are present
   - Verify Start Match button is present

2. **Team Name Input Test**
   - Type into Team 1 input
   - Verify value updates
   - Type into Team 2 input
   - Verify value updates

3. **Format Selection Test**
   - Click on "Best of 3" option
   - Verify it becomes selected
   - Click on "Best of 5" option
   - Verify it becomes selected

4. **Initial Server Selection Test**
   - Click Team 1 server option
   - Verify selection state
   - Click Team 2 server option
   - Verify selection state

5. **Toggle Options Test**
   - Click Golden Point toggle
   - Verify toggle state changes
   - Click Side Switch Prompts toggle
   - Verify toggle state changes

6. **Locale Switching Test**
   - Click locale chip to open menu
   - Verify locale menu appears
   - Click a different locale
   - Verify UI language updates

7. **Validation: Cannot Start Without Team Names**
   - Clear both team name inputs
   - Verify Start Match button is disabled
   - Enter Team 1 name only
   - Verify Start Match button is still disabled
   - Enter Team 2 name
   - Verify Start Match button becomes enabled

8. **Start Match Navigation Test**
   - Enter both team names
   - Click Start Match button
   - Verify navigation to `/match/` route

**Dependencies**: Steps 1.1, 1.2
**Validation**: All tests pass locally with `pnpm test:e2e`

---

### Phase 4: CI/CD Integration

#### Step 4.1: Update GitHub Actions workflow

**File**: `.github/workflows/ci.yml`

Add E2E test job after the `full_checks` job:

```yaml
e2e_tests:
  name: E2E Tests
  needs: detect_changes
  if: needs.detect_changes.outputs.docs_only != 'true'
  runs-on: ubuntu-latest
  steps:
    - name: Check out repository
      uses: actions/checkout@v4

    - name: Set up pnpm
      uses: pnpm/action-setup@v4
      with:
        version: ${{ env.PNPM_VERSION }}

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        cache: pnpm
        node-version: ${{ env.NODE_VERSION }}

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright browsers
      run: pnpm exec playwright install --with-deps chromium

    - name: Run E2E tests
      run: pnpm test:e2e

    - name: Upload Playwright report
      if: always() && !cancelled()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-${{ github.sha }}
        path: playwright-report/
        retention-days: 7
```

Update the final `ci` job to include `e2e_tests`:

```yaml
ci:
  name: CI
  needs:
    - detect_changes
    - docs_checks
    - full_checks
    - e2e_tests
  if: always()
  # ... rest remains the same, add E2E_RESULT check
```

**Dependencies**: Steps 1-3 complete
**Validation**: CI workflow runs E2E tests successfully

---

### Phase 5: Update QA Command (Optional)

#### Step 5.1: Update complete-check script

**File**: `package.json`

Consider whether to include E2E in `complete-check`. Recommendation: **Skip** for now since E2E requires dev server and is slower. Keep `complete-check` for fast feedback.

**Decision**: Do NOT add E2E to `complete-check` - keep it as a separate CI stage.

---

## Validation

### Success Criteria

- [ ] `playwright.config.ts` exists and is valid
- [ ] `e2e/` directory exists with proper structure
- [ ] `pnpm test:e2e` runs all tests
- [ ] `pnpm test:e2e:ui` opens Playwright UI
- [ ] `pnpm test:e2e:headed` runs tests in headed mode
- [ ] All Setup Screen smoke tests pass
- [ ] CI workflow includes E2E test job
- [ ] Playwright report is uploaded as artifact on CI

### Checkpoints

**Checkpoint 1 (After Phase 1)**:

- Run `pnpm exec playwright --version` - should show 1.58.2
- Verify `playwright.config.ts` syntax with `pnpm exec playwright test --list`

**Checkpoint 2 (After Phase 2)**:

- Run `pnpm test:e2e --list` - should list 0 tests (no test files yet)
- Run `pnpm test:e2e:ui` - should open Playwright UI

**Checkpoint 3 (After Phase 3)**:

- Run `pnpm test:e2e` - all 8 test cases should pass
- Verify tests run against real dev server

**Checkpoint 4 (After Phase 4)**:

- Push to branch and verify CI runs E2E tests
- Check that Playwright report artifact is uploaded

### Rollback Notes

**Risk: Dev server startup timeout in CI**

- Mitigation: `webServer.timeout` set to 120s (2 minutes)
- Fallback: Increase timeout or use pre-built static server

**Risk: Flaky tests due to timing**

- Mitigation: Use Playwright's auto-waiting locators
- Fallback: Add explicit waits only where necessary

**Risk: Browser installation issues in CI**

- Mitigation: Use `--with-deps` flag for system dependencies
- Current CI already uses this pattern

---

## File Summary

| File                       | Action | Description                  |
| -------------------------- | ------ | ---------------------------- |
| `playwright.config.ts`     | Create | Playwright E2E configuration |
| `e2e/fixtures.ts`          | Create | Shared test utilities        |
| `e2e/setup-screen.spec.ts` | Create | Setup Screen smoke tests     |
| `e2e/.gitkeep`             | Create | Directory placeholder        |
| `package.json`             | Modify | Add E2E test scripts         |
| `.github/workflows/ci.yml` | Modify | Add E2E test job             |

---

## Non-Goals (Explicitly Out of Scope)

- Match Screen E2E tests (not implemented yet)
- Match End Screen E2E tests (not implemented yet)
- Complete match flow tests (integration task)
- Match recovery tests
- Visual regression tests
- Cross-browser testing (Chrome only for now)
- Mobile viewport testing
