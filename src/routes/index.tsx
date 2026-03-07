import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main>
      <h1>Padel Buddy Web</h1>
      <p>TanStack Start client-only scaffold is ready.</p>
    </main>
  )
}
