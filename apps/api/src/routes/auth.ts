import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { users } from "../data/store.js";
import { getCurrentUser, requireAuth, signAccessToken } from "../middleware/auth.js";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    res.status(409).json({ message: "Email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(parse.data.password, 10);
  const user = {
    id: uuid(),
    name: parse.data.name,
    email,
    passwordHash,
    role: "member" as const,
  };
  users.push(user);

  const token = signAccessToken(user.id, user.role);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

authRouter.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const user = users.find((u) => u.email.toLowerCase() === parse.data.email.toLowerCase());
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const passwordMatches = await bcrypt.compare(parse.data.password, user.passwordHash);
  if (!passwordMatches) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signAccessToken(user.id, user.role);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});
