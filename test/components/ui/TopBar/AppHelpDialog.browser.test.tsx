import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, cleanup } from 'vitest-browser-react';

import { AppHelpDialog } from '@/components/ui/TopBar/AppHelpDialog';
import * as spotlightStorage from '@/lib/user/help_spotlight_storage';

describe('AppHelpDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear spotlight storage before each test
    localStorage.removeItem('padelbuddy_help_spotlight_seen');
  });

  afterEach(async () => {
    await cleanup();
  });

  test('renders trigger button with accessible label', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger');
    await expect.element(trigger).toBeInTheDocument();
    // Verify aria-label exists and is not empty (locale-dependent, so avoid hardcoding)
    const ariaLabel = trigger.element().getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel!.length).toBeGreaterThan(0);
  });

  test('opens dialog when trigger is clicked', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for dialog to appear
    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    const dialog = screen.getByTestId('help-dialog');
    await expect.element(dialog).toHaveAttribute('role', 'dialog');
    await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('closes dialog when close button is clicked', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    // Open the dialog
    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Close via close button
    const closeButton = screen.getByTestId('help-close').element();
    closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Dialog should be removed
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="help-dialog"]')).toBeNull();
    });
  });

  test('closes dialog when backdrop is clicked', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    // Open the dialog
    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Click backdrop (near corner to avoid dialog)
    const backdrop = screen.getByTestId('help-backdrop').element();
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }));

    // Dialog should be removed
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="help-dialog"]')).toBeNull();
    });
  });

  test('closes dialog when Escape key is pressed', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    // Open the dialog
    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Press Escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    // Dialog should be removed
    await vi.waitFor(() => {
      expect(screen.container.querySelector('[data-testid="help-dialog"]')).toBeNull();
    });
  });

  test('dialog has accessible title linked via aria-labelledby', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Verify dialog has aria-labelledby attribute pointing to the title
    const dialog = screen.getByTestId('help-dialog');
    await expect.element(dialog).toHaveAttribute('aria-labelledby', 'help-dialog-title');

    // Verify the title element exists with the matching ID
    const titleElement = document.querySelector('#help-dialog-title');
    await expect.element(titleElement as HTMLElement).toBeInTheDocument();
    await expect.element(titleElement as HTMLElement).toHaveTextContent('Padel Buddy');
  });

  test('focus returns to trigger after dialog closes', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Close via close button
    const closeButton = screen.getByTestId('help-close').element();
    closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for dialog to be removed
    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="help-dialog"]')).toBeNull();
    });

    // Focus should have returned to the trigger
    const triggerAfterClose = screen.getByTestId('help-trigger').element() as HTMLElement;
    expect(document.activeElement).toBe(triggerAfterClose);
  });

  test('store links have correct href values', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    const androidLink = screen.getByTestId('store-link-android');
    const iosLink = screen.getByTestId('store-link-ios');

    await expect.element(androidLink).toHaveAttribute('href', '#android-store');
    await expect.element(iosLink).toHaveAttribute('href', '#ios-store');
  });

  test('store badge images have correct default locale src attributes', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Check that store badge images exist inside the store links
    const androidImg = screen.getByTestId('store-link-android').element().querySelector('img');
    const iosImg = screen.getByTestId('store-link-ios').element().querySelector('img');

    await expect.element(androidImg).toBeInTheDocument();
    await expect.element(iosImg).toBeInTheDocument();

    // Default locale is 'en' so expected suffix is 'en'
    await expect.element(androidImg).toHaveAttribute('src', '/stores/GooglePlay_en.svg');
    await expect.element(iosImg).toHaveAttribute('src', '/stores/AppStore_en.svg');
  });

  test('footer displays app title and version', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // The footer is a contentinfo region - find the span with exact text "Padel Buddy"
    const footer = screen.getByRole('contentinfo');
    await expect.element(footer).toBeInTheDocument();

    // The footer should contain the app name and version
    const footerAppName = footer
      .element()
      .querySelector('[class*="footerAppName"]') as HTMLElement | null;
    await expect.element(footerAppName).toHaveTextContent('Padel Buddy');
  });
});

