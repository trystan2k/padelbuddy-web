import {
  hydrateCurrentMatchStartup,
  type CurrentMatchStartupOptions,
  type CurrentMatchStartupResult
} from '@/lib/current-match'

export interface HomeStartupLoaderData {
  startupState: CurrentMatchStartupResult
}

export interface LoadHomeStartupOptions {
  startup?: CurrentMatchStartupOptions
}

export async function loadHomeStartup(
  options: LoadHomeStartupOptions = {}
): Promise<HomeStartupLoaderData> {
  return {
    startupState: await hydrateCurrentMatchStartup(options.startup)
  }
}
