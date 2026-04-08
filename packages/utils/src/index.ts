// Date helpers
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

// Conflict detection
export interface TimeSlot {
  start: Date;
  end: Date;
}

export function isOverlapping(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && a.end > b.start;
}

export function isTimeSlotAvailable(desired: TimeSlot, existing: TimeSlot[]): boolean {
  return !existing.some(ex => isOverlapping(desired, ex));
}

// Storage helpers (localStorage)
export function saveToLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromLocal<T>(key: string, defaultValue: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}