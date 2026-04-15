import { Router } from "express";
import { bookings, desks } from "../data/store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const metricsRouter = Router();

metricsRouter.get("/overview", requireAuth, requireRole(["admin"]), (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.date === today);
  const activeDesks = desks.filter((d) => d.status === "available").length;
  const byZone = desks.reduce<Record<string, number>>((acc, desk) => {
    acc[desk.zone] = (acc[desk.zone] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    totals: {
      desks: desks.length,
      activeDesks,
      bookings: bookings.length,
      todayBookings: todayBookings.length,
    },
    zoneDistribution: byZone,
  });
});
