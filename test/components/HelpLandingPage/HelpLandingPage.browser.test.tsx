import type { ReactNode } from 'react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { HelpLandingPage } from '@/components/HelpLandingPage/HelpLandingPage';
import * as i18nModule from '@/lib/i18n/i18n';

const mockHistoryBack = vi.fn<() => void>();

// Mock @tanstack/react-router to provide Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => (_to: string) => {},
  redirect: (options: unknown) => options,
  useRouter: () => ({ history: { back: mockHistoryBack } }),
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
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18nModule.i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18nModule.changeLocale('en');
  });

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

  test('renders all TOC links with correct labels', async () => {
    const screen = await render(<HelpLandingPage />);

    const expectedLinks = [
      { label: 'What is Padel Buddy?', href: '#what-is' },
      { label: 'The main flow', href: '#main-flow' },
      { label: 'Setting up a match', href: '#setup' },
      { label: 'Live match screen', href: '#live-match' },
      { label: 'Match end screen', href: '#match-end' },
      { label: 'Match history', href: '#history' },
      { label: 'Recovery and reliability', href: '#recovery' },
      { label: 'Built-in help system', href: '#help-system' },
      { label: 'Languages and accessibility', href: '#accessibility' },
      { label: 'Web, PWA, and native apps', href: '#platforms' },
      { label: 'Small but important details', href: '#small-details' }
    ];

    const tocNav = screen.container.querySelector(
      'nav[aria-labelledby="toc-heading"]'
    ) as HTMLElement;
    expect(tocNav).toBeTruthy();

    for (const { label, href } of expectedLinks) {
      const link = Array.from(tocNav.querySelectorAll('a')).find(
        (a) => a.textContent?.trim() === label
      );
      expect(link, `TOC link "${label}" should exist`).toBeTruthy();
      expect(link?.getAttribute('href')).toBe(href);
    }
  });

  test('renders all section headings', async () => {
    const screen = await render(<HelpLandingPage />);

    const expectedHeadings = [
      'What is Padel Buddy?',
      'The Main Flow of the App',
      'Setting Up a Match',
      'Live Match Screen',
      'Match End Screen',
      'Match History',
      'Recovery, Safety, and Reliability',
      'Help System Inside the App',
      'Languages and Accessibility',
      'PWA, Offline Use, Web, and Native Apps',
      'Small But Important Details'
    ];

    for (const heading of expectedHeadings) {
      const el = screen.getByRole('heading', { name: heading, level: 2 });
      expect(el.element()).toBeInTheDocument();
    }
  });

  test('back button calls router history back', async () => {
    const screen = await render(<HelpLandingPage />);

    const backButton = screen.getByRole('button', { name: 'Back' });
    await expect.element(backButton).toBeInTheDocument();
    await backButton.click();

    expect(mockHistoryBack).toHaveBeenCalledOnce();
  });

  test('switching language to Spanish updates TOC and section content', async () => {
    await i18nModule.changeLocale('es');

    const screen = await render(<HelpLandingPage />);

    const tocNav = screen.container.querySelector(
      'nav[aria-labelledby="toc-heading"]'
    ) as HTMLElement;
    expect(tocNav?.textContent).toContain('¿Qué es Padel Buddy?');
  });

  test('switching language to Portuguese updates TOC and section content', async () => {
    await i18nModule.changeLocale('pt');

    const screen = await render(<HelpLandingPage />);

    const tocNav = screen.container.querySelector(
      'nav[aria-labelledby="toc-heading"]'
    ) as HTMLElement;
    expect(tocNav?.textContent).toContain('O que é o Padel Buddy?');
  });

  test('each section is labelled by its heading', async () => {
    const screen = await render(<HelpLandingPage />);

    const sectionIds = [
      'what-is',
      'main-flow',
      'setup',
      'live-match',
      'match-end',
      'history',
      'recovery',
      'help-system',
      'accessibility',
      'platforms',
      'small-details'
    ];

    for (const id of sectionIds) {
      const section = screen.container.querySelector(`section#${id}`) as HTMLElement | null;
      expect(section, `section#${id} should exist`).toBeTruthy();
      expect(section?.getAttribute('aria-labelledby')).toBe(`${id}-title`);

      const heading = screen.container.querySelector(`#${id}-title`);
      expect(heading, `heading #${id}-title should exist`).toBeTruthy();
    }
  });
});
