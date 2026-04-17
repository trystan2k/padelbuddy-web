export const helpSpotlightSeenStorageKey = 'padelbuddy_help_spotlight_seen';

/** Returns true when the first-visit help spotlight has already been seen. */
export function hasHelpSpotlightBeenSeen(): boolean {
  try {
    return localStorage.getItem(helpSpotlightSeenStorageKey) === 'true';
  } catch {
    // When localStorage is unavailable (e.g. SSR, strict private browsing),
    // treat as already seen so the spotlight is suppressed rather than shown on every visit.
    return true;
  }
}

/** Marks the first-visit help spotlight as seen. */
export function markHelpSpotlightSeen(): void {
  try {
    localStorage.setItem(helpSpotlightSeenStorageKey, 'true');
  } catch {
    // localStorage can be unavailable in constrained contexts.
  }
}
