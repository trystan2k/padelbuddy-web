import type { ReactNode } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )
}));

describe('NotFoundPage browser', () => {
  test('renders the not-found guidance', async () => {
    const screen = await render(<NotFoundPage />);

    await expect.element(screen.getByText('Page not found')).toBeVisible();
    await expect
      .element(screen.getByRole('heading', { level: 1 }))
      .toHaveTextContent('We could not find that route.');
    await expect.element(screen.getByText(/The app foundation is running/)).toBeVisible();
    await expect
      .element(screen.getByRole('link', { name: 'Go back to the home screen' }))
      .toHaveAttribute('href', '/');
  });
});
