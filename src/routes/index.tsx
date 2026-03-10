import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '@/components/AppShell/AppShell'

export const Route = createFileRoute('/')({
  component: HomeRoute
})

function HomeRoute() {
  return <AppShell />
}
