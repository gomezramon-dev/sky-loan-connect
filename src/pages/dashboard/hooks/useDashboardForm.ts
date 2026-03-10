import { useState, useCallback, useMemo } from "react";
import type { FinancialPeriod } from "@/pages/dashboard/components/FinancialPeriods";
import type {
  BankStatementFile,
  DashboardFormData,
  CreditTypeValue,
  BankStatementsPayload,
  FinancialStatementsPayload,
} from "../types";
import { FORMALIDAD_TO_NUMBER } from "../constants";

/** Read a File as base64 string */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64 ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Map currency from form to API (MXN/USD) */
function toApiCurrency(c: "pesos" | "dolares" | undefined): string {
  return c === "dolares" ? "USD" : "MXN";
}

/** Derive trimester from FinancialPeriod (0=completo, 1-4=Q1-Q4) */
function getTrimester(period: FinancialPeriod): number {
  if (period.type === "completo") return 0;
  if (!period.endDate) return 0;
  const month = period.endDate.getMonth(); // 0-11
  if (month <= 2) return 1; // Q1 (marzo)
  if (month <= 5) return 2; // Q2 (junio)
  if (month <= 8) return 3; // Q3 (septiembre)
  return 4; // Q4 (diciembre)
}

const EXPERIENCE_MIN = 0;
const EXPERIENCE_MAX = 100;
const CREDIT_SCORE_MIN = 300;
const CREDIT_SCORE_MAX = 850;
const ESG_SCORE_MIN = 0;
const ESG_SCORE_MAX = 100;

