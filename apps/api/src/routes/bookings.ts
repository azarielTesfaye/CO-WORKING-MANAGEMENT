import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { bookings, desks } from "../data/store.js";
import { availableHoursForDesk, isBookingConflict, isValidHour } from "../lib/booking.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { Booking } from "../types.js";

const createBookingSchema = z.object({
  deskId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startHour: z.number().int(),
  durationHours: z.number().int().min(1).max(8).default(1),
  notes: z.string().max(300).optional(),
});

export const bookingRouter = Router();

bookingRouter.get("/", requireAuth, (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const deskId = typeof req.query.deskId === "string" ? req.query.deskId : undefined;
  const ownOnly = req.authUser?.role !== "admin";

  const result = bookings.filter((b) => {
    if (ownOnly && b.userId !== req.authUser?.id) return false;
    if (date && b.date !== date) return false;
    if (deskId && b.deskId !== deskId) return false;
    return true;
  });

  res.json(result);
});

bookingRouter.get("/availability", requireAuth, (req, res) => {
  const date = typeof req.query.date === "string" ? req.query.date : "";
  const deskId = typeof req.query.deskId === "string" ? req.query.deskId : "";

  if (!date || !deskId) {
    res.status(400).json({ message: "date and deskId query params are required" });
    return;
  }

  const desk = desks.find((d) => d.id === deskId);
  if (!desk) {
    res.status(404).json({ message: "Desk not found" });
    return;
  }

  res.json({
    deskId,
    date,
    availableHours: availableHoursForDesk(date, deskId, bookings),
  });
});

bookingRouter.post("/", requireAuth, (req, res) => {
  const parse = createBookingSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const desk = desks.find((d) => d.id === parse.data.deskId);
  if (!desk) {
    res.status(404).json({ message: "Desk not found" });
    return;
  }
  if (desk.status !== "available") {
    res.status(409).json({ message: "Desk is not available" });
    return;
  }
  if (!isValidHour(parse.data.startHour)) {
    res.status(400).json({ message: "startHour is outside business hours" });
    return;
  }

  const newBooking: Booking = {
    id: uuid(),
    userId: req.authUser!.id,
    deskId: parse.data.deskId,
    date: parse.data.date,
    startHour: parse.data.startHour,
    durationHours: parse.data.durationHours,
    createdAt: new Date().toISOString(),
    notes: parse.data.notes,
  };

  if (isBookingConflict(newBooking, bookings)) {
    res.status(409).json({ message: "Time slot conflict for this desk" });
    return;
  }

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

bookingRouter.delete("/:bookingId", requireAuth, (req, res) => {
  const index = bookings.findIndex((b) => b.id === req.params.bookingId);
  if (index < 0) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const booking = bookings[index];
  const isOwner = booking.userId === req.authUser?.id;
  const isAdmin = req.authUser?.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403).json({ message: "Cannot delete another member's booking" });
    return;
  }

  bookings.splice(index, 1);
  res.status(204).send();
});

bookingRouter.delete("/admin/clear", requireAuth, requireRole(["admin"]), (_req, res) => {
  bookings.splice(0, bookings.length);
  res.status(204).send();
});
