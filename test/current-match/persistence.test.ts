import { describe, expect, test } from 'vitest'

import { continueMatch, projectMatch } from '@/core/match'
import {
  createCurrentMatchRecord,
  currentMatchSchemaVersion,
  decodeCurrentMatchRecord,
  parseCurrentMatchRecord,
  replayCurrentMatchRecord
} from '@/lib/current-match'

import { createTestSetup, scorePoints, winQuickGame } from '../core/match/test-helpers'

describe('current match persistence helpers', () => {
  test('creates a versioned record from canonical setup and actions', () => {
    const setup = createTestSetup({
      decidingSetSuperTiebreak: true
    })
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2', 'team-2')]

    const record = createCurrentMatchRecord({ setup, actions })

    expect(record).toEqual({
      schemaVersion: currentMatchSchemaVersion,
      setup,
      actions,
      startedAt: expect.any(Number)
    })
  })

  test('normalizes best-of-1 setup input when building a persisted record', () => {
    const setup = createTestSetup({
      format: 'best-of-1',
      decidingSetSuperTiebreak: true,
      bestOfOneDecidingBehavior: 'super-tiebreak'
    })

    expect(createCurrentMatchRecord({ setup, actions: [] })).toEqual({
      schemaVersion: currentMatchSchemaVersion,
      setup,
      actions: [],
      startedAt: expect.any(Number)
    })
  })

  test('classifies same-version data as ok and replays through the pure match domain', () => {
    const setup = createTestSetup()
    const actions = [...winQuickGame('team-1'), ...scorePoints('team-2')]
    const record = createCurrentMatchRecord({ setup, actions })
    const decodedRecord = decodeCurrentMatchRecord(record)

    expect(decodedRecord).toEqual({
      status: 'ok',
      record
    })
    expect(replayCurrentMatchRecord(record)).toEqual(projectMatch(setup, actions))
  })

  test('preserves setCap null when an endless continued match is persisted and restored', () => {
    const setup = createTestSetup({
      format: 'best-of-1'
    })
    const actions = Array.from({ length: 6 }, () => winQuickGame('team-1')).flat()
    const continuedSetup = continueMatch(setup, projectMatch(setup, actions).state)
    const record = createCurrentMatchRecord({
      setup: continuedSetup,
      actions
    })
    const decodedRecord = parseCurrentMatchRecord(record)

    expect(record.setup.setCap).toBeNull()
    expect(decodedRecord.setup.setCap).toBeNull()
    expect(replayCurrentMatchRecord(decodedRecord).setup.setCap).toBeNull()
  })

  test('classifies incompatible schema versions as reset-required', () => {
    const setup = createTestSetup()

    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion + 1,
        setup,
        actions: []
      })
    ).toEqual({
      status: 'reset-required',
      reason: 'schema-version',
      storedSchemaVersion: 3
    })
    expect(() =>
      parseCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion + 1,
        setup,
        actions: []
      })
    ).toThrowError('Unsupported current match schema version: 3')
  })

  test('classifies malformed current-version payloads as corrupt', () => {
    const setup = createTestSetup()

    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        setup,
        actions: [{ type: 'score-point', teamId: 'team-3' }]
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Invalid current match action team: team-3'
    })
  })

  test('classifies invalid schema metadata as corrupt', () => {
    expect(
      decodeCurrentMatchRecord({
        schemaVersion: '1',
        setup: createTestSetup(),
        actions: []
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Invalid current match schema version: 1'
    })
  })

  test('throws the corruption message when parsing invalid current-version data', () => {
    expect(() =>
      parseCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        setup: createTestSetup(),
        actions: {
          type: 'score-point'
        }
      })
    ).toThrowError('Current match actions must be an array.')
  })

  test('classifies non-object payloads as corrupt', () => {
    expect(decodeCurrentMatchRecord('invalid payload')).toEqual({
      status: 'corrupt',
      message: 'Current match record must be an object.'
    })
  })

  test('rejects unsupported action types in current-version payloads', () => {
    expect(
      decodeCurrentMatchRecord({
        schemaVersion: currentMatchSchemaVersion,
        setup: createTestSetup(),
        actions: [{ type: 'pause-match', teamId: 'team-1' }]
      })
    ).toEqual({
      status: 'corrupt',
      message: 'Unsupported current match action type: pause-match'
    })
  })
})
