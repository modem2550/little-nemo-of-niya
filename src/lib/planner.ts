// src/lib/planner.ts

export interface ActivityConfig {
  slug: string;
  name: string;
  match: string[];
  icon: string;
  color: string;
  desc?: string;
  tickets?: number;
  type?: 'hub' | 'merch';
  warning?: string;
  warningLevel?: 'warn' | 'danger';
}

export interface DayConfig {
  key: string;
  label: string;
  short: string;
  date?: string;
}

export interface PriceConfig {
  ticket: number;
  hub: number;
}

export interface ScheduleSlot {
  day: string;
  time: string;
  members: string[];
}

export interface ScheduleEntry {
  activitySlug: string;
  slots: ScheduleSlot[];
}

export type ActivityType = 'hub' | 'merch' | 'normal';

export function findActivity(
  activities: ActivityConfig[],
  name: string,
  slug: string
): ActivityConfig {
  return (
    activities.find(
      (a) =>
        a.slug === slug ||
        a.match.some(
          (k) =>
            name.toLowerCase().includes(k.toLowerCase()) ||
            slug.toLowerCase().includes(k.toLowerCase())
        )
    ) ?? { slug, name, match: [], icon: 'fa-solid fa-ticket', color: '#8b5cf6' }
  );
}

export function getActivityType(
  activities: ActivityConfig[],
  name: string,
  slug: string
): ActivityType {
  return (findActivity(activities, name, slug).type as ActivityType) ?? 'normal';
}

export function ticketsPerRound(
  type: ActivityType,
  activities: ActivityConfig[],
  name: string,
  slug: string,
  override: number | null
): number {
  if (type === 'merch' || type === 'hub') return 0;
  return override ?? findActivity(activities, name, slug).tickets ?? 1;
}

export function pricePerRound(
  type: ActivityType,
  prices: PriceConfig,
  activities: ActivityConfig[],
  name: string,
  slug: string,
  override: number | null
): number {
  if (type === 'merch') return 0;
  if (type === 'hub') return prices.hub;
  return ticketsPerRound(type, activities, name, slug, override) * prices.ticket;
}