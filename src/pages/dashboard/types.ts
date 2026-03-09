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

/** Formalidad option value */
export type FormalidadValue = "total" | "parcial" | "basica" | "informal";

/** Extracted form data - ready for pipeline/API consumption */
export interface DashboardFormData {
  creditType: CreditTypeValue;
  formalidad: FormalidadValue;
  bankStatements: BankStatementFile[];
  financialPeriods: FinancialPeriod[];
  experienceYears: number;
  creditScore: number;
  esgScore: number;
}

