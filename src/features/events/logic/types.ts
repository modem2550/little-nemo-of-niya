import type { EventPlugin } from '@/types/event';

export type EventType = 'ranking' | 'planner' | 'fan_project';

export interface UnifiedEventConfig {
    id: string;
    type: EventType;
    rounds: number | 'auto';
    data: any[]; // Data array (songs, members, or activities)
    plugin: EventPlugin; // The original metadata
}
