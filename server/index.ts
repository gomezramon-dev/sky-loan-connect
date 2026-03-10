import "dotenv/config";
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import { db, seedAdminIfNeeded } from "./db.js";

const app = express();
const OUTPUT_DIR = path.join(process.cwd(), "data", "output");
const MASTER_FILE = path.join(OUTPUT_DIR, "master_cliente.xlsx");
const PORT = process.env.PORT ?? 8080;
const WORKER_URL = process.env.WORKER_URL ?? "http://localhost:8081";

app.use(express.json({ limit: "50mb" }));
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Auth routes (no auth required)
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

// Initialize DB and seed admin
seedAdminIfNeeded();

// Asegurar que existe el directorio de output para master
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Bank statements (Estado de Cuenta) format.
 * { "BankName": { "MXN"|"USD": { "YYYYMM": "base64..." } } }
 */
type BankStatementsPayload = Record<string, Record<string, Record<string, string>>>;

/**
 * Financial statements (Estados Financieros) format.
 * { "YYYY": { isComplete, trimester, incomeStatement, balanceSheet } }
 */
interface FinancialStatementYear {
  isComplete: boolean;
  trimester: number;
  incomeStatement: string;
  balanceSheet: string;
}

type FinancialStatementsPayload = Record<string, FinancialStatementYear>;

interface MasterGenerationPayload {
  creditType: "capital_trabajo" | "adquisicion_activos" | "proyectos_inversion";
  formalidad: number;
  bankStatements: BankStatementsPayload;
  financialStatements: FinancialStatementsPayload;
  experienceYears: number;
  creditScore: number;
  esgScore: number;
}

/**
 * POST /kickoff-master-generation
 * Envía el payload al worker para generar master_cliente.xlsx.
 * Acepta: creditType, formalidad, bankStatements, financialStatements, experienceYears, creditScore, esgScore.
 * - bankStatements: { "BankName": { "MXN"|"USD": { "YYYYMM": "base64..." } } }
 * - financialStatements: { "YYYY": { isComplete, trimester, incomeStatement, balanceSheet } }
 */
app.post("/kickoff-master-generation", async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown;
    if (!body || typeof body !== "object") {
      return res.status(400).json({
        error: "Payload inválido",
        message:
          "Se requiere un objeto JSON con creditType, formalidad, bankStatements, financialStatements, experienceYears, creditScore, esgScore",
      });
    }

    const payload = body as MasterGenerationPayload;
    const {
      creditType,
      formalidad,
      bankStatements,
      financialStatements,
      experienceYears,
      creditScore,
      esgScore,
    } = payload;

    if (
      !creditType ||
      formalidad == null ||
      experienceYears == null ||
      creditScore == null ||
      esgScore == null
    ) {
      return res.status(400).json({
        error: "Campos requeridos faltantes",
        message:
          "creditType, formalidad, experienceYears, creditScore, esgScore son obligatorios",
      });
    }

    if (typeof bankStatements !== "object" || bankStatements === null) {
      return res.status(400).json({
        error: "bankStatements inválido",
        message: "bankStatements debe ser un objeto (puede estar vacío)",
      });
    }

    if (typeof financialStatements !== "object" || financialStatements === null) {
      return res.status(400).json({
        error: "financialStatements inválido",
        message: "financialStatements debe ser un objeto (puede estar vacío)",
      });
    }

    const validTypes = ["capital_trabajo", "adquisicion_activos", "proyectos_inversion"];
    if (!validTypes.includes(creditType)) {
      return res.status(400).json({
        error: "creditType inválido",
        message: `Debe ser uno de: ${validTypes.join(", ")}`,
      });
    }

    const workerPayload = {
      creditType,
      formalidad,
      bankStatements,
      financialStatements,
      experienceYears,
      creditScore,
      esgScore,
    };

    const workerResponse = await fetch(`${WORKER_URL}/generate-master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workerPayload),
    });

    if (!workerResponse.ok) {
      const errData = (await workerResponse.json().catch(() => ({}))) as { error?: string };
      return res.status(502).json({
        error: "Error del worker",
        message: errData.error ?? "No se pudo generar el master",
      });
    }

    const result = (await workerResponse.json()) as { success?: boolean; file_base64?: string };
    if (!result.success || !result.file_base64) {
      return res.status(502).json({
        error: "Respuesta inválida del worker",
        message: "No se recibió el archivo generado",
      });
    }

    const buffer = Buffer.from(result.file_base64, "base64");
    fs.writeFileSync(MASTER_FILE, buffer);

    return res.json({
      success: true,
      message: "Master generado correctamente",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error en kickoff-master-generation:", error);
    return res.status(500).json({
      error: "Internal server error",
      message,
    });
  }
});

/**
 * GET /get-master
 * Descarga el archivo master_cliente.xlsx generado.
 */
app.get("/get-master", (_req: Request, res: Response) => {
  if (!fs.existsSync(MASTER_FILE)) {
    return res.status(404).json({
      error: "Archivo no encontrado",
      message: "Ejecuta primero kickoff-master-generation para generar el master",
    });
  }
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="master_cliente.xlsx"');
  res.sendFile(MASTER_FILE);
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
