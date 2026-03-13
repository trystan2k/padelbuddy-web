import { describe, expect, test, vi } from 'vitest'

import {
  clearCurrentMatchStartup,
  dismissCurrentMatchStartupNotice,
  resumeCurrentMatchStartup,
  type CurrentMatchStartupViewState
} from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'
import type { CurrentMatchSession } from '@/lib/current-match'

describe('current match startup gate state helpers', () => {
  test('keeps the loading state unchanged when dismissing notice early', () => {
    const state: CurrentMatchStartupViewState = {
      status: 'loading'
    }

    expect(dismissCurrentMatchStartupNotice(state)).toBe(state)
  })

  test('clears a startup notice without changing the resolved state', () => {
    const session = createSessionStub()

    expect(
      dismissCurrentMatchStartupNotice({
        status: 'ready',
        notice: {
          reason: 'schema-version'
        },
        session
      })
    ).toEqual({
      status: 'ready',
      notice: null,
      session
    })
  })

  test('keeps non-resume states unchanged when resuming is not applicable', () => {
    const state: CurrentMatchStartupViewState = {
      status: 'ready',
      notice: null,
      session: null
    }

    expect(resumeCurrentMatchStartup(state)).toBe(state)
  })

  test('converts resume-required state into ready while keeping the session', () => {
    const session = createSessionStub()

    expect(
      resumeCurrentMatchStartup({
        status: 'resume-required',
        notice: {
          reason: 'schema-version'
        },
        session
      })
    ).toEqual({
      status: 'ready',
      notice: {
        reason: 'schema-version'
      },
      session
    })
  })

  test('clears startup state to ready from loading without preserving a notice', () => {
    expect(
      clearCurrentMatchStartup({
        status: 'loading'
      })
    ).toEqual({
      status: 'ready',
      notice: null,
      session: null
    })
  })

  test('clears startup state to ready while preserving any existing notice', () => {
    expect(
      clearCurrentMatchStartup({
        status: 'corrupt',
        notice: {
          reason: 'schema-version'
        },
        message: 'Current match payload is corrupt.'
      })
    ).toEqual({
      status: 'ready',
      notice: {
        reason: 'schema-version'
      },
      session: null
    })
  })
})

function createSessionStub(): CurrentMatchSession {
  return {
    getSnapshot: vi.fn(),
    scorePoint: vi.fn(),
    undoScoreAction: vi.fn(),
    continuePlaying: vi.fn()
  }
}
