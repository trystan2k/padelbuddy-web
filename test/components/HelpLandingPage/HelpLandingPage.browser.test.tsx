import type { ReactNode } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { HelpLandingPage } from '@/components/HelpLandingPage/HelpLandingPage';

// Mock @tanstack/react-router to provide Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => (_to: string) => {},
  redirect: (options: unknown) => options,
  getViewTransitionNavigationOptions: () => ({})
}));

// Mock TopBar since we're not testing TopBar in this file
vi.mock('@/components/ui/TopBar/TopBar', () => ({
  TopBar: ({ children, subtitle }: { children: ReactNode; subtitle?: string }) => (
    <div data-testid="top-bar">
      {subtitle && <span data-testid="top-bar-subtitle">{subtitle}</span>}
      {children}
    </div>
  )
}));

describe('HelpLandingPage', () => {
  test('renders TopBar subtitle and footer CTA', async () => {
    const screen = await render(<HelpLandingPage />);

    // TopBar subtitle is set to the hero eyebrow text via i18n
    const subtitle = screen.getByTestId('top-bar-subtitle');
    await expect.element(subtitle).toBeInTheDocument();
    await expect.element(subtitle).toHaveTextContent('Help Guide');

    // Footer CTA button exists (rendered via Layout footer prop)
    const footerCta = screen.container.querySelector(
      'footer button[class*="backButton"]'
    ) as HTMLElement | null;
    await expect.element(footerCta).toBeInTheDocument();
  });

  test('TOC navigation is present and labelled by the heading', async () => {
    const screen = await render(<HelpLandingPage />);

    const tocNav = screen.container.querySelector(
      'nav[aria-labelledby="toc-heading"]'
    ) as HTMLElement | null;

    await expect.element(tocNav).toBeInTheDocument();
    expect(tocNav?.getAttribute('aria-labelledby')).toBe('toc-heading');
  });

  test('article page element exists with page class', async () => {
    const screen = await render(<HelpLandingPage />);

    // Find the article element (main content container)
    const article = screen.container.querySelector('article[class*="page"]') as HTMLElement | null;
    await expect.element(article).toBeInTheDocument();
  });

  test('TOC heading has correct id', async () => {
    const screen = await render(<HelpLandingPage />);

    // Find the toc-heading element directly by id (i18n resolves to "On this page")
    const tocHeading = screen.container.querySelector('#toc-heading') as HTMLElement | null;
    await expect.element(tocHeading).toBeInTheDocument();
    await expect.element(tocHeading).toHaveTextContent('On this page');
  });

  test('main article element exists without aria-labelledby', async () => {
    const screen = await render(<HelpLandingPage />);

    // Find the article element — it no longer has aria-labelledby
    const article = screen.container.querySelector('article');
    await expect.element(article).toBeInTheDocument();

    expect(article?.getAttribute('aria-labelledby')).toBeNull();
  });

  test('section items use ul instead of ol', async () => {
    const screen = await render(<HelpLandingPage />);

    // Find the mainFlow section (which has items, unlike what-is which is empty)
    const mainFlowSection = screen.container.querySelector('#main-flow') as HTMLElement | null;
    await expect.element(mainFlowSection).toBeInTheDocument();

    // Check that item list uses ul (unordered list)
    const itemList = mainFlowSection?.querySelector('ul') as HTMLElement | null;
    await expect.element(itemList).toBeInTheDocument();
  });

  test('item cards are divs, not articles', async () => {
    const screen = await render(<HelpLandingPage />);

    // Find the main-flow section
    const mainFlowSection = screen.container.querySelector('#main-flow') as HTMLElement | null;
    await expect.element(mainFlowSection).toBeInTheDocument();

    // Verify item cards are divs, not articles
    const itemCards = mainFlowSection?.querySelectorAll('[class*="itemCard"]');
    expect(itemCards).toBeTruthy();
    expect(itemCards!.length).toBeGreaterThan(0);

    for (const card of itemCards!) {
      expect(card.tagName.toLowerCase()).toBe('div');
    }
  });
});
