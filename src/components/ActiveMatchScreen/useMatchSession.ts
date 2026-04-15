import { useState, useCallback } from 'react';

import {
  createCurrentMatchSession,
  type CurrentMatchSessionSnapshot
} from '@/lib/current-match/session';
import type { CurrentMatchPersistence } from '@/lib/current-match/indexed-db';
import type { MatchAction, MatchSetup, MatchTeamId } from '@/core/match/types';

interface UseMatchSessionOptions {
  matchId: string;
  setup: MatchSetup;
  initialActions: MatchAction[];
  startedAt: number;
  initialFinishedAt?: number;
  persistence?: CurrentMatchPersistence;
  onHistorySaveFailure?: (err: unknown) => void;
}

interface UseMatchSessionReturn {
  snapshot: CurrentMatchSessionSnapshot;
  scorePoint: (teamId: MatchTeamId) => Promise<void>;
  undoScoreAction: () => Promise<void>;
  undoScoreActionForTeam: (teamId: MatchTeamId) => Promise<void>;
  finishMatch: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook that wraps CurrentMatchSession with React state management.
 * Provides reactive snapshot updates and async operation handling.
 */
export function useMatchSession(options: UseMatchSessionOptions): UseMatchSessionReturn {
  const {
    matchId,
    setup,
    initialActions,
    startedAt,
    initialFinishedAt,
    persistence,
    onHistorySaveFailure
  } = options;

  const [session] = useState(() => {
    const sessionOptions = {
      matchId,
      setup,
      actions: initialActions,
      startedAt,
      ...(onHistorySaveFailure ? { onHistorySaveFailure } : {}),
      ...(typeof initialFinishedAt === 'number' ? { finishedAt: initialFinishedAt } : {})
    } as const;

    return persistence
      ? createCurrentMatchSession({ ...sessionOptions, persistence })
      : createCurrentMatchSession(sessionOptions);
  });

  const [snapshot, setSnapshot] = useState<CurrentMatchSessionSnapshot>(() =>
    session.getSnapshot()
  );
  const [isLoading, setIsLoading] = useState(false);

  const scorePoint = useCallback(
    async (teamId: MatchTeamId) => {
      setIsLoading(true);
      try {
        const newSnapshot = await session.scorePoint(teamId);
        setSnapshot(newSnapshot);
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const undoScoreAction = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSnapshot = await session.undoScoreAction();
      setSnapshot(newSnapshot);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const undoScoreActionForTeam = useCallback(
    async (teamId: MatchTeamId) => {
      setIsLoading(true);
      try {
        const newSnapshot = await session.undoScoreActionForTeam(teamId);
        setSnapshot(newSnapshot);
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const finishMatch = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSnapshot = await session.finishMatch();
      setSnapshot(newSnapshot);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  return {
    snapshot,
    scorePoint,
    undoScoreAction,
    undoScoreActionForTeam,
    finishMatch,
    isLoading
  };
}
