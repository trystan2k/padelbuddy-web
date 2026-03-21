type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransition
}

export function supportsViewTransitions(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  return typeof (document as ViewTransitionDocument).startViewTransition === 'function'
}

export function getViewTransitionNavigationOptions():
  | { viewTransition: true }
  | Record<string, never> {
  return supportsViewTransitions() ? { viewTransition: true } : {}
}
