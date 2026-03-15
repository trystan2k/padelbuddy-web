import { createFileRoute } from '@tanstack/react-router'

import { SetupScreen } from '@/components/SetupScreen'
import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate'

export const Route = createFileRoute('/')({
  component: HomeRoute
})

function HomeRoute() {
  return (
    <CurrentMatchStartupGate>
      <SetupScreen />
    </CurrentMatchStartupGate>
  )
}
