import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "sky-loan-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "sky-loan-refresh-secret";
const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";

export type UserRole = "base" | "admin";

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    if (refreshTokenBlacklist.has(token)) return null;
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Blacklist de refresh tokens invalidados al hacer logout
const refreshTokenBlacklist = new Set<string>();

export function blacklistRefreshToken(token: string): void {
  refreshTokenBlacklist.add(token);
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No se proporcionó token" });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  req.user = payload;
  next();
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Prohibido", message: "Se requiere acceso de administrador" });
  }
  next();
}
