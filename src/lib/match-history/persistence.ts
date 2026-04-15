import {
  createCurrentMatchRecord,
  decodeCurrentMatchRecord,
  type CurrentMatchRecord,
  type CurrentMatchSaveInput
} from '@/lib/current-match/persistence';

export interface MatchHistorySaveInput extends CurrentMatchSaveInput {
  matchId: string;
  finishedAt: number;
}

export interface MatchHistoryRecord extends CurrentMatchRecord {
  finishedAt: number;
}

export function createMatchHistoryRecord(input: MatchHistorySaveInput): MatchHistoryRecord {
  const record = createCurrentMatchRecord(input);

  return ensureFinishedMatchRecord(record, 'Match history record must include a finishedAt value.');
}

export function parseMatchHistoryRecord(input: unknown): MatchHistoryRecord {
  const decoded = decodeCurrentMatchRecord(input);

  if (decoded.status !== 'ok') {
    throw new Error(
      decoded.status === 'reset-required'
        ? `Unsupported match history schema version: ${decoded.storedSchemaVersion}`
        : decoded.message
    );
  }

  return ensureFinishedMatchRecord(
    decoded.record,
    'Corrupt match history record: finishedAt must be present.'
  );
}

function ensureFinishedMatchRecord(
  record: CurrentMatchRecord,
  message: string
): MatchHistoryRecord {
  if (typeof record.finishedAt !== 'number') {
    throw new Error(message);
  }

  return {
    ...record,
    finishedAt: record.finishedAt
  };
}
