import { useEffect, useState } from 'react';

interface UseActiveSectionOptions {
  /** Array of section IDs to observe */
  sectionIds: string[];
  /** Offset for intersection (accounts for fixed headers, TOC height) */
  rootMargin?: string;
  /** Threshold for intersection */
  threshold?: number;
}

/**
 * Custom hook that tracks which section is most visible in the viewport.
 * Uses IntersectionObserver to detect scroll position.
 *
 * @warning Pass a stable `sectionIds` reference (e.g. a module-level constant or
 * `useMemo`). An inline array literal creates a new reference on every render,
 * causing the observer to disconnect and reconnect unnecessarily.
 */
export function useActiveSection({
  sectionIds,
  rootMargin = '-80px 0px -70% 0px',
  threshold = 0
}: UseActiveSectionOptions): string | null {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? null);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveId(null);
      return () => {};
    }

    if (!('IntersectionObserver' in window)) {
      setActiveId(sectionIds[0] ?? null);
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // Sort by top position to get the topmost visible section
          const topmost = visibleEntries.toSorted((a, b) => {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          })[0];

          setActiveId(topmost?.target.id ?? null);
        }
      },
      { rootMargin, threshold }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds, rootMargin, threshold]);

  return activeId;
}
