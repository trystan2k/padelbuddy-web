import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { ActiveMatchScreen } from '@/components/ActiveMatchScreen'
import { loadCurrentMatch } from '@/lib/current-match'

export const Route = createFileRoute('/match/$id')({
  component: MatchRoute,
  loader: async ({ params }) => {
    // Load match data from persistence
    // Match ID is stored for future use (sharing, history)
    const matchData = await loadCurrentMatch()
    return { matchId: params.id, matchData }
  }
})

function MatchRoute() {
  const { matchId, matchData } = Route.useLoaderData()
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Handle different load results
    if (matchData.status === 'empty') {
      // No match found, redirect to home
      void navigate({ to: '/' })
      return
    }

    if (matchData.status === 'reset-required') {
      // Schema version mismatch, redirect to home
      // The reset notice will be shown by the app
      void navigate({ to: '/' })
      return
    }

    if (matchData.status === 'corrupt') {
      // Corrupted data, redirect to home
      console.error('Corrupted match data:', matchData.message)
      void navigate({ to: '/' })
      return
    }

    setIsReady(true)
  }, [matchData, navigate])

  if (!isReady) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    )
  }

  if (matchData.status !== 'ok') {
    // This shouldn't happen due to the redirects above, but TypeScript needs it
    return (
      <main>
        <p>Error loading match</p>
      </main>
    )
  }

  const { setup, actions, startedAt } = matchData.record

  return (
    <ActiveMatchScreen
      matchId={matchId}
      initialSetup={setup}
      initialActions={actions}
      startedAt={startedAt}
    />
  )
}
