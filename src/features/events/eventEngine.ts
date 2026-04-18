import type { EventPlugin } from '@/types/event';

const eventModules = import.meta.glob('../../data/events/*.ts', { eager: true }) as Record<string, any>;

export const ALL_EVENTS: EventPlugin[] = Object.values(eventModules).map(mod => {
    if (mod.default) return mod.default;
    // Fallback: get the first named export that looks like an object
    const exportName = Object.keys(mod).find(key => typeof mod[key] === 'object');
    return exportName ? mod[exportName] : mod;
});

export function getPlannerEvents(): EventPlugin[] {
    return ALL_EVENTS.filter(e => e.features?.planner?.enabled);
}

export function getRankingEvents(): EventPlugin[] {
    return ALL_EVENTS.filter(e => e.features?.ranking?.enabled);
}
