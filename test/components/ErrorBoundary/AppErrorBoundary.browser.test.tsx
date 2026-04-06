import type { ReactNode } from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { AppErrorBoundary } from '@/components/ErrorBoundary/AppErrorBoundary';

function BrokenScreen(): ReactNode {
  throw new Error('Boom');
}

function renderCustomFallback({ error }: { error: Error }) {
  return <div>Custom fallback: {error.message}</div>;
}

describe('AppErrorBoundary', () => {
  test('renders the shared fallback when a child throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const screen = await render(
      <AppErrorBoundary>
        <BrokenScreen />
      </AppErrorBoundary>
    );

    await expect.element(screen.getByText('View recovery')).toBeVisible();
    await expect
      .element(screen.getByRole('heading', { level: 1 }))
      .toHaveTextContent('Something interrupted this screen.');
    await expect.element(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('supports a custom fallback render prop', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const screen = await render(
      <AppErrorBoundary fallback={renderCustomFallback}>
        <BrokenScreen />
      </AppErrorBoundary>
    );

    await expect.element(screen.getByText('Custom fallback: Boom')).toBeVisible();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
