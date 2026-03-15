import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/match/$id')({
  component: MatchRoute
})

function MatchRoute() {
  const { id } = Route.useParams()

  return (
    <main>
      <h1>Match Screen</h1>
      <p>Match ID: {id}</p>
      <p>This screen will be implemented in a future task.</p>
    </main>
  )
}
