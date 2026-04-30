/**
 * Date Utilities
 * รวมฟังก์ชันสำหรับจัดการวันที่ในโปรเจกต์
 */
import type { Event } from '../../types/event';

export const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// ── Core ──────────────────────────────────────────────────────────────────────

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString.replace(/-/g, '/').split('T')[0]);
  return isNaN(date.getTime()) ? null : date;
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatEventDate(
  startDate: string,
  endDate?: string | null,
  locale: 'en' | 'th' = 'en'
): string {
  const months = locale === 'th' ? MONTHS_TH : MONTHS;
  const start = parseDate(startDate);
  if (!start) return '';

  const fmt = (d: Date) => ({
    day: d.getDate().toString().padStart(2, '0'),
    month: months[d.getMonth()],
    year: d.getFullYear(),
  });

  const s = fmt(start);
  const end = endDate ? parseDate(endDate) : null;

  if (!end || start.getTime() === end.getTime()) return `${s.day} ${s.month} ${s.year}`;

  const e = fmt(end);

  if (s.year !== e.year) return `${s.day} ${s.month} ${s.year} – ${e.day} ${e.month} ${e.year}`;
  if (s.month !== e.month) return `${s.day} ${s.month} – ${e.day} ${e.month} ${s.year}`;
  return `${s.day}–${e.day} ${s.month} ${s.year}`;
}

// ── Status helpers ────────────────────────────────────────────────────────────

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isPastEvent(eventDate: string, endDate?: string | null): boolean {
  const check = parseDate(endDate || eventDate);
  if (!check) return true;
  check.setHours(0, 0, 0, 0);
  return check.getTime() < startOfToday();
}

export const isUpcomingEvent = (eventDate: string, endDate?: string | null) =>
  !isPastEvent(eventDate, endDate);

export function getEventStatus(eventDate: string, endDate?: string | null) {
  const past = isPastEvent(eventDate, endDate);
  return {
    isPast: past,
    label: past ? 'Past Event' : 'Upcoming Event',
    labelTh: past ? 'อีเวนต์ที่ผ่านมา' : 'อีเวนต์ที่กำลังจะมา',
  };
}

// ── Categorize ────────────────────────────────────────────────────────────────

export function categorizeEvents<T extends Event>(events: T[]): { upcoming: T[]; past: T[] } {
  const today = startOfToday();
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const event of events) {
    const check = parseDate(event.end_date || event.date);
    if (!check) { past.push(event); continue; }
    check.setHours(0, 0, 0, 0);
    (check.getTime() >= today ? upcoming : past).push(event);
  }

  const byDate = (asc: boolean) => (a: T, b: T) => {
    const ta = parseDate(a.date)?.getTime() ?? 0;
    const tb = parseDate(b.date)?.getTime() ?? 0;
    return asc ? ta - tb : tb - ta;
  };

  upcoming.sort(byDate(true));
  past.sort(byDate(false));

  return { upcoming, past };
}