import { createFileRoute } from '@tanstack/react-router';

import { HomeRoute } from '@/components/HomeScreen/HomeScreen';
import { currentMatchPersistenceRouteLoaderOptions } from '@/lib/router/current-match-route-flow';

import { loadHomeStartup } from './-home-startup';
import { parseMatchRouteErrorType, type MatchRouteErrorType } from './-match-route-state';

interface HomeRouteSearch {
  error?: MatchRouteErrorType;
}

export const Route = createFileRoute('/')({
  ...currentMatchPersistenceRouteLoaderOptions,
  validateSearch: (search): HomeRouteSearch => {
    const error = parseMatchRouteErrorType(search.error);

    return error ? { error } : {};
  },
  loader: async () => loadHomeStartup(),
  component: function HomeRouteWrapper() {
    const { startupState } = Route.useLoaderData();
    const { error } = Route.useSearch();

    return <HomeRoute startupState={startupState} {...(error !== undefined && { error })} />;
  }
});
