import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import type { Booking, Desk, User } from "../types.js";

export const users: User[] = [
  {
    id: "u-admin",
    name: "Workspace Admin",
    email: "admin@cowork.local",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
  },
  {
    id: "u-member",
    name: "Demo Member",
    email: "member@cowork.local",
    passwordHash: bcrypt.hashSync("member123", 10),
    role: "member",
  },
];

export const desks: Desk[] = [
  { id: "d-101", label: "A1", zone: "North", capacity: 1, status: "available", amenities: ["Monitor", "Dock"] },
  { id: "d-102", label: "A2", zone: "North", capacity: 1, status: "available", amenities: ["Standing Desk"] },
  { id: "d-201", label: "B1", zone: "Central", capacity: 2, status: "available", amenities: ["Whiteboard"] },
  { id: "d-202", label: "B2", zone: "Central", capacity: 2, status: "maintenance", amenities: ["Phone Booth Nearby"] },
  { id: "d-301", label: "C1", zone: "South", capacity: 1, status: "available", amenities: ["Dual Monitor"] },
];

export const bookings: Booking[] = [
  {
    id: uuid(),
    userId: "u-member",
    deskId: "d-101",
    date: new Date().toISOString().slice(0, 10),
    startHour: 10,
    durationHours: 2,
    createdAt: new Date().toISOString(),
    notes: "Focus block",
  },
];
