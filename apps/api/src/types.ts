export type UserRole = "member" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export type DeskStatus = "available" | "maintenance";

export interface Desk {
  id: string;
  label: string;
  zone: string;
  capacity: number;
  status: DeskStatus;
  amenities: string[];
}

export interface Booking {
  id: string;
  userId: string;
  deskId: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  durationHours: number;
  createdAt: string;
  notes?: string;
}
