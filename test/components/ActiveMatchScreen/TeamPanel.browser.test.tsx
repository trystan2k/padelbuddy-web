import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { TeamPanel } from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel';
import styles from '@/components/ActiveMatchScreen/TeamPanel/TeamPanel.module.css';
import { resolveCssColor } from '../../utils/css';

describe('TeamPanel', () => {
  const createDefaultProps = () => ({
    teamId: 'team-1' as const,
    teamName: 'Team Alpha',
    score: '15',
    isServing: false,
    onClick: vi.fn<() => void>()
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup handled by shared.ts afterEach (document.body.innerHTML, restoreAllMocks)
  });

  test('renders team name', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} />);

    await expect.element(screen.getByText('Team Alpha')).toBeInTheDocument();
  });

  test('renders score', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} score="40" />);

    await expect.element(screen.getByRole('button')).toHaveTextContent('40');
  });

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn<() => void>();
    const screen = await render(<TeamPanel {...createDefaultProps()} onClick={handleClick} />);

    await screen.getByRole('button').click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} disabled={true} />);

    await expect.element(screen.getByRole('button')).toBeDisabled();
  });

  test('is enabled when disabled prop is false', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} disabled={false} />);

    await expect.element(screen.getByRole('button')).not.toBeDisabled();
  });

  test('renders for team-1 with correct test id', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} teamId="team-1" />);

    await expect.element(screen.getByTestId('team-panel-team-1')).toBeInTheDocument();
  });

  test('renders for team-2 with correct test id', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} teamId="team-2" />);

    await expect.element(screen.getByTestId('team-panel-team-2')).toBeInTheDocument();
  });

  test('has accessible label for scoring', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} teamName="The Champions" />);

    await expect
      .element(screen.getByRole('button'))
      .toHaveAttribute('aria-label', 'Score point for The Champions');
  });

  test('score has aria-live for accessibility', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} />);

    expect(screen.container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  test('applies serving styles when the serving indicator is enabled', async () => {
    const screen = await render(
      <TeamPanel {...createDefaultProps()} isServing={true} showServingIndicator={true} />
    );

    const panel = screen.getByRole('button');
    const score = screen.getByText('15');

    await expect.element(panel).toHaveClass(String(styles.serving));
    expect(getComputedStyle(panel.element()).backgroundColor).toBe(
      resolveCssColor('backgroundColor', 'var(--semantic-color-items-primary-background)')
    );
    expect(getComputedStyle(score.element()).color).toBe(
      resolveCssColor('color', 'var(--semantic-color-items-primary-content)')
    );
  });

  test('does not render games, serving, or golden point affordances', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} />);

    const button = screen.getByRole('button').element();
    const nameElement = screen.getByText('Team Alpha').element();
    const scoreElement = screen.getByText('15').element();
    // Button content should only include the team name and score, no extra affordance text
    expect(button.contains(nameElement)).toBe(true);
    expect(button.contains(scoreElement)).toBe(true);
    const extraSpans = Array.from(button.querySelectorAll('span')).filter(
      (el) => el !== nameElement && el !== scoreElement
    );
    expect(extraSpans.length).toBe(0);

    // No serving indicator should be rendered
    expect(screen.container.querySelector('[data-testid^="serve-indicator-"]')).toBeNull();
  });

  test('has type button', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} />);

    await expect.element(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('renders disabled button when disabled prop is true', async () => {
    const screen = await render(<TeamPanel {...createDefaultProps()} disabled={true} />);

    await expect.element(screen.getByRole('button')).toBeDisabled();
  });

  test('disabled state prevents onClick from being called', async () => {
    const handleClick = vi.fn<() => void>();
    const screen = await render(
      <TeamPanel {...createDefaultProps()} onClick={handleClick} disabled={true} />
    );

    const button = screen.getByRole('button').element();
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
