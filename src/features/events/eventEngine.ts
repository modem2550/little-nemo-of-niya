import type { EventPlugin } from '@/types/event';
import type { UnifiedEventConfig } from './logic/types';

// Optimized: eager: false to avoid loading all event configs into the initial bundle
const eventModules = import.meta.glob('./data/*.ts');

/**
 * Loads all event configurations dynamically.
 * This prevents memory bloat and reduces bundle size for pages that don't need all events.
 */
export async function getAllUnifiedEvents(): Promise<UnifiedEventConfig[]> {
    const modules = await Promise.all(
        Object.values(eventModules).map((loader: any) => loader())
    );
    
    return modules
        .map(mod => mod.default || mod.eventConfig)
        .filter(Boolean);
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
