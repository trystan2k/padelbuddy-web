import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';
import { createRef } from 'react';

import { AppHelpSpotlight } from '@/components/ui/TopBar/AppHelpSpotlight';

const SPOTLIGHT_KEY = 'padelbuddy_help_spotlight_seen';

describe('AppHelpSpotlight', () => {
  let rendered: RenderResult | null = null;

  beforeEach(() => {
    localStorage.removeItem(SPOTLIGHT_KEY);
  });

  afterEach(async () => {
    if (rendered) {
      void rendered.unmount();
      rendered = null;
      await vi.waitFor(() => {
        expect(document.querySelector('[data-testid="spotlight-overlay"]')).toBeNull();
      });
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

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).toBeNull();
    });
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

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).not.toBeNull();
    });
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

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).not.toBeNull();
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(localStorage.getItem(SPOTLIGHT_KEY)).toBe('true');
    expect(onDismiss).toHaveBeenCalled();

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).toBeNull();
    });
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

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).not.toBeNull();
    });

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

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).not.toBeNull();
    });

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

    await vi.waitFor(() => {
      expect(rendered?.container.querySelector('[data-testid="spotlight-overlay"]')).not.toBeNull();
    });

    window.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
});
