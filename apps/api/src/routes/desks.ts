import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { desks } from "../data/store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const createDeskSchema = z.object({
  label: z.string().min(1).max(20),
  zone: z.string().min(1).max(40),
  capacity: z.number().int().min(1).max(20),
  status: z.enum(["available", "maintenance"]).default("available"),
  amenities: z.array(z.string().min(1).max(30)).default([]),
});

const updateDeskSchema = createDeskSchema.partial();

export const deskRouter = Router();

deskRouter.get("/", requireAuth, (req, res) => {
  const { zone, status } = req.query;
  const result = desks.filter((d) => {
    const zoneMatch = typeof zone === "string" ? d.zone.toLowerCase() === zone.toLowerCase() : true;
    const statusMatch = typeof status === "string" ? d.status === status : true;
    return zoneMatch && statusMatch;
  });
  res.json(result);
});

deskRouter.post("/", requireAuth, requireRole(["admin"]), (req, res) => {
  const parse = createDeskSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const desk = { id: uuid(), ...parse.data };
  desks.push(desk);
  res.status(201).json(desk);
});

deskRouter.patch("/:deskId", requireAuth, requireRole(["admin"]), (req, res) => {
  const parse = updateDeskSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const desk = desks.find((d) => d.id === req.params.deskId);
  if (!desk) {
    res.status(404).json({ message: "Desk not found" });
    return;
  }

  Object.assign(desk, parse.data);
  res.json(desk);
});
