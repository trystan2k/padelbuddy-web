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

export const Route = createFileRoute('/match/finish/$id')({
  ...currentMatchPersistenceRouteLoaderOptions,
  component: MatchFinishRoute,
  errorComponent: RouteErrorState,
  loader: ({ params }) =>
    loadMappedReadyMatchRouteState(params.id, 'finish', (routeState) => ({
      matchId: params.id,
      record: routeState.record,
      projection: routeState.projection
    }))
});

function MatchFinishRoute() {
  const { record, projection } = Route.useLoaderData();

  return <MatchFinishRouteReadyContent record={record} projection={projection} />;
}

interface MatchFinishRouteReadyContentProps {
  record: CurrentMatchRecord;
  projection: MatchProjection;
}

function MatchFinishRouteReadyContent({ record, projection }: MatchFinishRouteReadyContentProps) {
  return (
    <MatchEndScreen
      matchId={record.matchId}
      setup={record.setup}
      actions={record.actions}
      projection={projection}
      startedAt={record.startedAt}
      // PBW-68 Item 5 follow-up: reuse the shared exact optional-prop wrapper so the
      // finish route does not drift from the active route's finishedAt handling.
      {...getOptionalFinishedAt(record.finishedAt)}
    />
  );
}
