import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { LocaleSelector } from '@/components/ui/LocaleSelector/LocaleSelector';
import { TopBar } from '@/components/ui/TopBar/TopBar';
import * as i18nModule from '@/lib/i18n/i18n';

describe('LocaleSelector', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18nModule.i18n.changeLanguage('en');
  });

  test('renders as TopBar child content', async () => {
    const screen = await render(
      <TopBar title="My App">
        <LocaleSelector currentLocale="en" />
      </TopBar>
    );

    await expect.element(screen.getByText('My App')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
  });

  test('renders the controlled locale label', async () => {
    const screen = await render(<LocaleSelector currentLocale="es" />);

    await expect.element(screen.getByRole('button', { name: /español/i })).toBeInTheDocument();
  });

  test('toggles the locale menu with preserved aria attributes', async () => {
    const screen = await render(<LocaleSelector currentLocale="en" />);

    const trigger = screen.getByRole('button', { name: /english/i });
    const triggerElement = trigger.element();
    await expect.element(trigger).toHaveAttribute('aria-haspopup', 'true');
    await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

    // Use dispatchEvent for reliable click triggering in CI where Playwright's
    // click() may not reach the component due to overlay/z-index issues
    triggerElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(
      () => {
        expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
        expect(triggerElement.getAttribute('aria-controls')).toBe('locale-menu');
      },
      { timeout: 5000 }
    );

    const menu = screen.container.querySelector('#locale-menu');
    expect(menu?.getAttribute('role')).toBe('group');
    expect(menu?.getAttribute('aria-label')).toBeTruthy();
    expect(menu?.textContent).toContain('English');
    expect(menu?.textContent).toContain('Español');
    expect(menu?.textContent).toContain('Português');
  });

  test('calls changeLocale and onLocaleChange when locale changes', async () => {
    const handleLocaleChange = vi.fn<(locale: string) => void>();
    const screen = await render(<LocaleSelector onLocaleChange={handleLocaleChange} />);

    const triggerElement = screen.getByRole('button', { name: /english/i }).element();
    triggerElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for the menu to appear before querying it
    const menu = await vi.waitFor(
      () => {
        const found = screen.container.querySelector('#locale-menu');
        if (!found) throw new Error('Menu not visible yet');
        return found;
      },
      { timeout: 5000 }
    );

    const spanishOption = Array.from(menu.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Español')
    );

    expect(spanishOption).toBeTruthy();
    spanishOption!.click();

    await vi.waitFor(
      () => {
        expect(handleLocaleChange).toHaveBeenCalledWith('es');
        expect(i18nModule.i18n.resolvedLanguage ?? i18nModule.i18n.language).toBe('es');
      },
      { timeout: 5000 }
    );
  });

  test('does not call changeLocale when selecting the current locale', async () => {
    const handleLocaleChange = vi.fn<(locale: string) => void>();
    const screen = await render(
      <LocaleSelector currentLocale="en" onLocaleChange={handleLocaleChange} />
    );
    const triggerElement = screen.getByRole('button', { name: /english/i }).element();

    triggerElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for the menu to appear before querying it
    const menu = await vi.waitFor(
      () => {
        const found = screen.container.querySelector('#locale-menu');
        if (!found) throw new Error('Menu not visible yet');
        return found;
      },
      { timeout: 5000 }
    );

    const englishMenuOption = Array.from(menu.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('English')
    );

    expect(englishMenuOption).toBeTruthy();
    englishMenuOption!.click();

    expect(handleLocaleChange).not.toHaveBeenCalled();
  });
});
