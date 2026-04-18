import type { PriceConfig, DayConfig, ActivityConfig, ScheduleEntry } from '@/features/planner/plannerUtils';

export interface Event {
  id: string;
  title?: string;
  description?: string;
  date: string;
  end_date?: string | null;
  location?: string;
  live?: string;
  link?: string;
  image_url?: string;
  image_urls?: {
    medium?: string;
    large?: string;
  };
  [key: string]: any;
}

export interface PlannerConfig {
    enabled: boolean;
    pageTitle: string;
    description: string;
    officialLink?: string;
    storageKey?: string;
    heroImage: string;
    listingImage?: string;
    href?: string;
    primaryHover: string;
    prices?: PriceConfig;
    days?: DayConfig[];
    activities?: ActivityConfig[];
    schedule?: ScheduleEntry[];
}

export interface RankingConfig {
    enabled: boolean;
    pageTitle: string;
    description: string;
    storageKey: string;
    brandTarget: "BNK48" | "CGM48" | "48th";
    rounds: number;
    primaryGradient?: string;
    listingImage?: string;
}

export interface ThemeConfig {
    primary?: string;
    primaryHover?: string;
    bg?: string;
    surface?: string;
    surfaceAlt?: string;
    border?: string;
    content?: string;
    textMuted?: string;
    primaryGradient?: string;
}

export interface EventPlugin {
    slug: string;
    name: string;
    primaryColor: string;
    primaryHover: string;
    primaryGradient?: string;
    theme: {  // ✅ เพิ่มบรรทัดนี้
        primary: string;
        primaryHover: string;
        primaryGradient?: string;
        bg: string;
        surface: string;
        surfaceAlt: string;
        border: string;
        content: string;
        textMuted: string;
    };
    features: {
        planner?: PlannerConfig;
        ranking?: RankingConfig;
    };
}