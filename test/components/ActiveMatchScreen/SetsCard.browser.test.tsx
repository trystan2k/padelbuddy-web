import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { SetsCard } from '@/components/ActiveMatchScreen/SetsCard/SetsCard';
import type { MatchSetState } from '@/core/match/types';
import { createTestSetup, winQuickSet } from '../../core/match/test-helpers';
import { projectMatch } from '@/core/match/replay';

describe('SetsCard', () => {
  test('renders card as accessible button trigger with score context', async () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, []);
    const onOpenHistory = vi.fn<() => void>();

    const screen = await render(
      <SetsCard sets={projection.state.sets} currentSetIndex={0} onOpenHistory={onOpenHistory} />
    );

    const button = screen.getByRole('button', {
      name: /open sets history\. current set score: 0 - 0/i
    });
    await expect.element(button).toBeInTheDocument();
    await expect.element(screen.getByText('Current Set')).toBeInTheDocument();
    expect(button.element().querySelector('button')).toBeNull();
    expect(button.element().querySelector('div')).toBeNull();

    button.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });

  test('renders only current set row and score', async () => {
    const setup = createTestSetup();
    const actions = [...winQuickSet('team-1'), ...winQuickSet('team-2')];
    const projection = projectMatch(setup, actions);

    const screen = await render(<SetsCard sets={projection.state.sets} currentSetIndex={2} />);

    await expect.element(screen.getByTestId('set-row-current')).toBeInTheDocument();
    await expect.element(screen.getByTestId('set-score-current')).toHaveTextContent('0-0');

    expect(screen.container.querySelector('[data-testid="set-row-0"]')).toBeNull();
    expect(screen.container.querySelector('[data-testid="set-number-current"]')).toBeNull();
  });

  test('keeps stable sets-card test id', async () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, []);
    const screen = await render(<SetsCard sets={projection.state.sets} currentSetIndex={0} />);

    await expect.element(screen.getByTestId('sets-card')).toBeInTheDocument();
  });

  test('renders non-interactive fallback when onOpenHistory is absent', async () => {
    const setup = createTestSetup();
    const projection = projectMatch(setup, []);

    const screen = await render(<SetsCard sets={projection.state.sets} currentSetIndex={0} />);

    await expect.element(screen.getByTestId('sets-card')).toBeInTheDocument();
    await expect.element(screen.getByText('Current Set')).toBeInTheDocument();
    expect(screen.container.querySelector('button[data-testid="sets-card"]')).toBeNull();
    expect(screen.container.querySelector('[data-testid="sets-card"]')?.tagName).toBe('DIV');
  });

  test('falls back to latest set when currentSetIndex is null', async () => {
    const sets: MatchSetState[] = [
      {
        index: 1,
        mode: 'standard',
        firstServer: 'team-1',
        completed: true,
        winner: 'team-1',
        games: { 'team-1': 6, 'team-2': 4 },
        tiebreakPoints: null
      },
      {
        index: 2,
        mode: 'standard',
        firstServer: 'team-2',
        completed: false,
        games: { 'team-1': 3, 'team-2': 2 },
        game: {
          kind: 'standard',
          points: { 'team-1': 0, 'team-2': 0 },
          advantageTeam: null
        }
      }
    ];

    const screen = await render(<SetsCard sets={sets} currentSetIndex={null} />);

    await expect.element(screen.getByTestId('set-score-current')).toHaveTextContent('3-2');
  });

  test('shows active super tiebreak points instead of games', async () => {
    const sets: MatchSetState[] = [
      {
        index: 1,
        mode: 'super-tiebreak',
        firstServer: 'team-1',
        completed: false,
        games: { 'team-1': 0, 'team-2': 0 },
        game: {
          kind: 'tiebreak',
          targetPoints: 11,
          points: { 'team-1': 8, 'team-2': 7 }
        }
      }
    ];

    const screen = await render(<SetsCard sets={sets} currentSetIndex={0} />);

    await expect.element(screen.getByTestId('set-score-current')).toHaveTextContent('8-7');
  });

  test('mirrors current set score and accessible label when visual order is swapped', async () => {
    const sets: MatchSetState[] = [
      {
        index: 1,
        mode: 'standard',
        firstServer: 'team-1',
        completed: false,
        games: { 'team-1': 4, 'team-2': 5 },
        game: {
          kind: 'standard',
          points: { 'team-1': 0, 'team-2': 0 },
          advantageTeam: null
        }
      }
    ];

    const screen = await render(
      <SetsCard
        sets={sets}
        currentSetIndex={0}
        visualTeamOrder={['team-2', 'team-1']}
        onOpenHistory={() => undefined}
      />
    );

    await expect.element(screen.getByTestId('set-score-current')).toHaveTextContent('5-4');
    await expect
      .element(
        screen.getByRole('button', { name: /open sets history\. current set score: 5 - 4/i })
      )
      .toBeInTheDocument();
  });
});
