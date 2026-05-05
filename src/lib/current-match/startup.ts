import { currentMatchPersistence, type CurrentMatchPersistence } from './indexed-db';
import type { CurrentMatchResetNotice } from './reset-notice';
import currentMatchResetNoticeStore from './reset-notice-store';
import { createCurrentMatchSessionSnapshot, type CurrentMatchSessionSnapshot } from './session';

export interface CurrentMatchStartupOptions {
  persistence?: CurrentMatchPersistence;
}

interface CurrentMatchStartupMatch {
  matchId: string;
  snapshot: CurrentMatchSessionSnapshot;
}

interface CurrentMatchStartupNoMatchResult {
  status: 'no-match';
  notice: CurrentMatchResetNotice | null;
}

interface CurrentMatchStartupReadyResult {
  status: 'ready';
  notice: CurrentMatchResetNotice | null;
  match: CurrentMatchStartupMatch;
}

interface CurrentMatchStartupResumeRequiredResult {
  status: 'resume-required';
  notice: CurrentMatchResetNotice | null;
  match: CurrentMatchStartupMatch;
}

interface CurrentMatchStartupCorruptResult {
  status: 'corrupt';
  notice: CurrentMatchResetNotice | null;
  message: string;
}

export type CurrentMatchStartupResult =
  | CurrentMatchStartupNoMatchResult
  | CurrentMatchStartupReadyResult
  | CurrentMatchStartupResumeRequiredResult
  | CurrentMatchStartupCorruptResult;

export async function hydrateCurrentMatchStartup(
  options: CurrentMatchStartupOptions = {}
): Promise<CurrentMatchStartupResult> {
  const persistence = options.persistence ?? currentMatchPersistence;
  const loadResult = await persistence.loadCurrentMatch();
  const notice = currentMatchResetNoticeStore.clear();

  if (loadResult.status === 'empty' || loadResult.status === 'reset-required') {
    return {
      status: 'no-match',
      notice
    };
  }

  if (loadResult.status === 'corrupt') {
    return {
      status: 'corrupt',
      notice,
      message: loadResult.message
    };
  }

  const match = {
    matchId: loadResult.record.matchId,
    snapshot: createCurrentMatchSessionSnapshot({
      setup: loadResult.record.setup,
      actions: loadResult.record.actions,
      startedAt: loadResult.record.startedAt,
      ...(typeof loadResult.record.finishedAt === 'number'
        ? { finishedAt: loadResult.record.finishedAt }
        : {})
    })
  };

  if (match.snapshot.projection.derived.status === 'in-progress') {
    return {
      status: 'resume-required',
      notice,
      match
    };
  }

  return {
    status: 'ready',
    notice,
    match
  };
}
