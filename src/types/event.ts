// ./types/event.ts

export interface ImageUrls {
  small: string;
  medium: string;
  large: string;
  image_slug?: string; 
  image_url?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  end_date?: string | null;
  location?: string | null;
  live?: string | null;
  link: string;
  image_url?: string | null;
  image_urls?: ImageUrls | null;
  created_at?: string;
  updated_at?: string;
  // ✅ เพิ่มบรรทัดนี้ เพื่อรับค่า URL สวยๆ ที่เราสร้างขึ้น
  generated_slug?: string; 
}

export interface EventCardProps {
  event: Event;
  isPast?: boolean;
  variant?: 'default' | 'compact';
}

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
}