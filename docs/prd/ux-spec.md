# UX and Interaction Specification

Version: 2.0
Status: Normative

## 1) Screen Flow

- UX-01 Setup screen -> Active Match screen -> Match End screen.
- UX-02 Continue Playing appears only on Match End after official completion.
- UX-03 Continue Playing removes set-limit cap and returns to Active Match.

## 2) Setup Screen Requirements

Setup MUST include:
- Team names
- Match format (1/3/5)
- Initial server
- Advantage vs Golden Point
- Deciding-set super tiebreak toggle
- Conditional Best-of-1 deciding behavior field (inline)
- Locale switch (setup only)
- Start Match action

## 3) Active Match Layout

- Minimal scoreboard-first visual hierarchy.
- Always-visible controls:
  - Undo
  - Mute (on/off)
  - Reset
- Serving indicator MUST be clear and persistent.

## 4) Input Mapping and Debounce

Input behavior is unified across all methods.

Remote + keyboard aliases:
- Team 1 score: `ArrowLeft` / `PageUp`
- Team 2 score: `ArrowRight` / `PageDown`
- Undo: `Backspace` / `Escape` (and supported presenter aliases)

Touch:
- Tap Team 1 score area -> +1 Team 1 point
- Tap Team 2 score area -> +1 Team 2 point
- Tap Undo -> undo last scoring action

Debounce:
- Fixed 300ms debounce across scoring inputs.

## 5) Audio and Speech

- Audio control is on/off only.
- Speech supports configurable verbosity.
- Tiebreak announcements use tiebreak-specific phrasing.
- Rapid action behavior: cancel queued utterances and speak latest score only.
- Voice fallback chain:
  - selected locale voice
  - English voice
  - mute gracefully

## 6) Localization

- Locales in v1: English, Portuguese, Spanish.
- First launch locale selection:
  - browser language detection
  - fallback to default language when unsupported
- User locale preference persists across sessions.
- Manual language switching is available on setup only.

## 7) Orientation and Responsiveness

- Landscape is preferred on phone; show rotate suggestion.
- Portrait remains usable (not blocked).
- Mobile-first responsive behavior is mandatory.

## 8) Accessibility Baseline

Core flows MUST implement:
- Semantic controls and labels
- Visible keyboard focus states
- Sufficient contrast for core UI states
- Minimum touch target size: 48px
- Respect `prefers-reduced-motion`

## 9) Wake Lock UX

- Attempt screen wake lock when entering active match context.
- If unsupported or denied, continue normally and show non-blocking warning.

## 10) Error UX

- Critical runtime failures show friendly recovery screen.
- Recovery screen action: `Reset and continue` only.
- Technical details are logged to console (production errors only policy).
