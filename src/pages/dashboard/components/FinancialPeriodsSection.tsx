import FinancialPeriods from "@/pages/dashboard/components/FinancialPeriods";
import type { FinancialPeriod } from "@/pages/dashboard/components/FinancialPeriods";
import { SectionCard } from "./SectionCard";

interface FinancialPeriodsSectionProps {
  periods: FinancialPeriod[];
  onChange: (periods: FinancialPeriod[]) => void;
}

export function FinancialPeriodsSection({
  periods,
  onChange,
}: FinancialPeriodsSectionProps) {
  return (
    <SectionCard
      stepNumber={4}
      title="Estados Financieros"
      description="Agrega los periodos fiscales con su Estado de Resultados y Balance General"
    >
      <FinancialPeriods periods={periods} onChange={onChange} />
    </SectionCard>
  );
}
