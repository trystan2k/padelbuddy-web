/**
 * Utility function to join class names, filtering out falsy values.
 * Filters out undefined, null, false, and empty strings.
 * This is needed because CSS modules with noUncheckedIndexedAccess can return undefined.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .flat()
    .filter((x) => typeof x === 'string')
    .filter(Boolean)
    .join(' ')
    .trim()
}
