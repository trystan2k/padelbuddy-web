import { describe, expect, test } from 'vitest'

import {
  clearCurrentMatchStartup,
  dismissCurrentMatchStartupNotice,
  resumeCurrentMatchStartup
} from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'
import { createCurrentMatchSessionSnapshot } from '@/lib/current-match'

import { createTestSetup, scorePoints } from '../core/match/test-helpers'

describe('current match startup gate state helpers', () => {
  test('clears a startup notice without changing a no-match state', () => {
    expect(
      dismissCurrentMatchStartupNotice({
        status: 'no-match',
        notice: {
          reason: 'schema-version'
        }
      })
    ).toEqual({
      status: 'no-match',
      notice: null
    })
  })

  test('keeps non-resume states unchanged when resuming is not applicable', () => {
    const state = {
      status: 'ready' as const,
      notice: null,
      match: createStartupMatch()
    }

    expect(resumeCurrentMatchStartup(state)).toBe(state)
  })

  test('converts resume-required state into ready while keeping the match data', () => {
    const match = createStartupMatch()

    expect(
      resumeCurrentMatchStartup({
        status: 'resume-required',
        notice: {
          reason: 'schema-version'
        },
        match
      })
    ).toEqual({
      status: 'ready',
      notice: {
        reason: 'schema-version'
      },
      match
    })
  })

  test('clears startup state to no-match while preserving any existing notice', () => {
    expect(
      clearCurrentMatchStartup({
        status: 'corrupt',
        notice: {
          reason: 'schema-version'
        },
        message: 'Current match payload is corrupt.'
      })
    ).toEqual({
      status: 'no-match',
      notice: {
        reason: 'schema-version'
      }
    })
  })
})

function createStartupMatch() {
  return {
    matchId: 'test-match',
    snapshot: createCurrentMatchSessionSnapshot({
      setup: createTestSetup(),
      actions: scorePoints('team-1'),
      startedAt: Date.now()
    })
  }
}
