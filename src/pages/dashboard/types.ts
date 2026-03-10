import type { FinancialPeriod } from "@/pages/dashboard/components/FinancialPeriods";

/** Bank statement file with metadata for extraction */
export interface BankStatementFile {
  name: string;
  size: number;
  file: File;
  bank?: string;
  year?: string;
  month?: string;
  currency?: "pesos" | "dolares";
}

/** Credit type option value */
export type CreditTypeValue =
  | "capital_trabajo"
  | "adquisicion_activos"
  | "proyectos_inversion";

/**
 * API format for bank statements (Estado de Cuenta).
 * Structure: { "BankName": { "MXN"|"USD": { "YYYYMM": "base64..." } } }
 */
export type BankStatementsPayload = Record<
  string,
  Record<string, Record<string, string>>
>;

/**
 * API format for financial statements (Estados Financieros).
 * Structure: { "YYYY": { isComplete, trimester, incomeStatement, balanceSheet } }
 */
export interface FinancialStatementYear {
  isComplete: boolean;
  trimester: number; // 0=completo, 1-4=Q1-Q4
  incomeStatement: string; // base64
  balanceSheet: string; // base64
}

export type FinancialStatementsPayload = Record<string, FinancialStatementYear>;

/** Extracted form data - ready for pipeline/API consumption */
export interface DashboardFormData {
  creditType: CreditTypeValue;
  /** Formality as number: Total=100, Parcial=75, Básica=50, Informal=0 */
  formalidad: number;
  bankStatements: BankStatementsPayload;
  financialStatements: FinancialStatementsPayload;
  experienceYears: number;
  creditScore: number;
  esgScore: number;
}

