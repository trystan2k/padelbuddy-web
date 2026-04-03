import { describe, expect, test } from 'vitest'

import { currentMatchSchemaVersion } from '@/lib/current-match/persistence'
import { parseMatchRouteErrorType, resolveMatchRouteState } from '@/routes/-match-route-state'

import { createTestSetup, winQuickSet } from '../core/match/test-helpers'

describe('match route entry state', () => {
  const setup = createTestSetup()

  test('returns ready for an in-progress active match', () => {
    const routeState = resolveMatchRouteState(
      'active-match',
      {
        status: 'ok',
        record: {
          schemaVersion: currentMatchSchemaVersion,
          matchId: 'active-match',
          setup,
          actions: [],
          startedAt: 1_000
        }
      },
      'active'
    )

    expect(routeState).toMatchObject({
      status: 'ready',
      record: {
        matchId: 'active-match'
      }
    })
  })

  test('returns ready for a completed finish match', () => {
    const routeState = resolveMatchRouteState(
      'finished-match',
      {
        status: 'ok',
        record: {
          schemaVersion: currentMatchSchemaVersion,
          matchId: 'finished-match',
          setup,
          actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
          startedAt: 1_000
        }
      },
      'finish'
    )

    expect(routeState).toMatchObject({
      status: 'ready',
      record: {
        matchId: 'finished-match'
      },
      projection: {
        derived: {
          status: 'completed'
        }
      }
    })
  })

  test('redirects empty state home with no-match error', () => {
    expect(resolveMatchRouteState('missing-match', { status: 'empty' }, 'active')).toEqual({
      status: 'redirect-home',
      error: 'no-match'
    })
  })

  test('redirects reset-required state home with no-match error', () => {
    expect(
      resolveMatchRouteState(
        'reset-match',
        {
          status: 'reset-required',
          reason: 'schema-version',
          storedSchemaVersion: currentMatchSchemaVersion - 1
        },
        'finish'
      )
    ).toEqual({
      status: 'redirect-home',
      error: 'no-match'
    })
  })

  test('redirects corrupt state home with corrupt error', () => {
    expect(
      resolveMatchRouteState(
        'corrupt-match',
        {
          status: 'corrupt',
          message: 'bad record'
        },
        'active'
      )
    ).toEqual({
      status: 'redirect-home',
      error: 'corrupt'
    })
  })

  test('redirects mismatched route ids home with invalid-match error', () => {
    expect(
      resolveMatchRouteState(
        'route-id',
        {
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'persisted-id',
            setup,
            actions: [],
            startedAt: 1_000
          }
        },
        'active'
      )
    ).toEqual({
      status: 'redirect-home',
      error: 'invalid-match'
    })
  })

  test('redirects completed active entries to the finish route', () => {
    expect(
      resolveMatchRouteState(
        'completed-match',
        {
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'completed-match',
            setup,
            actions: [...winQuickSet('team-1'), ...winQuickSet('team-1')],
            startedAt: 1_000
          }
        },
        'active'
      )
    ).toEqual({
      status: 'redirect-finish',
      matchId: 'completed-match'
    })
  })

  test('redirects in-progress finish entries to the active route', () => {
    expect(
      resolveMatchRouteState(
        'active-match',
        {
          status: 'ok',
          record: {
            schemaVersion: currentMatchSchemaVersion,
            matchId: 'active-match',
            setup,
            actions: [],
            startedAt: 1_000
          }
        },
        'finish'
      )
    ).toEqual({
      status: 'redirect-active',
      matchId: 'active-match'
    })
  })

  test('keeps manually finished matches on the finish route', () => {
    const routeState = resolveMatchRouteState(
      'manual-finish',
      {
        status: 'ok',
        record: {
          schemaVersion: currentMatchSchemaVersion,
          matchId: 'manual-finish',
          setup,
          actions: [],
          startedAt: 1_000,
          finishedAt: 2_000
        }
      },
      'finish'
    )

    expect(routeState).toMatchObject({
      status: 'ready',
      record: {
        matchId: 'manual-finish',
        finishedAt: 2_000
      }
    })
  })
})

describe('parseMatchRouteErrorType', () => {
  test('accepts supported home error values only', () => {
    expect(parseMatchRouteErrorType('invalid-match')).toBe('invalid-match')
    expect(parseMatchRouteErrorType('no-match')).toBe('no-match')
    expect(parseMatchRouteErrorType('corrupt')).toBe('corrupt')
    expect(parseMatchRouteErrorType('other')).toBeUndefined()
    expect(parseMatchRouteErrorType(undefined)).toBeUndefined()
  })
})
