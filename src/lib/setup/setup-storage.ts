import {
  defaultAudioAnnouncementsEnabled,
  defaultCountdownTimerDuration,
  defaultCountdownTimerEnabled,
  defaultMatchFormat,
  defaultGameMode,
  defaultSuperTiebreakTargetPoints,
  defaultServingIndicatorEnabled,
  type CountdownTimerDuration,
  type MatchFormat,
  type MatchGameMode,
  type SuperTiebreakTargetPoints
} from '@/core/match/types';
import {
  isCountdownTimerDuration,
  isMatchFormat,
  isMatchGameMode,
  isSuperTiebreakTargetPoints
} from '@/core/match/guards';
import {
  defaultVerbosity,
  verbosityLevels,
  type SpeechPreferences,
  type VerbosityLevel
} from '@/lib/speech/types';

import {
  type IndexedDbStorageOptions,
  resolveIndexedDbStorageConfig,
  setupPreferenceObjectStoreName,
  speechPreferenceObjectStoreName,
  waitForIndexedDbRequest,
  waitForIndexedDbTransaction,
  withIndexedDbDatabase,
  type IndexedDbOpenMessages
} from '@/lib/persistence/indexed-db';

const defaultObjectStoreName = setupPreferenceObjectStoreName;
const setupPreferenceKey = 'setup-preference';
const legacySpeechPreferenceKey = 'speech-preference';

const indexedDbMessages: IndexedDbOpenMessages = {
  blocked: 'Opening the setup preference database was blocked.',
  openFailed: 'Unable to open the setup preference database.'
};

export interface SetupPreferences {
  muted: boolean;
  verbosity: VerbosityLevel;
  voiceName: string | null;
  team1Name: string | null;
  team2Name: string | null;
  audioAnnouncementsEnabled: boolean;
  servingIndicatorEnabled: boolean;
  countdownTimerEnabled: boolean;
  countdownTimerDuration: CountdownTimerDuration;
  autoOpenSetsHistoryModal?: boolean;
  sideSwitchPrompts: boolean;
  format: MatchFormat;
  gameMode: MatchGameMode;
  decidingSetSuperTiebreak: boolean;
  superTiebreakTargetPoints: SuperTiebreakTargetPoints;
}

export type SetupPreferenceSlice = Partial<SetupPreferences>;

interface StoredSetupPreferences extends SetupPreferences {
  updatedAt: string;
}

type StoredRecordStatus =
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'ok'; record: StoredSetupPreferences };

interface SetupStorage {
  saveSetupPreferences(preferences: SetupPreferences): Promise<void>;
  saveSetupPreferenceSlice(
    preferences: SetupPreferenceSlice,
    saveOptions?: { requireExistingRecord?: boolean; updatedAt?: string }
  ): Promise<void>;
  loadSetupPreferences(): Promise<SetupPreferences | null>;
  clearSetupPreferences(): Promise<void>;
  saveSpeechPreferences(preferences: SpeechPreferences): Promise<void>;
  loadSpeechPreferences(): Promise<SpeechPreferences | null>;
  clearSpeechPreferences(): Promise<void>;
}

export const defaultSetupPreferences: SetupPreferences = {
  muted: false,
  verbosity: defaultVerbosity,
  voiceName: null,
  team1Name: null,
  team2Name: null,
  audioAnnouncementsEnabled: defaultAudioAnnouncementsEnabled,
  servingIndicatorEnabled: defaultServingIndicatorEnabled,
  countdownTimerEnabled: defaultCountdownTimerEnabled,
  countdownTimerDuration: defaultCountdownTimerDuration,
  autoOpenSetsHistoryModal: true,
  sideSwitchPrompts: false,
  format: defaultMatchFormat,
  gameMode: defaultGameMode,
  decidingSetSuperTiebreak: false,
  superTiebreakTargetPoints: defaultSuperTiebreakTargetPoints
};

