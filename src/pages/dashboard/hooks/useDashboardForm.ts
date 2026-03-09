import { useState, useCallback, useMemo } from "react";
import type { FinancialPeriod } from "@/pages/dashboard/components/FinancialPeriods";
import type {
  BankStatementFile,
  DashboardFormData,
  CreditTypeValue,
  FormalidadValue,
} from "../types";

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
   * Call only when isComplete is true.
   */
  const getFormData = useCallback((): DashboardFormData | null => {
    if (!isComplete) return null;

    return {
      creditType: creditType as CreditTypeValue,
      formalidad: formalidad as FormalidadValue,
      bankStatements,
      financialPeriods,
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
