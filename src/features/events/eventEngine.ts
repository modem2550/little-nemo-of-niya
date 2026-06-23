import type { EventPlugin } from '@/types/event';
import type { UnifiedEventConfig } from './logic/types';

// Optimized: eager: false to avoid loading all event configs into the initial bundle
const eventModules = import.meta.glob<{ eventConfig: UnifiedEventConfig }>(
    './data/*.ts',
    { eager: false }
);

// Module-level cache: the Promise is stored after the first call so that
// subsequent invocations on the same server instance (warm lambda) skip
// the Promise.all / glob-loader work entirely.
let cachedEventsPromise: Promise<UnifiedEventConfig[]> | null = null;

/**
 * Loads all event configurations dynamically.
 * Results are memoized for the lifetime of the server instance so that
 * getPlannerEvents() and getRankingEvents() share a single load cycle.
 */
export async function getAllUnifiedEvents(): Promise<UnifiedEventConfig[]> {
    if (!cachedEventsPromise) {
        cachedEventsPromise = Promise.all(
            Object.values(eventModules).map(loader => loader())
        ).then(modules =>
            modules
                .map(mod => mod.eventConfig)
                .filter((config): config is UnifiedEventConfig => Boolean(config))
        );
    }
    return cachedEventsPromise;
}

export async function getPlannerEvents(): Promise<EventPlugin[]> {
    const all = await getAllUnifiedEvents();
    return all
        .map(config => config.plugin)
        .filter(e => e.features?.planner?.enabled);
}

export async function getRankingEvents(): Promise<EventPlugin[]> {
    const all = await getAllUnifiedEvents();
    return all
        .map(config => config.plugin)
        .filter(
            (e) => e.features?.ranking?.enabled || e.features?.songRanking?.enabled
        );
}
