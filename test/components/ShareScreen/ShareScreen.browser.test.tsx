import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { ShareScreen } from '@/components/ShareScreen'

describe('ShareScreen', () => {
  const defaultProps = {
    winnerName: 'Alvaro y Enrique',
    loserName: 'Pablo y Thiago',
    winnerTeamId: 'team-1' as const,
    formatLabel: 'Best of 3',
    setRows: [
      { setNumber: 1, team1Games: 6, team2Games: 4 },
      { setNumber: 2, team1Games: 7, team2Games: 5 }
    ],
    durationValue: '1h 22m',
    dateValue: '22/03/26'
  }

  it('renders winner name', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />)
    await expect.element(screen.getByText('Alvaro y Enrique').first()).toBeInTheDocument()
  })

  it('renders loser name', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />)
    await expect.element(screen.getByText('Pablo y Thiago').first()).toBeInTheDocument()
  })

  it('renders set scores', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />)
    await expect.element(screen.getByText('6', { exact: true }).first()).toBeInTheDocument()
    await expect.element(screen.getByText('4', { exact: true }).first()).toBeInTheDocument()
  })

  it('renders duration and date', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />)
    await expect.element(screen.getByText('1h 22m')).toBeInTheDocument()
    await expect.element(screen.getByText('22/03/26')).toBeInTheDocument()
  })
})