export function createSetupStorage(options: IndexedDbStorageOptions = {}): SetupStorage {
  const config = resolveIndexedDbStorageConfig(options, defaultObjectStoreName);

  const saveSetupPreferences = async (preferences: SetupPreferences): Promise<void> => {
    await writeSetupPreferencesRecord(config, createStoredSetupPreferences(preferences));
  };

  // Atomic read-modify-write within a single readwrite transaction so concurrent
  // slice saves cannot clobber each other's updates.
  const saveSetupPreferenceSlice = async (
    preferences: SetupPreferenceSlice,
    saveOptions?: { requireExistingRecord?: boolean; updatedAt?: string }
  ): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');
      const objectStore = transaction.objectStore(config.objectStoreName);

      const getRequest = objectStore.get(setupPreferenceKey);
      const storedRecord = await waitForIndexedDbRequest<StoredSetupPreferences | undefined>(
        getRequest
      );
      if (typeof storedRecord === 'undefined' && saveOptions?.requireExistingRecord) {
        await waitForIndexedDbTransaction(transaction);
        return;
      }

      const parsedStoredRecord =
        storedRecord != null ? parseStoredSetupPreferences(storedRecord) : null;

      const currentPreferences =
        parsedStoredRecord != null ? toSetupPreferences(parsedStoredRecord) : null;
      const nextPreferences = mergeSetupPreferences(currentPreferences, preferences);
      const storedNextPreferences = createStoredSetupPreferences(
        nextPreferences,
        saveOptions?.updatedAt
      );

      objectStore.put(storedNextPreferences, setupPreferenceKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  const loadSetupPreferences = async (): Promise<SetupPreferences | null> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const storedRecord = await loadOrMigrateStoredRecord(database, config.objectStoreName);

      if (!storedRecord) {
        return null;
      }

      return toSetupPreferences(storedRecord);
    });
  };

  const clearSetupPreferences = async (): Promise<void> => {
    await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const transaction = database.transaction(config.objectStoreName, 'readwrite');

      transaction.objectStore(config.objectStoreName).delete(setupPreferenceKey);
      await waitForIndexedDbTransaction(transaction);
    });
  };

  const saveSpeechPreferences = async (preferences: SpeechPreferences): Promise<void> => {
    await saveSetupPreferenceSlice(
      {
        muted: preferences.muted,
        verbosity: preferences.verbosity,
        voiceName: preferences.voiceName
      },
      { updatedAt: preferences.updatedAt }
    );
  };

  const loadSpeechPreferences = async (): Promise<SpeechPreferences | null> => {
    return withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
      const storedRecord = await loadOrMigrateStoredRecord(database, config.objectStoreName);

      if (!storedRecord) {
        return null;
      }

      return toSpeechPreferences(storedRecord);
    });
  };

  const clearSpeechPreferences = async (): Promise<void> => {
    await saveSetupPreferenceSlice(
      {
        muted: defaultSetupPreferences.muted,
        verbosity: defaultSetupPreferences.verbosity,
        voiceName: null
      },
      { requireExistingRecord: true, updatedAt: new Date().toISOString() }
    );
  };

  return {
    saveSetupPreferences,
    saveSetupPreferenceSlice,
    loadSetupPreferences,
    clearSetupPreferences,
    saveSpeechPreferences,
    loadSpeechPreferences,
    clearSpeechPreferences
  };
}

function mergeSetupPreferences(
  currentPreferences: SetupPreferences | null,
  nextPreferences: SetupPreferenceSlice
): SetupPreferences {
  return {
    ...(currentPreferences ?? defaultSetupPreferences),
    ...nextPreferences,
    voiceName:
      // voiceName is updated whenever the caller includes the property; explicit null
      // clears the stored value, while an omitted property means "no change".
      'voiceName' in nextPreferences
        ? nextPreferences.voiceName
        : (currentPreferences?.voiceName ?? defaultSetupPreferences.voiceName),
    team1Name:
      'team1Name' in nextPreferences
        ? nextPreferences.team1Name
        : (currentPreferences?.team1Name ?? defaultSetupPreferences.team1Name),
    team2Name:
      'team2Name' in nextPreferences
        ? nextPreferences.team2Name
        : (currentPreferences?.team2Name ?? defaultSetupPreferences.team2Name)
  };
}

function createStoredSetupPreferences(
  preferences: SetupPreferences,
  updatedAt = new Date().toISOString()
): StoredSetupPreferences {
  return {
    ...preferences,
    updatedAt
  };
}

function toSetupPreferences(record: StoredSetupPreferences): SetupPreferences {
  return {
    muted: record.muted,
    verbosity: record.verbosity,
    voiceName: record.voiceName,
    team1Name: record.team1Name,
    team2Name: record.team2Name,
    audioAnnouncementsEnabled: record.audioAnnouncementsEnabled,
    servingIndicatorEnabled: record.servingIndicatorEnabled,
    countdownTimerEnabled: record.countdownTimerEnabled,
    countdownTimerDuration: record.countdownTimerDuration,
    autoOpenSetsHistoryModal:
      typeof record.autoOpenSetsHistoryModal === 'boolean' ? record.autoOpenSetsHistoryModal : true,
    sideSwitchPrompts: record.sideSwitchPrompts,
    format: record.format,
    gameMode: record.gameMode,
    decidingSetSuperTiebreak: record.decidingSetSuperTiebreak,
    superTiebreakTargetPoints: record.superTiebreakTargetPoints
  };
}

