import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '@/components/AppShell/AppShell'
import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'

export const Route = createFileRoute('/')({
  component: HomeRoute
})

function HomeRoute() {
  return (
    <CurrentMatchStartupGate>
      <AppShell />
    </CurrentMatchStartupGate>
  )
}
