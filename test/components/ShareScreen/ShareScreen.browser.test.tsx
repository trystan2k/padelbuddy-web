import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { ShareScreen } from '@/components/ShareScreen/ShareScreen';

describe('ShareScreen', () => {
  const defaultProps = {
    winnerName: 'Alvaro y Enrique',
    team1Name: 'Alvaro y Enrique',
    team2Name: 'Pablo y Thiago',
    formatLabel: 'Best of 3',
    setRows: [
      { setNumber: 1, team1Games: 6, team2Games: 4 },
      { setNumber: 2, team1Games: 7, team2Games: 5 }
    ],
    durationValue: '1h 22m',
    dateValue: '22/03/26'
  };

  it('renders winner name', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />);
    await expect.element(screen.getByText('Alvaro y Enrique').first()).toBeInTheDocument();
  });

  it('renders team 1 name', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />);
    await expect.element(screen.getByText('Alvaro y Enrique').first()).toBeInTheDocument();
  });

  it('renders team 2 name', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />);
    await expect.element(screen.getByText('Pablo y Thiago').first()).toBeInTheDocument();
  });

  it('renders set scores', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />);
    await expect.element(screen.getByText('6', { exact: true }).first()).toBeInTheDocument();
    await expect.element(screen.getByText('4', { exact: true }).first()).toBeInTheDocument();
  });

  it('renders duration and date', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />);
    await expect.element(screen.getByText('1h 22m')).toBeInTheDocument();
    await expect.element(screen.getByText('22/03/26')).toBeInTheDocument();
  });

  it('applies team A color class when winnerTeamId is team-1', async () => {
    const screen = await render(<ShareScreen {...defaultProps} winnerTeamId="team-1" />);

    const winnerSpan = screen.getByText('Alvaro y Enrique').first();
    const className = winnerSpan.element().className;
    expect(className).toContain('winnerNameTeamA');
  });

  it('applies team B color class when winnerTeamId is team-2', async () => {
    const screen = await render(
      <ShareScreen {...defaultProps} winnerTeamId="team-2" winnerName="Pablo y Thiago" />
    );

    const winnerSpan = screen.getByText('Pablo y Thiago').first();
    const className = winnerSpan.element().className;
    expect(className).toContain('winnerNameTeamB');
  });

  it('applies neutral color class when winnerTeamId is undefined', async () => {
    const screen = await render(<ShareScreen {...defaultProps} />);

    const winnerSpan = screen.getByText('Alvaro y Enrique').first();
    const className = winnerSpan.element().className;
    expect(className).toContain('winnerNameNeutral');
  });
});