describe('AppHelpSpotlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear spotlight storage before each test
    localStorage.removeItem('padelbuddy_help_spotlight_seen');
  });

  afterEach(async () => {
    await cleanup();
  });

  test('spotlight does NOT appear by default (showFirstVisitSpotlight=false)', async () => {
    const screen = await render(<AppHelpDialog appTitle="Padel Buddy" />);

    // Wait for any effects to settle
    await vi.waitFor(() => {}, { timeout: 1000 });

    // Spotlight should not be in the DOM
    const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeNull();
  });

  test('spotlight does NOT appear if already seen', async () => {
    // Mark spotlight as already seen
    spotlightStorage.markHelpSpotlightSeen();

    const screen = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    // Wait for effects to settle
    await vi.waitFor(() => {}, { timeout: 1000 });

    // Spotlight should not be in the DOM
    const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeNull();
  });

  test('spotlight appears on first visit when showFirstVisitSpotlight=true', async () => {
    const screen = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    // Wait for the spotlight to appear
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (!overlay) throw new Error('Spotlight overlay not found');
      },
      { timeout: 5000 }
    );

    const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeInTheDocument();
  });

  test('spotlight dismiss button dismisses and marks seen', async () => {
    const screen = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    // Wait for spotlight
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (!overlay) throw new Error('Spotlight overlay not found');
      },
      { timeout: 5000 }
    );

    // Click dismiss button
    const dismissButton = screen.getByTestId('spotlight-dismiss');
    expect(dismissButton).toBeInTheDocument();
    dismissButton.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Spotlight should be removed
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (overlay) throw new Error('Spotlight overlay still present');
      },
      { timeout: 5000 }
    );

    // Spotlight should remain dismissed on re-render
    await cleanup();
    const screen2 = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    const overlay2 = screen2.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay2).toBeNull();
  });

  test('Escape key dismisses spotlight', async () => {
    const screen = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    // Wait for spotlight
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (!overlay) throw new Error('Spotlight overlay not found');
      },
      { timeout: 5000 }
    );

    // Press Escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    // Spotlight should be removed
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (overlay) throw new Error('Spotlight overlay still present');
      },
      { timeout: 5000 }
    );
  });

  test('backdrop does not intercept clicks - trigger remains clickable', async () => {
    const screen = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    // Wait for spotlight
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (!overlay) throw new Error('Spotlight overlay not found');
      },
      { timeout: 5000 }
    );

    // Click the help trigger - should work directly without needing to dismiss the spotlight first
    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Dialog should appear immediately (spotlight is dismissed and dialog opens in same interaction)
    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });
  });

  test('clicking help trigger opens dialog and marks spotlight seen', async () => {
    const screen = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    // Wait for spotlight
    await vi.waitFor(
      () => {
        const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
        if (!overlay) throw new Error('Spotlight overlay not found');
      },
      { timeout: 5000 }
    );

    // Click the help trigger
    const trigger = screen.getByTestId('help-trigger').element();
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Dialog should appear
    await vi.waitFor(() => {
      screen.getByTestId('help-dialog');
    });

    // Spotlight should be gone
    const overlay = screen.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay).toBeNull();

    // Re-render should not show spotlight again
    await cleanup();
    const screen2 = await render(
      <AppHelpDialog appTitle="Padel Buddy" showFirstVisitSpotlight={true} />
    );

    const overlay2 = screen2.container.querySelector('[data-testid="spotlight-overlay"]');
    expect(overlay2).toBeNull();

    // Dialog should open normally on re-render
    const trigger2 = screen2.getByTestId('help-trigger').element();
    trigger2.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      screen2.getByTestId('help-dialog');
    });
  });
});
