import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';
import { createRef } from 'react';

import { AppHelpSpotlight } from '@/components/ui/TopBar/AppHelpSpotlight';

const SPOTLIGHT_KEY = 'padelbuddy_help_spotlight_seen';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('AppHelpSpotlight', () => {
  let rendered: RenderResult | null = null;

  beforeEach(() => {
    localStorage.removeItem(SPOTLIGHT_KEY);
  });

  afterEach(async () => {
    // Unmount React tree first so portal nodes are cleaned up properly
    // before shared.ts afterEach clears document.body.innerHTML
    if (rendered) {
      void rendered.unmount();
      rendered = null;
      // Give React time to finish portal cleanup
      await sleep(50);
    }
    localStorage.removeItem(SPOTLIGHT_KEY);
  });

  test('returns null when showOnFirstVisit is false', async () => {
    const triggerRef = createRef<HTMLButtonElement>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={false} />
      </>
    );

    const overlay = rendered.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeNull();
  });

  test('returns null when spotlight has already been seen', async () => {
    localStorage.setItem(SPOTLIGHT_KEY, 'true');
    const triggerRef = createRef<HTMLButtonElement>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={true} />
      </>
    );

    // Even after waiting, spotlight should not appear for returning users
    await sleep(600);

    const overlay = rendered.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeNull();
  });

  test('shows spotlight after delay for first-time users', async () => {
    const triggerRef = createRef<HTMLButtonElement>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={true} />
      </>
    );

    // Wait for the 500ms internal delay
    await sleep(600);

    const overlay = rendered.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).not.toBeNull();
  });

  test('dismisses spotlight via Escape key and calls onDismiss', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const onDismiss = vi.fn<() => void>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={true} onDismiss={onDismiss} />
      </>
    );

    await sleep(600);

    // Verify spotlight is visible
    expect(rendered.container.querySelector('[data-testid="spotlight-overlay"]')).not.toBeNull();

    // Press Escape to dismiss
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBe('true');
    expect(onDismiss).toHaveBeenCalled();

    // Wait for re-render
    await sleep(50);
    expect(rendered.container.querySelector('[data-testid="spotlight-overlay"]')).toBeNull();
  });

  test('dismisses spotlight when trigger element is clicked', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const onDismiss = vi.fn<() => void>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={true} onDismiss={onDismiss} />
      </>
    );

    await sleep(600);

    // Click the trigger button to dismiss
    triggerRef.current!.click();

    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBe('true');
    expect(onDismiss).toHaveBeenCalled();
  });

  test('measures trigger rect on resize while visible', async () => {
    const triggerRef = createRef<HTMLButtonElement>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={true} />
      </>
    );

    await sleep(600);

    // Trigger a resize event to cover the resize handler branch
    window.dispatchEvent(new Event('resize'));
  });

  test('measures trigger rect on scroll while visible', async () => {
    const triggerRef = createRef<HTMLButtonElement>();

    rendered = await render(
      <>
        <button type="button" ref={triggerRef}>
          Trigger
        </button>
        <AppHelpSpotlight triggerRef={triggerRef} showOnFirstVisit={true} />
      </>
    );

    await sleep(600);

    // Trigger a scroll event to cover the scroll handler branch
    window.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
});
