import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { SectionCard } from "./SectionCard";
import { CREDIT_TYPES } from "../constants";

interface CreditTypeSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function CreditTypeSection({ value, onChange }: CreditTypeSectionProps) {
  return (
    <SectionCard
      stepNumber={1}
      title="Tipo de Solicitud Crediticia"
      description="Selecciona el tipo de financiamiento que necesitas"
    >
      <RadioGroup value={value} onValueChange={onChange}>
        {CREDIT_TYPES.map((type) => (
          <label
            key={type.value}
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              value === type.value
                ? "border-primary bg-accent/50"
                : "border-border hover:border-primary/40 hover:bg-accent/20"
            }`}
          >
            <RadioGroupItem value={type.value} className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {type.description}
              </p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </SectionCard>
  );
}