export function useDashboardForm() {
  const [creditType, setCreditType] = useState<string>("");
  const [formalidad, setFormalidad] = useState<string>("");
  const [bankStatements, setBankStatements] = useState<BankStatementFile[]>([]);
  const [financialPeriods, setFinancialPeriods] = useState<FinancialPeriod[]>([]);
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [experienceError, setExperienceError] = useState<string>("");
  const [creditScore, setCreditScore] = useState<string>("");
  const [creditScoreError, setCreditScoreError] = useState<string>("");
  const [esgScore, setEsgScore] = useState<string>("");
  const [esgScoreError, setEsgScoreError] = useState<string>("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const bankStatementsComplete = useMemo(() => {
    return (
      bankStatements.length > 0 &&
      bankStatements.every((f) => f.bank && f.year && f.month && f.currency)
    );
  }, [bankStatements]);

  const financialsComplete = useMemo(() => {
    const completeYears = financialPeriods.filter((p) => p.type === "completo");
    if (completeYears.length === 0) return false;
    return financialPeriods.every(
      (p) => p.estadoResultados.length > 0 && p.balanceGeneral.length > 0
    );
  }, [financialPeriods]);

  const isComplete = useMemo(() => {
    return (
      Boolean(creditType) &&
      Boolean(formalidad) &&
      bankStatementsComplete &&
      financialsComplete &&
      Boolean(experienceYears) &&
      !experienceError &&
      Boolean(creditScore) &&
      !creditScoreError &&
      Boolean(esgScore) &&
      !esgScoreError
    );
  }, [
    creditType,
    formalidad,
    bankStatementsComplete,
    financialsComplete,
    experienceYears,
    experienceError,
    creditScore,
    creditScoreError,
    esgScore,
    esgScoreError,
  ]);

  const completionSteps = useMemo(() => {
    let done = 0;
    if (creditType) done++;
    if (formalidad) done++;
    if (bankStatementsComplete) done++;
    if (financialsComplete) done++;
    if (experienceYears && !experienceError) done++;
    if (creditScore && !creditScoreError) done++;
    if (esgScore && !esgScoreError) done++;
    return done;
  }, [
    creditType,
    formalidad,
    bankStatementsComplete,
    financialsComplete,
    experienceYears,
    experienceError,
    creditScore,
    creditScoreError,
    esgScore,
    esgScoreError,
  ]);

  const setCreditTypeAndResetGenerated = useCallback((value: string) => {
    setCreditType(value);
    setGenerated(false);
  }, []);

  const setFormalidadAndResetGenerated = useCallback((value: string) => {
    setFormalidad(value);
    setGenerated(false);
  }, []);

  const validateExperience = useCallback((value: string) => {
    setExperienceYears(value);
    const num = Number(value);
    if (!value) {
      setExperienceError("");
      return;
    }
    if (isNaN(num) || num < EXPERIENCE_MIN || num > EXPERIENCE_MAX) {
      setExperienceError(
        `La experiencia debe estar entre ${EXPERIENCE_MIN} y ${EXPERIENCE_MAX} años`
      );
    } else {
      setExperienceError("");
    }
  }, []);

  const validateCreditScore = useCallback((value: string) => {
    setCreditScore(value);
    const num = Number(value);
    if (!value) {
      setCreditScoreError("");
      return;
    }
    if (isNaN(num) || num < CREDIT_SCORE_MIN || num > CREDIT_SCORE_MAX) {
      setCreditScoreError(
        `El score debe estar entre ${CREDIT_SCORE_MIN} y ${CREDIT_SCORE_MAX}`
      );
    } else {
      setCreditScoreError("");
    }
  }, []);

  const validateEsgScore = useCallback((value: string) => {
    setEsgScore(value);
    const num = Number(value);
    if (!value) {
      setEsgScoreError("");
      return;
    }
    if (isNaN(num) || num < ESG_SCORE_MIN || num > ESG_SCORE_MAX) {
      setEsgScoreError(
        `El puntaje ESG debe estar entre ${ESG_SCORE_MIN} y ${ESG_SCORE_MAX}`
      );
    } else {
      setEsgScoreError("");
    }
  }, []);

  const updateBankStatementFile = useCallback(
    (
      index: number,
      field: "bank" | "year" | "month" | "currency",
      value: string
    ) => {
      setBankStatements((prev) =>
        prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
      );
    },
    []
  );

  const removeBankStatement = useCallback((index: number) => {
    setBankStatements((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addBankStatements = useCallback((files: BankStatementFile[]) => {
    setBankStatements((prev) => [...prev, ...files]);
  }, []);

  const reset = useCallback(() => {
    setCreditType("");
    setFormalidad("");
    setBankStatements([]);
    setFinancialPeriods([]);
    setExperienceYears("");
    setExperienceError("");
    setCreditScore("");
    setCreditScoreError("");
    setEsgScore("");
    setEsgScoreError("");
    setGenerated(false);
  }, []);

  /**
   * Returns structured form data for extraction/pipeline consumption.
   * Transforms bankStatements and financialPeriods to API format (base64).
   * Call only when isComplete is true.
   */
  const getFormData = useCallback(async (): Promise<DashboardFormData | null> => {
    if (!isComplete) return null;

    const bankStatementsPayload: BankStatementsPayload = {};
    for (const f of bankStatements) {
      if (!f.bank || !f.year || !f.month || !f.currency) continue;
      const bank = f.bank.trim();
      const currency = toApiCurrency(f.currency);
      const periodKey = `${f.year}${f.month}`;
      if (!bankStatementsPayload[bank]) {
        bankStatementsPayload[bank] = {};
      }
      if (!bankStatementsPayload[bank][currency]) {
        bankStatementsPayload[bank][currency] = {};
      }
      bankStatementsPayload[bank][currency][periodKey] = await fileToBase64(f.file);
    }

    const financialStatementsPayload: FinancialStatementsPayload = {};
    for (const p of financialPeriods) {
      if (p.estadoResultados.length === 0 || p.balanceGeneral.length === 0) continue;
      const year = p.year;
      financialStatementsPayload[year] = {
        isComplete: p.type === "completo",
        trimester: getTrimester(p),
        incomeStatement: await fileToBase64(p.estadoResultados[0].file),
        balanceSheet: await fileToBase64(p.balanceGeneral[0].file),
      };
    }

    return {
      creditType: creditType as CreditTypeValue,
      formalidad: FORMALIDAD_TO_NUMBER[formalidad] ?? 0,
      bankStatements: bankStatementsPayload,
      financialStatements: financialStatementsPayload,
      experienceYears: Number(experienceYears),
      creditScore: Number(creditScore),
      esgScore: Number(esgScore),
    };
  }, [
    isComplete,
    creditType,
    formalidad,
    bankStatements,
    financialPeriods,
    experienceYears,
    creditScore,
    esgScore,
  ]);

  return {
    // State
    creditType,
    formalidad,
    bankStatements,
    financialPeriods,
    experienceYears,
    creditScore,
    esgScore,
    uploading,
    generating,
    generated,

    // Validation
    experienceError,
    creditScoreError,
    esgScoreError,
    bankStatementsComplete,
    financialsComplete,
    isComplete,
    completionSteps,

    // Setters
    setCreditType: setCreditTypeAndResetGenerated,
    setFormalidad: setFormalidadAndResetGenerated,
    setFinancialPeriods,
    setGenerating,
    setGenerated,

    // Actions
    validateExperience,
    validateCreditScore,
    validateEsgScore,
    updateBankStatementFile,
    removeBankStatement,
    addBankStatements,
    setUploading,
    reset,

    // Extraction
    getFormData,
  };
}
