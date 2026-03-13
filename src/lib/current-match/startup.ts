import { currentMatchPersistence, type CurrentMatchPersistence } from './indexed-db'
import { consumeCurrentMatchResetNotice, type CurrentMatchResetNotice } from './reset-notice'
import { createCurrentMatchSession, type CurrentMatchSession } from './session'

export interface CurrentMatchStartupOptions {
  persistence?: CurrentMatchPersistence
}

export interface CurrentMatchStartupReadyResult {
  status: 'ready'
  notice: CurrentMatchResetNotice | null
  session: CurrentMatchSession | null
}

export interface CurrentMatchStartupResumeRequiredResult {
  status: 'resume-required'
  notice: CurrentMatchResetNotice | null
  session: CurrentMatchSession
}

export interface CurrentMatchStartupCorruptResult {
  status: 'corrupt'
  notice: CurrentMatchResetNotice | null
  message: string
}

export type CurrentMatchStartupResult =
  | CurrentMatchStartupReadyResult
  | CurrentMatchStartupResumeRequiredResult
  | CurrentMatchStartupCorruptResult

export async function hydrateCurrentMatchStartup(
  options: CurrentMatchStartupOptions = {}
): Promise<CurrentMatchStartupResult> {
  const persistence = options.persistence ?? currentMatchPersistence
  const loadResult = await persistence.loadCurrentMatch()
  const notice = consumeCurrentMatchResetNotice()

  if (loadResult.status === 'empty' || loadResult.status === 'reset-required') {
    return {
      status: 'ready',
      notice,
      session: null
    }
  }

  if (loadResult.status === 'corrupt') {
    return {
      status: 'corrupt',
      notice,
      message: loadResult.message
    }
  }

  const session = createCurrentMatchSession({
    setup: loadResult.record.setup,
    actions: loadResult.record.actions,
    persistence
  })

  if (session.getSnapshot().projection.derived.status === 'in-progress') {
    return {
      status: 'resume-required',
      notice,
      session
    }
  }

  return {
    status: 'ready',
    notice,
    session
  }
}
