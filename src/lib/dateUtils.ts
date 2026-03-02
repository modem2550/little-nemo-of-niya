/**
 * Date Utilities
 * รวมฟังก์ชันสำหรับจัดการวันที่ในโปรเจกต์
 */

export const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

/**
 * แปลง string เป็น Date object อย่างปลอดภัย
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    // แปลง YYYY-MM-DD หรือ ISO string
    const normalized = dateString.replace(/-/g, '/').split('T')[0];
    const date = new Date(normalized);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }
    
    return date;
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error);
    return null;
  }
}

/**
 * จัดรูปแบบวันที่สำหรับแสดงอีเวนต์
 * รองรับทั้งวันเดียวและช่วงวันที่
 */
export function formatEventDate(
  startDate: string, 
  endDate?: string | null,
  locale: 'en' | 'th' = 'en'
): string {
  const months = locale === 'th' ? MONTHS_TH : MONTHS;
  
  const start = parseDate(startDate);
  if (!start) return '';
  
  const d1 = start.getDate().toString().padStart(2, '0');
  const m1 = months[start.getMonth()];
  const y1 = start.getFullYear();
  
  // ถ้าไม่มีวันที่สิ้นสุดหรือเป็นวันเดียวกัน
  if (!endDate) {
    return `${d1} ${m1} ${y1}`;
  }
  
  const end = parseDate(endDate);
  if (!end || start.getTime() === end.getTime()) {
    return `${d1} ${m1} ${y1}`;
  }
  
  const d2 = end.getDate().toString().padStart(2, '0');
  const m2 = months[end.getMonth()];
  const y2 = end.getFullYear();
  
  // ปีเดียวกัน
  if (y1 === y2) {
    // เดือนเดียวกัน
    if (m1 === m2) {
      return `${d1}–${d2} ${m1} ${y1}`;
    }
    // คนละเดือน
    return `${d1} ${m1} – ${d2} ${m2} ${y1}`;
  }
  
  // คนละปี
  return `${d1} ${m1} ${y1} – ${d2} ${m2} ${y2}`;
}

/**
 * ตรวจสอบว่าอีเวนต์เป็นอดีตหรือไม่
 */
export function isPastEvent(eventDate: string, endDate?: string | null): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  // ใช้วันสิ้นสุดถ้ามี ไม่งั้นใช้วันเริ่มต้น
  const checkDate = parseDate(endDate || eventDate);
  if (!checkDate) return true; // ถ้าแปลงไม่ได้ถือว่าเป็นอดีต
  
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() < todayTime;
}

/**
 * ตรวจสอบว่าอีเวนต์กำลังจะมาหรือไม่
 */
export function isUpcomingEvent(eventDate: string, endDate?: string | null): boolean {
  return !isPastEvent(eventDate, endDate);
}

/**
 * แยกอีเวนต์เป็น upcoming และ past
 */
export interface Event {
  id?: string;
  date: string;
  end_date?: string | null;
  [key: string]: any;
}

export function categorizeEvents<T extends Event>(events: T[]): {
  upcoming: T[];
  past: T[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const upcoming: T[] = [];
  const past: T[] = [];
  
  events.forEach(event => {
    const checkDate = parseDate(event.end_date || event.date);
    if (!checkDate) {
      past.push(event);
      return;
    }
    
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate.getTime() >= todayTime) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  });
  
  // เรียงลำดับ
  upcoming.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });
  
  past.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });
  
  return { upcoming, past };
}

/**
 * รับข้อความแสดงสถานะอีเวนต์
 */
export function getEventStatus(eventDate: string, endDate?: string | null): {
  isPast: boolean;
  label: string;
  labelTh: string;
} {
  const past = isPastEvent(eventDate, endDate);
  
  return {
    isPast: past,
    label: past ? 'Past Event' : 'Upcoming Event',
    labelTh: past ? 'อีเวนต์ที่ผ่านมา' : 'อีเวนต์ที่กำลังจะมา'
  };
}