import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "sky-loan.db");

export const db = new Database(dbPath) as InstanceType<typeof Database>;

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'base' CHECK (role IN ('base', 'admin')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
`);

// Seed admin user if not exists (admin@sky-loan.com / Admin123!)
export function seedAdminIfNeeded() {
  const adminEmail = "admin@sky-loan.com";
  const adminPassword = "Admin123!";
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existing) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run(
      adminEmail,
      hash
    );
    console.log("Admin user seeded: admin@sky-loan.com / Admin123!");
  }
}
