# ARCHITECTURE.md

## 1. High-Level Architecture

The Padel Buddy Web is built as a highly interactive, client-heavy Single Page Application (SPA) using **TanStack Start**. The core relies heavily on synchronous client-side state (`localStorage`, `window.speechSynthesis`, DOM Keydown listeners) to guarantee an offline-first, zero-latency scoring experience. It is statically generated and deployed to **Cloudflare Pages**, ensuring lightning-fast load times globally and built-in SSL.

## 2. Directory Structure

```text
├── .husky/                 # Git hooks (pre-commit, commit-msg)
├── .github/
│   └── workflows/          # CI/CD pipelines (Tests, Semantic-release, Cloudflare Deploy)
├── tests/
│   ├── e2e/                # Playwright E2E tests
│   └── unit/               # Vitest unit tests (Scoring logic)
├── src/
│   ├── components/         # Reusable UI (Base UI components)
│   │   ├── ScoreBoard.tsx
│   │   └── ScoreBoard.module.css # Locally scoped CSS
│   ├── core/               # Pure TypeScript domain logic (no React imports)
│   │   ├── scoring.ts      # Functions calculating points, games, sets
│   │   └── types.ts        # Padel state TypeScript interfaces
│   ├── hooks/
│   │   ├── useMatchState.ts# useReducer wrapper with localStorage sync
│   │   ├── useSpeech.ts    # Web Speech API wrapper
│   │   └── useRemote.ts    # Global keydown event listener & debouncer
│   ├── routes/             # TanStack Start file-based routing
│   │   ├── __root.tsx      # Root layout and PWA manifest
│   │   ├── index.tsx       # Match Setup Screen
│   │   └── match.tsx       # Active Scoreboard Screen
│   ├── styles/             # Global CSS variables, reset, and base styles
│   │   └── globals.css     
│   └── router.tsx          # TanStack Router configuration
├── biome.json              # Linter & Formatter configuration
├── commitlint.config.js    # Conventional commits enforcement
├── package.json
└── tsconfig.json

```

## 3. State Management

### 3.1 The Match State Machine

Because padel scoring involves dependent transitions (e.g., scoring a point might trigger a game win, which triggers a set win, which triggers a match win), the state is managed synchronously via a pure reducer function.

**Core Interfaces:**

```typescript
interface MatchState {
  team1: TeamState;
  team2: TeamState;
  currentSetIndex: number;
  sets: SetScore[];
  servingTeam: 1 | 2;
  config: MatchConfig; // e.g., Golden Point toggle, Max Sets
  isMatchFinished: boolean;
  isEndlessMode: boolean; // True if "Continue Playing" was clicked
  history: MatchState[];  // Deep Undo Stack
}

```

### 3.2 State Persistence (`localStorage`)

A custom hook `useMatchState` wraps React's `useReducer`. After every state transition, the state object is serialized and saved synchronously to `localStorage`. Upon app initialization, `useMatchState` hydrates its initial state from `localStorage` to survive page reloads or closed tabs instantly.

## 4. Input Handling

### 4.1 Bluetooth Remote Listener (`useRemote.ts`)

A custom hook attaches a `keydown` event listener to the `window` object.

* It uses a **300ms debounce** to prevent accidental double-clicks.
* Maps `ArrowLeft` / `PageUp` to dispatching a point for Team 1.
* Maps `ArrowRight` / `PageDown` to dispatching a point for Team 2.
* Maps `Escape` / `Backspace` to dispatching an `UNDO` action.

### 4.2 Touch Interface

The entire visual score block for a team is rendered as a `<BaseUI.Button>` (or similar semantic interactive element). This ensures maximum hit area on touch devices. CSS `touch-action: manipulation;` prevents the device from zooming on rapid taps.

## 5. UI & Styling Framework

* **Base UI:** Used for complex interactive components like the settings modal, toggle switches (Advantage vs Golden Point), and form inputs. It guarantees accessibility (WAI-ARIA) without enforcing a design system.
* **CSS Modules:** Used for styling components with locally scoped class names (e.g., `ScoreBoard.module.css`). This provides a clean separation of concerns, guarantees no class name collisions, and makes it easy to write custom media queries, relative sizing logic (`vh`, `vw`, `rem`), and keyframe animations for the score flashing effects. Common design tokens (colors, typography) are managed via CSS Variables in a `globals.css` file.

## 6. Testing Strategy

### 6.1 Unit Testing (Vitest)

The pure logic inside `src/core/scoring.ts` is tested exhaustively using Vitest.

* **Tests cover:** Point progression, Deuce logic, Golden point logic, Game and Set resolution, and the mathematical Serve swapping during tiebreaks.
* UI elements are *not* unit-tested; tests focus purely on the state machine predicting the correct next state.

### 6.2 End-to-End Testing (Playwright)

Playwright mimics a real user interacting with the deployed app.

* **Touch Scenarios:** Loading the app, setting up a match, tapping the screen to win a set, checking the scoreboard updates.
* **Hardware Scenarios:** Playwright dispatches `KeyboardEvent`s simulating the Bluetooth presenter to ensure the global listeners function correctly in the browser context.

## 7. Developer Workflow, CI/CD, and Deployment (Cloudflare)

To ensure high code quality, automated versioning, and seamless edge deployment:

1. **Pre-commit:** **Husky** triggers **Lint-staged**.
2. **Linting/Formatting:** **Biome** runs on staged files, checking for code quality and auto-formatting TypeScript and React files in milliseconds.
3. **Commit Message:** **Commitlint** checks the commit message format (e.g., `feat: add endless mode`, `fix: undo stack logic`).
4. **CI Pipeline (GitHub Actions):** On push to `main`, the CI runs Vitest and Playwright tests.
5. **Release & Deploy:** - If tests pass, **Semantic-release** analyzes the conventional commits, bumps the semantic version number, generates a `CHANGELOG.md`, and creates a GitHub Release/Tag.
* A subsequent GitHub Action step (or direct Cloudflare Pages GitHub integration) builds the TanStack Start SPA (`npm run build`) and publishes the static output directory directly to **Cloudflare Pages**.
* Cloudflare propagates the app to its global edge network, invalidating the previous cache and serving the new version instantly.
