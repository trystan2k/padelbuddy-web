import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { TopBar } from '@/components/ui/TopBar/TopBar';

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without any props', async () => {
    const screen = await render(<TopBar />);

    expect(screen.container.firstElementChild).toBeTruthy();
    expect(screen.container.firstElementChild?.childElementCount).toBe(0);
  });

  test('renders branding content', async () => {
    const screen = await render(
      <TopBar iconSrc="/icon.png" iconAlt="App Icon" title="My App" subtitle="Subtitle text" />
    );

    await expect.element(screen.getByText('My App')).toBeInTheDocument();
    await expect.element(screen.getByText('Subtitle text')).toBeInTheDocument();

    const img = screen.container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/icon.png');
    expect(img?.getAttribute('alt')).toBe('App Icon');
  });

  test('forwards className to container', async () => {
    const screen = await render(<TopBar className="custom-top-bar" title="My App" />);

    expect(screen.container.firstElementChild?.classList.contains('custom-top-bar')).toBe(true);
  });

  test('title renders as h1 element', async () => {
    const screen = await render(<TopBar title="My App" />);

    await expect
      .element(screen.getByRole('heading', { level: 1, name: 'My App' }))
      .toBeInTheDocument();
  });

  test('renders children in the actions slot', async () => {
    const screen = await render(
      <TopBar title="My App">
        <button type="button">Action</button>
      </TopBar>
    );

    await expect.element(screen.getByText('My App')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  test('renders without branding when no branding props are provided', async () => {
    const screen = await render(
      <TopBar>
        <button type="button">Action</button>
      </TopBar>
    );

    const branding = screen.container.querySelector('[class*="branding"]');
    expect(branding).toBeNull();
    await expect.element(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  test('keeps decorative icons hidden from screen readers', async () => {
    const screen = await render(<TopBar iconSrc="/icon.png" iconAlt="" title="My App" />);

    const img = screen.container.querySelector('img');
    expect(img?.getAttribute('aria-hidden')).toBe('true');
  });

  test('accessible icon is NOT aria-hidden when alt text is provided', async () => {
    const screen = await render(<TopBar iconSrc="/icon.png" iconAlt="App Icon" title="My App" />);

    const img = screen.container.querySelector('img');
    expect(img?.hasAttribute('aria-hidden')).toBe(false);
  });
});
