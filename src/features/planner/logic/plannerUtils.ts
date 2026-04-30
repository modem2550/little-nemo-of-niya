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
  note?: string;
}

export interface ScheduleEntry {
  activitySlug: string;
  slots: ScheduleSlot[];
}