function toSpeechPreferences(record: StoredSetupPreferences): SpeechPreferences {
  return {
    muted: record.muted,
    verbosity: record.verbosity,
    voiceName: record.voiceName,
    updatedAt: record.updatedAt
  };
}

async function writeSetupPreferencesRecord(
  config: ReturnType<typeof resolveIndexedDbStorageConfig>,
  record: StoredSetupPreferences
): Promise<void> {
  await withIndexedDbDatabase(config, indexedDbMessages, async (database) => {
    const transaction = database.transaction(config.objectStoreName, 'readwrite');

    transaction.objectStore(config.objectStoreName).put(record, setupPreferenceKey);
    await waitForIndexedDbTransaction(transaction);
  });
}

async function loadOrMigrateStoredRecord(
  database: IDBDatabase,
  objectStoreName: string
): Promise<StoredSetupPreferences | null> {
  const currentRecordResult = await readStoredSetupPreferencesRecord(database, objectStoreName);

  if (currentRecordResult.status === 'ok') {
    return currentRecordResult.record;
  }

  if (currentRecordResult.status === 'invalid') {
    return null;
  }

  const legacyRecordResult = await readLegacySpeechPreferencesRecord(database);

  if (legacyRecordResult.status !== 'ok') {
    return null;
  }

  const migratedPreferences = mergeSetupPreferences(null, {
    muted: legacyRecordResult.record.muted,
    verbosity: legacyRecordResult.record.verbosity,
    voiceName: legacyRecordResult.record.voiceName
  });
  const migratedRecord = createStoredSetupPreferences(migratedPreferences);

  // Intentionally keep the legacy speech record after migration. The unified
  // setup-preference record already wins on subsequent loads, so retaining the
  // legacy source avoids making the one-time migration irrecoverable.
  await writeStoredSetupPreferencesRecord(database, objectStoreName, migratedRecord);

  return migratedRecord;
}

async function writeStoredSetupPreferencesRecord(
  database: IDBDatabase,
  objectStoreName: string,
  record: StoredSetupPreferences
): Promise<void> {
  const transaction = database.transaction(objectStoreName, 'readwrite');

  transaction.objectStore(objectStoreName).put(record, setupPreferenceKey);

  await waitForIndexedDbTransaction(transaction);
}

async function readStoredSetupPreferencesRecord(
  database: IDBDatabase,
  objectStoreName: string
): Promise<StoredRecordStatus> {
  const transaction = database.transaction(objectStoreName, 'readonly');
  const request = transaction.objectStore(objectStoreName).get(setupPreferenceKey);
  const storedRecord = await waitForIndexedDbRequest<StoredSetupPreferences | undefined>(request);

  await waitForIndexedDbTransaction(transaction);

  if (typeof storedRecord === 'undefined') {
    return { status: 'missing' };
  }

  const parsedRecord = parseStoredSetupPreferences(storedRecord);

  if (!parsedRecord) {
    return { status: 'invalid' };
  }

  return {
    status: 'ok',
    record: parsedRecord
  };
}

async function readLegacySpeechPreferencesRecord(
  database: IDBDatabase
): Promise<StoredRecordStatus> {
  if (!database.objectStoreNames.contains(speechPreferenceObjectStoreName)) {
    return { status: 'missing' };
  }

  const transaction = database.transaction(speechPreferenceObjectStoreName, 'readonly');
  const request = transaction
    .objectStore(speechPreferenceObjectStoreName)
    .get(legacySpeechPreferenceKey);
  const storedRecord = await waitForIndexedDbRequest<SpeechPreferences | undefined>(request);

  await waitForIndexedDbTransaction(transaction);

  if (typeof storedRecord === 'undefined') {
    return { status: 'missing' };
  }

  const parsedRecord = parseStoredSpeechPreferences(storedRecord);

  if (!parsedRecord) {
    return { status: 'invalid' };
  }

  return {
    status: 'ok',
    record: {
      ...defaultSetupPreferences,
      muted: parsedRecord.muted,
      verbosity: parsedRecord.verbosity,
      voiceName: parsedRecord.voiceName ?? null,
      updatedAt: parsedRecord.updatedAt
    }
  };
}

