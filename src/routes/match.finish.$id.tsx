import { createFileRoute } from '@tanstack/react-router';

import { MatchEndScreen } from '@/components/MatchEndScreen/MatchEndScreen';
import type { MatchProjection } from '@/core/match/types';
import type { CurrentMatchRecord } from '@/lib/current-match/persistence';
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow';

import {
  getOptionalFinishedAt,
  RouteErrorState,
  loadMappedReadyMatchRouteState
} from './-route-utils';

interface MatchFinishRouteSearch {
  from?: 'history';
}

export const Route = createFileRoute('/match/finish/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
  validateSearch: (search): MatchFinishRouteSearch => {
    if (search.from === 'history') {
      return { from: 'history' };
    }

    return {};
  },
  loaderDeps: ({ search }) => ({ from: search.from }),
  component: MatchFinishRoute,
  errorComponent: RouteErrorState,
  loader: ({ params, deps }) => {
    const source: 'current' | 'history' = deps?.from === 'history' ? 'history' : 'current';

    return loadMappedReadyMatchRouteState(
      params.id,
      'finish',
      (routeState) => ({
        matchId: params.id,
        record: routeState.record,
        projection: routeState.projection,
        source
      }),
      source
    );
  }
});

function MatchFinishRoute() {
  const { record, projection, source } = Route.useLoaderData();

  return <MatchFinishRouteReadyContent record={record} projection={projection} source={source} />;
}

interface MatchFinishRouteReadyContentProps {
  record: CurrentMatchRecord;
  projection: MatchProjection;
  source: 'current' | 'history';
}

function MatchFinishRouteReadyContent({
  record,
  projection,
  source
}: MatchFinishRouteReadyContentProps) {
  return (
    <MatchEndScreen
      matchId={record.matchId}
      setup={record.setup}
      actions={record.actions}
      projection={projection}
      startedAt={record.startedAt}
      source={source}
      // PBW-68 Item 5 follow-up: reuse the shared exact optional-prop wrapper so the
      // finish route does not drift from the active route's finishedAt handling.
      {...getOptionalFinishedAt(record.finishedAt)}
    />
  );
}
