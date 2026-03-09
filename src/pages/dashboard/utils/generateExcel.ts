import * as XLSX from "xlsx";
import type { DashboardFormData } from "../types";
import { CREDIT_TYPES, FORMALIDAD_TYPES } from "../constants";
import { MONTHS } from "../constants";

/**
 * Generates Excel file from form data.
 * Extracted for testability and reuse.
 */
export function generateExcelFromFormData(data: DashboardFormData): void {
  const creditLabel =
    CREDIT_TYPES.find((t) => t.value === data.creditType)?.label ?? data.creditType;
  const formalidadLabel =
    FORMALIDAD_TYPES.find((t) => t.value === data.formalidad)?.label ??
    data.formalidad;
  const score = data.creditScore;

  const headerData: (string | number)[][] = [
    ["SOLICITUD DE CRÉDITO"],
    [],
    ["Tipo de Solicitud", creditLabel],
    ["Formalidad Financiera", formalidadLabel],
    ["Experiencia en el Giro", `${data.experienceYears} año(s)`],
    ["Score Crediticio", score],
    ["Puntaje ESG", data.esgScore],
    [
      "Nivel de Riesgo",
      score >= 700 ? "Bajo" : score >= 600 ? "Medio" : "Alto",
    ],
    [],
    ["DOCUMENTOS ADJUNTOS"],
    [
      "Estado de Cuenta",
      data.bankStatements
        .map((f) => {
          const monthLabel =
            MONTHS.find((m) => m.value === f.month)?.label ?? f.month;
          return `${f.name} (${f.bank} - ${monthLabel} ${f.year})`;
        })
        .join(", "),
    ],
    ...data.financialPeriods.flatMap((p) => [
      [
        `Estado de Resultados (${p.year} - ${p.type})`,
        p.estadoResultados.map((f) => f.name).join(", "),
      ],
      [
        `Balance General (${p.year} - ${p.type})`,
        p.balanceGeneral.map((f) => f.name).join(", "),
      ],
    ]),
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
    ["Formalidad Financiera", formalidadLabel, "Registrado"],
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
