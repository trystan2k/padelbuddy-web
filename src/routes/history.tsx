import { createFileRoute } from '@tanstack/react-router';

import { HistoryScreen } from '@/components/HistoryScreen/HistoryScreen';
import { RouteErrorState } from '@/routes/-route-utils';
import { listMatchHistory } from '@/lib/match-history/indexed-db';

export const Route = createFileRoute('/history')({
  staleTime: 0,
  loader: async () => {
    try {
      return await listMatchHistory();
    } catch {
      throw new Error('Unable to load match history right now. Please try again.');
    }
  },
  errorComponent: RouteErrorState,
  component: HistoryRoute
});

function HistoryRoute() {
  const records = Route.useLoaderData();

  return <HistoryScreen initialRecords={records} />;
}
