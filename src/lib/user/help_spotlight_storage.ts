const HELP_SPOTLIGHT_SEEN_KEY = 'padelbuddy_help_spotlight_seen';

/**
 * Returns true if the help spotlight has already been seen in this browser.
 * SSR-safe: returns true (fail-closed) when localStorage is unavailable.
 */
export function isHelpSpotlightSeen(): boolean {
  if (typeof localStorage === 'undefined') {
    return true; // fail closed during SSR
  }

  try {
    return localStorage.getItem(HELP_SPOTLIGHT_SEEN_KEY) === '1';
  } catch {
    return true; // fail closed on storage errors
  }
}

/**
 * Marks the help spotlight as seen. After this call, the spotlight
 * will not appear again on subsequent visits in this browser.
 */
export function markHelpSpotlightSeen(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(HELP_SPOTLIGHT_SEEN_KEY, '1');
  } catch {
    // Silently ignore storage errors — the worst case is a repeated spotlight
  }
}
