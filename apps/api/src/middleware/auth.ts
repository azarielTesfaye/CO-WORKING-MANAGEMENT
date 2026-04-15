import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { users } from "../data/store.js";
import type { UserRole } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

interface TokenPayload {
  sub: string;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    authUser?: {
      id: string;
      role: UserRole;
    };
  }
}

export function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ role }, JWT_SECRET, {
    subject: userId,
    expiresIn: "12h",
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.authUser = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
}

export function getCurrentUser(req: Request) {
  if (!req.authUser) return null;
  return users.find((u) => u.id === req.authUser?.id) ?? null;
}
