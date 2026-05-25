import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { SetsHistoryModal } from '@/components/ActiveMatchScreen/SetsHistoryModal/SetsHistoryModal';
import type { MatchSetState } from '@/core/match/types';
import en from '@/lib/i18n/locales/en';

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
    completed: true,
    winner: 'team-2',
    games: { 'team-1': 3, 'team-2': 6 },
    tiebreakPoints: null
  },
  {
    index: 3,
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

describe('SetsHistoryModal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  test('renders dialog, headline and completed set history only', async () => {
    const onClose = vi.fn<() => void>();
    const screen = await render(
      <SetsHistoryModal isOpen openToken={1} sets={sets} onClose={onClose} />
    );

    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();
    await expect.element(screen.getByRole('heading', { name: /1 - 1/ })).toBeInTheDocument();
    await expect.element(screen.getByText('Set 1')).toBeInTheDocument();
    await expect.element(screen.getByText('Set 2')).toBeInTheDocument();
    await expect.element(screen.getByText('6 - 4')).toBeInTheDocument();
    await expect.element(screen.getByText('3 - 6')).toBeInTheDocument();
    await expect.element(screen.getByText('Set 3')).not.toBeInTheDocument();
    await expect.element(screen.getByText('8 - 7')).not.toBeInTheDocument();
  });

  test('close button is accessible and closes modal', async () => {
    const onClose = vi.fn<() => void>();
    const screen = await render(
      <SetsHistoryModal isOpen openToken={1} sets={sets} onClose={onClose} />
    );

    const closeButton = screen.getByRole('button', { name: en.common.close });
    await expect.element(closeButton).toBeInTheDocument();

    await closeButton.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders modal semantics with focus inside dialog', async () => {
    const onClose = vi.fn<() => void>();
    const screen = await render(
      <SetsHistoryModal isOpen openToken={1} sets={sets} onClose={onClose} />
    );

    const dialog = screen.getByRole('dialog').element();
    const closeButton = screen.getByRole('button', { name: en.common.close }).element();

    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
    closeButton.focus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  test('resets auto-close timer when openToken changes while open', async () => {
    vi.useFakeTimers();

    const onClose = vi.fn<() => void>();
    const screen = await render(
      <SetsHistoryModal isOpen openToken={1} sets={sets} onClose={onClose} />
    );

    await expect.element(screen.getByTestId('sets-history-modal')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(29000);
    await screen.rerender(<SetsHistoryModal isOpen openToken={2} sets={sets} onClose={onClose} />);

    await vi.advanceTimersByTimeAsync(1500);
    expect(onClose).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(28500);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders localized empty state when no completed sets exist', async () => {
    const onClose = vi.fn<() => void>();
    const screen = await render(
      <SetsHistoryModal
        isOpen
        openToken={1}
        sets={[
          {
            index: 1,
            mode: 'standard',
            firstServer: 'team-1',
            completed: false,
            games: { 'team-1': 1, 'team-2': 1 },
            game: {
              kind: 'standard',
              points: { 'team-1': 0, 'team-2': 0 },
              advantageTeam: null
            }
          }
        ]}
        onClose={onClose}
      />
    );

    await expect
      .element(screen.getByTestId('sets-history-modal-empty-state'))
      .toHaveTextContent(en.match.sets.emptyHistory);
    await expect.element(screen.getByTestId('sets-history-modal-list')).not.toBeInTheDocument();
  });

  test('renders completed standard tiebreak winner points in history rows', async () => {
    const onClose = vi.fn<() => void>();
    const screen = await render(
      <SetsHistoryModal
        isOpen
        openToken={1}
        sets={[
          {
            index: 1,
            mode: 'standard',
            firstServer: 'team-1',
            completed: true,
            winner: 'team-1',
            games: { 'team-1': 7, 'team-2': 6 },
            tiebreakPoints: { 'team-1': 8, 'team-2': 6 }
          }
        ]}
        onClose={onClose}
      />
    );

    await expect
      .element(screen.getByTestId('sets-history-modal-list'))
      .toHaveTextContent('7(8) - 6(6)');
  });
});
