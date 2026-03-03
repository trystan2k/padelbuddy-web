# Scoring Specification (Authoritative)

Version: 2.0
Status: Normative

## 1) Rule Authority

- FIP-aligned rules are the default authority.
- Intentional product variants are explicitly defined in setup options below.

## 2) Setup Options

| Option | Values | Default | Locking |
| --- | --- | --- | --- |
| Match format | Best of 1/3/5 | Best of 3 | Locked after match start |
| Game mode | Advantage / Golden Point | Advantage | Locked after match start |
| Initial server | Team 1 / Team 2 | Team 1 | Locked after match start |
| Deciding-set super tiebreak | On / Off | Off | Locked after match start |
| Best-of-1 deciding behavior (conditional) | Full set / Super tiebreak decider | Full set | Inline setup field; locked after start |
| Side-switch prompts | On / Off | Off | May remain toggleable in match |

## 3) Core Scoring Rules

- SR-01 Point progression in normal games: `0 -> 15 -> 30 -> 40 -> game`.
- SR-02 At deuce:
  - Advantage mode: team must win two consecutive points after deuce.
  - Golden Point mode: next point wins game.
- SR-03 Set win condition: first to 6 games with 2-game lead.
- SR-04 At `6-6` in a set, standard tiebreak is played unless deciding-set super tiebreak applies.
- SR-05 Standard tiebreak win condition: first to 7 points, win by 2.
- SR-06 Deciding-set super tiebreak (if enabled): first to 10 points, win by 2.

## 4) Deciding-Set Logic

- DS-01 For Best of 3, deciding set is set 3.
- DS-02 For Best of 5, deciding set is set 5.
- DS-03 For Best of 1 with deciding-set option enabled, setup MUST ask whether set 1 uses super tiebreak decider.

## 5) Serve Tracking and Rotation

- SV-01 Service tracking is team-based.
- SV-02 Service alternates by game in non-tiebreak play.
- SV-03 Tiebreak service progression MUST follow deterministic tiebreak serving math.
- SV-04 After set completion, first server of next set follows continuous rotation (no set-level reset).

## 6) Side-Switch Guidance (Optional)

If enabled:
- SS-01 Prompt side switch after odd total games in each set.
- SS-02 During tiebreaks, prompt every 6 points.
- SS-03 Prompts are subtle non-blocking banners (never blocking scoring actions).

## 7) Undo Contract

- UN-01 Undo applies to score actions only.
- UN-02 Undo MUST fully restore derived state caused by undone actions, including:
  - game/set/match status
  - serve indicator state
  - endless-mode transition if triggered by undone sequence
- UN-03 Undo depth is bounded only by available current-match action history.

## 8) Invariants

- INV-01 Match state transitions are deterministic for identical action sequences.
- INV-02 UI input source (touch, remote, keyboard alias) cannot change rule outcomes.
- INV-03 History/action log is current-match only and clears on full reset.

## 9) Error and Recovery

- ER-01 If persisted scoring state is corrupted and unusable, app enters recovery screen.
- ER-02 Recovery screen exposes one action only: `Reset and continue`.
- ER-03 If schema upgrade is incompatible, app may silently reset, but MUST show one-time non-blocking notice post-startup.
