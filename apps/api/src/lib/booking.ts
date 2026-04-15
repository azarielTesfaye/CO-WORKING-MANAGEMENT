import type { Booking } from "../types.js";

export const BUSINESS_HOUR_START = 8;
export const BUSINESS_HOUR_END = 19; // last slot start can be 18

export function isValidHour(hour: number): boolean {
  return Number.isInteger(hour) && hour >= BUSINESS_HOUR_START && hour < BUSINESS_HOUR_END;
}

export function hasOverlap(aStart: number, aDuration: number, bStart: number, bDuration: number): boolean {
  const aEnd = aStart + aDuration;
  const bEnd = bStart + bDuration;
  return aStart < bEnd && aEnd > bStart;
}

export function isBookingConflict(target: Booking, existing: Booking[]): boolean {
  return existing.some((b) => {
    if (b.deskId !== target.deskId || b.date !== target.date) {
      return false;
    }
    return hasOverlap(target.startHour, target.durationHours, b.startHour, b.durationHours);
  });
}

export function availableHoursForDesk(date: string, deskId: string, allBookings: Booking[]): number[] {
  const deskBookings = allBookings.filter((b) => b.date === date && b.deskId === deskId);
  const slots: number[] = [];

  for (let hour = BUSINESS_HOUR_START; hour < BUSINESS_HOUR_END; hour += 1) {
    const slotIsFree = !deskBookings.some((b) => hasOverlap(hour, 1, b.startHour, b.durationHours));
    if (slotIsFree) {
      slots.push(hour);
    }
  }

  return slots;
}
