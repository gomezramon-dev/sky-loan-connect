import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../auth.js";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña requeridos" });
  }

  const user = db.prepare("SELECT id, email, password_hash, role FROM users WHERE email = ?").get(
    String(email).toLowerCase()
  ) as { id: number; email: string; password_hash: string; role: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const payload = { userId: user.id, email: user.email, role: user.role as "base" | "admin" };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Se requiere token de refresh" });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ error: "Token de refresh inválido o expirado" });
  }

  const user = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(payload.userId) as
    | { id: number; email: string; role: string }
    | undefined;

  if (!user) {
    return res.status(401).json({ error: "Usuario no encontrado" });
  }

  const newPayload = { userId: user.id, email: user.email, role: user.role as "base" | "admin" };
  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  res.json({
    accessToken,
    refreshToken: newRefreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

export default router;
