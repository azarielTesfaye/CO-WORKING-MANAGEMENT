export interface Booking {
  id: string;
  userId?: string;
  deskId: string;
  date: string;
  startHour: number;
  durationHours?: number;
  createdAt?: string;
  notes?: string;
}

export type DeskStatus = 'available' | 'maintenance';

export interface Desk {
  id: string;
  label: string;
  zone: string;
  capacity: number;
  status: DeskStatus;
  amenities: string[];
}
