import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-react';

import { HistoryScreen } from '@/components/HistoryScreen/HistoryScreen';
import { ToastProvider, globalToastManager } from '@/components/ui/Toast/useToast';
import { createMatchHistoryRecord } from '@/lib/match-history/persistence';

import {
  createTestSetup,
  reachSixAll,
  repeatAction,
  scorePoints,
  winQuickSet
} from '../../core/match/test-helpers';

const {
  mockNavigate,
  mockDeleteMatchHistory,
  mockAddToast,
  mockAddErrorToast,
  mockAddSuccessToast,
  mockAddInfoToast
} = vi.hoisted(() => ({
  mockNavigate: vi.fn<(options: object) => void>(),
  mockDeleteMatchHistory: vi.fn<(matchId: string) => Promise<void>>().mockResolvedValue(undefined),
  mockAddToast: vi.fn<(title: string, options?: object) => void>(),
  mockAddErrorToast: vi.fn<(title: string, options?: object) => void>(),
  mockAddSuccessToast: vi.fn<(title: string, options?: object) => void>(),
  mockAddInfoToast: vi.fn<(title: string, options?: object) => void>()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/lib/match-history/indexed-db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/match-history/indexed-db')>();

  return {
    ...actual,
    deleteMatchHistory: mockDeleteMatchHistory
  };
});

vi.mock('@/components/ui/Toast/useToast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui/Toast/useToast')>();

  return {
    ...actual,
    useToast: () => ({
      toastManager: actual.globalToastManager,
      addToast: mockAddToast,
      addErrorToast: mockAddErrorToast,
      addSuccessToast: mockAddSuccessToast,
      addInfoToast: mockAddInfoToast
    })
  };
});

describe('HistoryScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    globalToastManager.close();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await cleanup();
  });

  test('renders saved matches in table with team names, scores and actions', async () => {
    const records = [
      createHistoryRecord('history-1', Date.now() - 5000, ['Ana', 'Bea'], ['Carla', 'Dani']),
      createHistoryRecord('history-2', Date.now() - 1000, ['Lucho'], ['Thiago'])
    ];
    const screen = await render(<HistoryScreen initialRecords={records} />);

    await expect.element(screen.getByText('Match History')).toBeInTheDocument();
    await expect.element(screen.getByText('2 matches')).toBeInTheDocument();

    // Team names are displayed vertically stacked (not with "vs")
    await expect.element(screen.getByText('Ana & Bea')).toBeInTheDocument();
    await expect.element(screen.getByText('Carla & Dani')).toBeInTheDocument();
    await expect.element(screen.getByText('Lucho')).toBeInTheDocument();
    await expect.element(screen.getByText('Thiago')).toBeInTheDocument();

    // Table structure exists
    await expect.element(screen.getByRole('table')).toBeInTheDocument();

    // Column headers
    await expect.element(screen.getByText('Teams')).toBeInTheDocument();
    await expect.element(screen.getByText('Date')).toBeInTheDocument();
    await expect.element(screen.getByText('Sets')).toBeInTheDocument();
    await expect.element(screen.getByText('Games')).toBeInTheDocument();
    await expect.element(screen.getByText('Actions')).toBeInTheDocument();

    // Action buttons exist (Share and Delete)
    await expect.element(screen.getByTestId('history-share-history-1')).toBeInTheDocument();
    await expect.element(screen.getByTestId('history-delete-history-1')).toBeInTheDocument();
    await expect.element(screen.getByTestId('history-share-history-2')).toBeInTheDocument();
    await expect.element(screen.getByTestId('history-delete-history-2')).toBeInTheDocument();
  });

  test('Delete button removes match when user confirms', async () => {
    const records = [
      createHistoryRecord('history-1', Date.now() - 5000, ['Ana', 'Bea'], ['Carla', 'Dani'])
    ];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const screen = await render(<HistoryScreen initialRecords={records} />);

    await screen.getByTestId('history-delete-history-1').click();

    await vi.waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Delete this match from history?');
      expect(mockDeleteMatchHistory).toHaveBeenCalledWith('history-1');
      expect(mockAddSuccessToast).toHaveBeenCalledWith('Match removed from history');
    });

    await expect.element(screen.getByText('No finished matches yet.')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('Delete button does not remove match when user cancels', async () => {
    const records = [
      createHistoryRecord('history-1', Date.now() - 5000, ['Ana', 'Bea'], ['Carla', 'Dani'])
    ];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const screen = await render(<HistoryScreen initialRecords={records} />);

    await screen.getByTestId('history-delete-history-1').click();

    await vi.waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Delete this match from history?');
    });

    expect(mockDeleteMatchHistory).not.toHaveBeenCalled();
    expect(mockAddSuccessToast).not.toHaveBeenCalled();
    await expect.element(screen.getByTestId('history-delete-history-1')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('Share button triggers success toast when Web Share is unavailable', async () => {
    const records = [
      createHistoryRecord('history-1', Date.now() - 5000, ['Ana', 'Bea'], ['Carla', 'Dani'])
    ];
    const screen = await render(
      <ToastProvider>
        <HistoryScreen initialRecords={records} />
      </ToastProvider>
    );

    await screen.getByTestId('history-share-history-1').click();

    await vi.waitFor(() => {
      expect(mockAddSuccessToast).toHaveBeenCalledWith('Match summary copied to clipboard.', {
        timeout: 5000
      });
    });
  });

  test('shows empty state and footer back action', async () => {
    const screen = await render(<HistoryScreen initialRecords={[]} />);

    await expect.element(screen.getByText('No finished matches yet.')).toBeInTheDocument();

    await screen.getByRole('button', { name: /^back$/i }).click();

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  test('renders completed standard tiebreak winner points in games column', async () => {
    const finishedAt = Date.now();
    const record = createMatchHistoryRecord({
      matchId: 'history-tiebreak',
      setup: createTestSetup(),
      actions: [
        ...reachSixAll(),
        ...repeatAction('team-1', 7),
        ...repeatAction('team-2', 6),
        ...scorePoints('team-1')
      ],
      startedAt: finishedAt - 120_000,
      finishedAt
    });

    const screen = await render(<HistoryScreen initialRecords={[record]} />);

    const gamesCell = screen.getByTestId('history-games-history-tiebreak');

    await expect.element(gamesCell).toHaveTextContent(/7\s*\(7\)\s*-\s*6\s*\(0\)/);
    await expect.element(gamesCell).toHaveTextContent('(7)');
    await expect.element(gamesCell).toHaveTextContent('(0)');
  });
});

function createHistoryRecord(
  matchId: string,
  finishedAt: number,
  team1Players: string[],
  team2Players: string[]
) {
  return createMatchHistoryRecord({
    matchId,
    setup: createTestSetup({
      sides: [
        {
          id: 'team-1',
          playerNames: team1Players
        },
        {
          id: 'team-2',
          playerNames: team2Players
        }
      ]
    }),
    actions: winQuickSet('team-1'),
    startedAt: finishedAt - 120_000,
    finishedAt
  });
}
