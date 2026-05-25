import type { SetSummaryScorePart } from '@/core/match/set-summary';

interface SetScoreValueProps {
  score: SetSummaryScorePart;
  tiebreakClassName?: string | undefined;
}

export function SetScoreValue({ score, tiebreakClassName }: SetScoreValueProps) {
  return (
    <>
      <span>{score.games}</span>
      {score.tiebreakPoints !== undefined && (
        <span className={tiebreakClassName}>({score.tiebreakPoints})</span>
      )}
    </>
  );
}
