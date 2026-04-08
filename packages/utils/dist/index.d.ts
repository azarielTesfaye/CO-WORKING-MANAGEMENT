export declare function formatDate(date: Date): string;
export declare function formatTime(date: Date): string;
export declare function isSameDay(date1: Date, date2: Date): boolean;
export interface TimeSlot {
    start: Date;
    end: Date;
}
export declare function isOverlapping(a: TimeSlot, b: TimeSlot): boolean;
export declare function isTimeSlotAvailable(desired: TimeSlot, existing: TimeSlot[]): boolean;
export declare function saveToLocal<T>(key: string, data: T): void;
export declare function loadFromLocal<T>(key: string, defaultValue: T): T;
