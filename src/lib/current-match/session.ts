import {
  continueMatch,
  projectMatch,
  undoLastScoringAction,
  type MatchAction,
  type MatchProjection,
  type MatchSetup,
  type MatchTeamId
} from '@/core/match'

import { currentMatchPersistence, type CurrentMatchPersistence } from './indexed-db'

export interface CurrentMatchSessionInput {
  setup: MatchSetup
  actions: MatchAction[]
  startedAt: number
}

export interface CurrentMatchSessionSnapshot extends CurrentMatchSessionInput {
  projection: MatchProjection
}

export interface CurrentMatchSession {
  getSnapshot(): CurrentMatchSessionSnapshot
  scorePoint(teamId: MatchTeamId): Promise<CurrentMatchSessionSnapshot>
  undoScoreAction(): Promise<CurrentMatchSessionSnapshot>
  continuePlaying(): Promise<CurrentMatchSessionSnapshot>
}

export interface CreateCurrentMatchSessionOptions extends CurrentMatchSessionInput {
  persistence?: CurrentMatchPersistence
}

export function createCurrentMatchSession(
  options: CreateCurrentMatchSessionOptions
): CurrentMatchSession {
  let snapshot = createCurrentMatchSessionSnapshot({
    setup: options.setup,
    actions: options.actions,
    startedAt: options.startedAt
  })
  const persistence = options.persistence ?? currentMatchPersistence
  let pendingMutation = Promise.resolve()

  return {
    getSnapshot: () => snapshot,
    scorePoint: (teamId) =>
      enqueueMutation(async () => {
        const nextActions = [
          ...snapshot.actions,
          {
            type: 'score-point',
            teamId
          }
        ] satisfies MatchAction[]
        const nextSnapshot = createCurrentMatchSessionSnapshot({
          setup: snapshot.setup,
          actions: nextActions,
          startedAt: snapshot.startedAt
        })

        // The domain reducer ignores score inputs once they stop changing canonical state, so this
        // guard prevents persisting no-op actions that replay would never count.
        if (nextSnapshot.projection.state.actionCount === snapshot.projection.state.actionCount) {
          return snapshot
        }

        return commitSnapshot(nextSnapshot)
      }),
    undoScoreAction: () =>
      enqueueMutation(async () => {
        const nextActions = undoLastScoringAction(snapshot.actions)

        if (nextActions.length === snapshot.actions.length) {
          return snapshot
        }

        return commitSnapshot(
          createCurrentMatchSessionSnapshot({
            setup: snapshot.setup,
            actions: nextActions,
            startedAt: snapshot.startedAt
          })
        )
      }),
    continuePlaying: () =>
      enqueueMutation(async () => {
        const nextSetup = continueMatch(snapshot.setup, snapshot.projection.state)

        if (nextSetup === snapshot.setup) {
          return snapshot
        }

        return commitSnapshot(
          createCurrentMatchSessionSnapshot({
            setup: nextSetup,
            actions: snapshot.actions,
            startedAt: snapshot.startedAt
          })
        )
      })
  }

  function enqueueMutation(
    mutation: () => Promise<CurrentMatchSessionSnapshot>
  ): Promise<CurrentMatchSessionSnapshot> {
    const nextMutation = pendingMutation.then(() => mutation())

    pendingMutation = nextMutation.then(
      () => undefined,
      () => undefined
    )

    return nextMutation
  }

  async function commitSnapshot(
    nextSnapshot: CurrentMatchSessionSnapshot
  ): Promise<CurrentMatchSessionSnapshot> {
    await persistence.saveCurrentMatch({
      setup: nextSnapshot.setup,
      actions: nextSnapshot.actions,
      startedAt: nextSnapshot.startedAt
    })

    snapshot = nextSnapshot

    return snapshot
  }
}

export function createCurrentMatchSessionSnapshot(
  input: CurrentMatchSessionInput
): CurrentMatchSessionSnapshot {
  return {
    setup: input.setup,
    actions: input.actions,
    startedAt: input.startedAt,
    projection: projectMatch(input.setup, input.actions)
  }
}
