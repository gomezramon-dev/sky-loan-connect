import * as XLSX from "xlsx";
import type { DashboardFormData } from "../types";
import { CREDIT_TYPES, FORMALIDAD_TYPES, FORMALIDAD_TO_NUMBER } from "../constants";
import { MONTHS } from "../constants";

/** Format bankStatements payload for display (Bank - YYYYMM Currency) */
function formatBankStatementsForDisplay(
  bankStatements: DashboardFormData["bankStatements"]
): string {
  const parts: string[] = [];
  for (const [bank, currencies] of Object.entries(bankStatements)) {
    for (const [currency, periods] of Object.entries(currencies)) {
      for (const period of Object.keys(periods)) {
        const year = period.slice(0, 4);
        const month = period.slice(4, 6);
        const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? month;
        parts.push(`${bank} - ${monthLabel} ${year} (${currency})`);
      }
    }
  }
  return parts.join(", ") || "Ninguno";
}

/** Format financialStatements payload for display */
function formatFinancialStatementsForDisplay(
  financialStatements: DashboardFormData["financialStatements"]
): (string | number)[][] {
  const rows: (string | number)[][] = [];
  for (const [year, data] of Object.entries(financialStatements)) {
    const typeLabel = data.isComplete ? "completo" : `parcial (Q${data.trimester})`;
    rows.push([`Estado de Resultados (${year} - ${typeLabel})`, "Adjunto"]);
    rows.push([`Balance General (${year} - ${typeLabel})`, "Adjunto"]);
  }
  return rows;
}

/**
 * Generates Excel file from form data.
 * Extracted for testability and reuse.
 */
export function generateExcelFromFormData(data: DashboardFormData): void {
  const creditLabel =
    CREDIT_TYPES.find((t) => t.value === data.creditType)?.label ?? data.creditType;
  const formalidadLabel =
    FORMALIDAD_TYPES.find((t) => FORMALIDAD_TO_NUMBER[t.value] === data.formalidad)?.label ??
    String(data.formalidad);
  const score = data.creditScore;

  const headerData: (string | number)[][] = [
    ["SOLICITUD DE CRÉDITO"],
    [],
    ["Tipo de Solicitud", creditLabel],
    ["Formalidad Financiera", `${formalidadLabel} (${data.formalidad})`],
    ["Experiencia en el Giro", `${data.experienceYears} año(s)`],
    ["Score Crediticio", score],
    ["Puntaje ESG", data.esgScore],
    [
      "Nivel de Riesgo",
      score >= 700 ? "Bajo" : score >= 600 ? "Medio" : "Alto",
    ],
    [],
    ["DOCUMENTOS ADJUNTOS"],
    ["Estado de Cuenta", formatBankStatementsForDisplay(data.bankStatements)],
    ...formatFinancialStatementsForDisplay(data.financialStatements),
    [],
    ["ANÁLISIS PRELIMINAR"],
    ["Parámetro", "Valor", "Evaluación"],
    [
      "Score Crediticio",
      score,
      score >= 700 ? "Favorable" : score >= 600 ? "Aceptable" : "Requiere revisión",
    ],
    [
      "Puntaje ESG",
      data.esgScore,
      data.esgScore >= 70
        ? "Favorable"
        : data.esgScore >= 50
          ? "Aceptable"
          : "Requiere revisión",
    ],
    ["Formalidad Financiera", `${formalidadLabel} (${data.formalidad})`, "Registrado"],
    ["Experiencia en el Giro", `${data.experienceYears} año(s)`, "Registrado"],
    ["Documentación Financiera", "Completa", "✓"],
    ["Tipo de Crédito", creditLabel, "Registrado"],
    [],
    ["RECOMENDACIÓN"],
    [
      "",
      score >= 700
        ? "Aprobación sugerida - Cliente con buen historial crediticio"
        : score >= 600
          ? "Revisión adicional recomendada"
          : "Se requiere análisis detallado de riesgo",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(headerData);
  ws["!cols"] = [{ wch: 25 }, { wch: 40 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Solicitud");
  XLSX.writeFile(
    wb,
    `Solicitud_Credito_${creditLabel.replace(/\s/g, "_")}.xlsx`
  );
}
