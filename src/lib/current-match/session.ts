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
  finishedAt?: number
}

export interface CurrentMatchSessionSnapshot {
  setup: MatchSetup
  actions: MatchAction[]
  startedAt: number
  finishedAt?: number
  projection: MatchProjection
}

export interface CurrentMatchSession {
  getSnapshot(): CurrentMatchSessionSnapshot
  scorePoint(teamId: MatchTeamId): Promise<CurrentMatchSessionSnapshot>
  undoScoreAction(): Promise<CurrentMatchSessionSnapshot>
  continuePlaying(): Promise<CurrentMatchSessionSnapshot>
}

export interface CreateCurrentMatchSessionOptions extends CurrentMatchSessionInput {
  matchId?: string
  persistence?: CurrentMatchPersistence
}

export function createCurrentMatchSession(
  options: CreateCurrentMatchSessionOptions
): CurrentMatchSession {
  const matchId = options.matchId
  let snapshot = createCurrentMatchSessionSnapshot({
    setup: options.setup,
    actions: options.actions,
    startedAt: options.startedAt,
    ...(typeof options.finishedAt === 'number' ? { finishedAt: options.finishedAt } : {})
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

        return commitSnapshot(
          withFinishedAtIfCompleted(nextSnapshot, snapshot.finishedAt ?? Date.now())
        )
      }),
    undoScoreAction: () =>
      enqueueMutation(async () => {
        const nextActions = undoLastScoringAction(snapshot.actions)

        if (nextActions.length === snapshot.actions.length) {
          return snapshot
        }

        return commitSnapshot(
          withFinishedAtIfCompleted(
            createCurrentMatchSessionSnapshot({
              setup: snapshot.setup,
              actions: nextActions,
              startedAt: snapshot.startedAt
            }),
            snapshot.finishedAt
          )
        )
      }),
    continuePlaying: () =>
      enqueueMutation(async () => {
        const nextSetup = continueMatch(snapshot.setup, snapshot.projection.state)

        if (nextSetup === snapshot.setup) {
          return snapshot
        }

        const elapsedMilliseconds = getElapsedMilliseconds(snapshot)

        return commitSnapshot(
          createCurrentMatchSessionSnapshot({
            setup: nextSetup,
            actions: snapshot.actions,
            startedAt: Date.now() - elapsedMilliseconds
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
      ...(matchId ? { matchId } : {}),
      setup: nextSnapshot.setup,
      actions: nextSnapshot.actions,
      startedAt: nextSnapshot.startedAt,
      ...(typeof nextSnapshot.finishedAt === 'number'
        ? { finishedAt: nextSnapshot.finishedAt }
        : {})
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
    ...(typeof input.finishedAt === 'number' ? { finishedAt: input.finishedAt } : {}),
    projection: projectMatch(input.setup, input.actions)
  }
}

function getElapsedMilliseconds(snapshot: CurrentMatchSessionSnapshot): number {
  const endTimestamp = snapshot.finishedAt ?? Date.now()

  return Math.max(0, endTimestamp - snapshot.startedAt)
}

function withFinishedAtIfCompleted(
  snapshot: CurrentMatchSessionSnapshot,
  finishedAt: number | undefined
): CurrentMatchSessionSnapshot {
  if (snapshot.projection.derived.status !== 'completed' || typeof finishedAt !== 'number') {
    return snapshot
  }

  return {
    ...snapshot,
    finishedAt
  }
}
