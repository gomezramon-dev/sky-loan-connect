import "dotenv/config";
import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import { db, seedAdminIfNeeded } from "./db.js";

const app = express();
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

type BankStatementsPayload = Record<string, Record<string, string>>;

/**
 * POST /kickoff-excel-generation
 * Recibe un JSON con bank statements en formato:
 * {
 *   "BBVA": {
 *     "202401MXN": "base64...",
 *     "202402MXN": "base64...",
 *     "202403MXN": "base64..."
 *   },
 *   "Santander": { ... }
 * }
 * Extrae los bank statements y los envía a /extract-bank-statements del worker
 */
app.post("/kickoff-excel-generation", async (req: Request, res: Response) => {
  try {
    const payload = req.body as unknown;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({
        error: "Invalid payload",
        message: "Expected a JSON object with bank statements",
      });
    }

    // Extraer bank statements del payload
    // El formato esperado es { "BANCO": { "periodo": base64, ... }, ... }
    const bankStatements: BankStatementsPayload = {};
    for (const [bankName, periods] of Object.entries(payload)) {
      if (periods && typeof periods === "object" && !Array.isArray(periods)) {
        bankStatements[bankName] = periods as Record<string, string>;
      }
    }

    if (Object.keys(bankStatements).length === 0) {
      return res.status(400).json({
        error: "No bank statements found",
        message:
          "Payload must contain bank names as keys with period-base64 mappings",
      });
    }

    // Llamar al worker Python /extract-bank-statements
    const workerResponse = await fetch(`${WORKER_URL}/extract-bank-statements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bank_statements: bankStatements }),
    });

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text();
      console.error("Worker error:", errorText);
      return res.status(502).json({
        error: "Worker error",
        message: "Failed to extract bank statements",
        details: errorText,
      });
    }

    const extractedData = (await workerResponse.json()) as Record<string, unknown>;

    // TODO: Aquí iría la lógica para generar el Excel con los datos extraídos
    return res.json({
      success: true,
      message: "Excel generation kicked off",
      extracted_data: extractedData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in kickoff-excel-generation:", error);
    return res.status(500).json({
      error: "Internal server error",
      message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
