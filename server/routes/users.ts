import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { authMiddleware, adminMiddleware, AuthRequest } from "../auth.js";

const router = Router();

// All /users routes require auth + admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", (_req: AuthRequest, res: Response) => {
  const users = db
    .prepare("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC")
    .all();
  res.json(users);
});

router.post("/", (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña requeridos" });
  }
  const emailStr = String(email).toLowerCase().trim();
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'base')")
      .run(emailStr, hash);
    const user = db.prepare("SELECT id, email, role, created_at FROM users WHERE id = ?").get(
      result.lastInsertRowid
    );
    res.status(201).json(user);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "El correo ya existe" });
    }
    throw e;
  }
});

router.put("/:id", (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const existing = db.prepare("SELECT id, role FROM users WHERE id = ?").get(id) as
    | { id: number; role: string }
    | undefined;
  if (!existing) return res.status(404).json({ error: "Usuario no encontrado" });
  if (existing.role === "admin") {
    return res.status(403).json({ error: "No se pueden modificar usuarios administrador" });
  }

  const { email, password } = req.body;
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (email !== undefined) {
    const emailStr = String(email).toLowerCase().trim();
    updates.push("email = ?");
    values.push(emailStr);
  }
  if (password !== undefined && password.length >= 6) {
    updates.push("password_hash = ?");
    values.push(bcrypt.hashSync(password, 10));
  }

  if (updates.length === 0) {
    const user = db.prepare("SELECT id, email, role, created_at FROM users WHERE id = ?").get(id);
    return res.json(user);
  }

  values.push(id);
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const user = db.prepare("SELECT id, email, role, created_at FROM users WHERE id = ?").get(id);
  res.json(user);
});

router.delete("/:id", (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const existing = db.prepare("SELECT id, role FROM users WHERE id = ?").get(id) as
    | { id: number; role: string }
    | undefined;
  if (!existing) return res.status(404).json({ error: "Usuario no encontrado" });
  if (existing.role === "admin") {
    return res.status(403).json({ error: "No se pueden eliminar usuarios administrador" });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.status(204).send();
});

export default router;
