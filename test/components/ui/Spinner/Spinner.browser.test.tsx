import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Spinner } from '@/components/ui/Spinner/Spinner';

describe('Spinner', () => {
  test('renders with default size (md), primary color, and accessible role', async () => {
    const screen = await render(<Spinner />);

    const spinner = screen.getByRole('status');
    await expect.element(spinner).toBeInTheDocument();
    await expect.element(spinner).toHaveAttribute('aria-live', 'polite');
    await expect.element(spinner).toHaveAttribute('aria-busy', 'true');
    await expect.element(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  test('renders with custom label', async () => {
    const screen = await render(<Spinner label="Saving" />);

    const spinner = screen.getByRole('status');
    await expect.element(spinner).toHaveAttribute('aria-label', 'Saving');
  });

  test('applies size sm class', async () => {
    const screen = await render(<Spinner size="sm" />);

    const spinner = screen.getByRole('status');
    const classList = spinner.element().classList;
    // Should contain the spinner base class + sizeSm class
    expect(classList.length).toBeGreaterThanOrEqual(2);
  });

  test('applies size lg class', async () => {
    const screen = await render(<Spinner size="lg" />);

    const spinner = screen.getByRole('status');
    const classList = spinner.element().classList;
    expect(classList.length).toBeGreaterThanOrEqual(2);
  });

  test('applies secondary color class', async () => {
    const screen = await render(<Spinner color="secondary" />);

    const spinner = screen.getByRole('status');
    const classList = spinner.element().classList;
    expect(classList.length).toBeGreaterThanOrEqual(2);
  });

  test('hides role and aria-live when silent is true', async () => {
    const screen = await render(<Spinner silent />);

    const spinner = screen.container.querySelector('span[aria-busy="true"]')!;
    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('role')).toBeNull();
    expect(spinner.getAttribute('aria-live')).toBeNull();
  });

  test('renders indicator and visually hidden label elements', async () => {
    const screen = await render(<Spinner label="Loading data" />);

    const indicator = screen.container.querySelector('[aria-hidden="true"]');
    expect(indicator).toBeTruthy();

    // The visually hidden span contains the label text
    const visuallyHidden = screen.container.querySelector('[aria-hidden] + span');
    expect(visuallyHidden?.textContent).toBe('Loading data');
  });

  test('passes additional props to the span element', async () => {
    const screen = await render(<Spinner data-testid="my-spinner" />);

    await expect.element(screen.getByTestId('my-spinner')).toBeInTheDocument();
  });

  test('applies custom className alongside base classes', async () => {
    const screen = await render(<Spinner className="custom-class" />);

    const spinner = screen.getByRole('status');
    expect(spinner.element().classList.contains('custom-class')).toBe(true);
  });
});