function parseStoredSetupPreferences(value: unknown): StoredSetupPreferences | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<StoredSetupPreferences>;

  if (typeof candidate.updatedAt !== 'string') {
    return null;
  }

  if (typeof candidate.muted !== 'boolean') {
    return null;
  }

  if (!isVerbosityLevel(candidate.verbosity)) {
    return null;
  }

  if (typeof candidate.voiceName !== 'string' && candidate.voiceName !== null) {
    return null;
  }

  if (typeof candidate.team1Name !== 'string' && candidate.team1Name !== null) {
    return null;
  }

  if (typeof candidate.team2Name !== 'string' && candidate.team2Name !== null) {
    return null;
  }

  if (typeof candidate.audioAnnouncementsEnabled !== 'boolean') {
    return null;
  }

  if (typeof candidate.servingIndicatorEnabled !== 'boolean') {
    return null;
  }

  if (typeof candidate.countdownTimerEnabled !== 'boolean') {
    return null;
  }

  if (!isCountdownTimerDuration(candidate.countdownTimerDuration)) {
    return null;
  }

  if (typeof candidate.sideSwitchPrompts !== 'boolean') {
    return null;
  }

  const autoOpenSetsHistoryModal =
    typeof candidate.autoOpenSetsHistoryModal === 'boolean'
      ? candidate.autoOpenSetsHistoryModal
      : true;

  if (!isMatchGameMode(candidate.gameMode)) {
    return null;
  }

  const format =
    typeof candidate.format === 'undefined'
      ? defaultMatchFormat
      : isMatchFormat(candidate.format)
        ? candidate.format
        : null;

  if (format === null) {
    return null;
  }

  if (typeof candidate.decidingSetSuperTiebreak !== 'boolean') {
    return null;
  }

  const superTiebreakTargetPoints =
    typeof candidate.superTiebreakTargetPoints === 'undefined'
      ? defaultSuperTiebreakTargetPoints
      : isSuperTiebreakTargetPoints(candidate.superTiebreakTargetPoints)
        ? candidate.superTiebreakTargetPoints
        : null;

  if (superTiebreakTargetPoints === null) {
    return null;
  }

  return {
    muted: candidate.muted,
    verbosity: candidate.verbosity,
    voiceName: candidate.voiceName,
    team1Name: candidate.team1Name,
    team2Name: candidate.team2Name,
    audioAnnouncementsEnabled: candidate.audioAnnouncementsEnabled,
    servingIndicatorEnabled: candidate.servingIndicatorEnabled,
    countdownTimerEnabled: candidate.countdownTimerEnabled,
    countdownTimerDuration: candidate.countdownTimerDuration,
    autoOpenSetsHistoryModal,
    sideSwitchPrompts: candidate.sideSwitchPrompts,
    format,
    gameMode: candidate.gameMode,
    decidingSetSuperTiebreak: candidate.decidingSetSuperTiebreak,
    superTiebreakTargetPoints,
    updatedAt: candidate.updatedAt
  };
}

function parseStoredSpeechPreferences(value: unknown): SpeechPreferences | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<SpeechPreferences>;

  if (typeof candidate.updatedAt !== 'string') {
    return null;
  }

  if (typeof candidate.muted !== 'boolean') {
    return null;
  }

  if (!isVerbosityLevel(candidate.verbosity)) {
    return null;
  }

  if (
    typeof candidate.voiceName !== 'string' &&
    candidate.voiceName !== null &&
    typeof candidate.voiceName !== 'undefined'
  ) {
    return null;
  }

  return {
    muted: candidate.muted,
    verbosity: candidate.verbosity,
    voiceName: candidate.voiceName ?? null,
    updatedAt: candidate.updatedAt
  };
}

function isVerbosityLevel(value: unknown): value is VerbosityLevel {
  return typeof value === 'string' && verbosityLevels.some((level) => level === value);
}

const setupStorage = createSetupStorage();
export const saveSetupPreferenceSlice = (preferences: SetupPreferenceSlice) =>
  setupStorage.saveSetupPreferenceSlice(preferences);
export const loadSetupPreferences = () => setupStorage.loadSetupPreferences();
export const saveSpeechPreferences = (preferences: SpeechPreferences) =>
  setupStorage.saveSpeechPreferences(preferences);
export const loadSpeechPreferences = () => setupStorage.loadSpeechPreferences();
