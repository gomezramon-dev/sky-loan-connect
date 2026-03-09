import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { SectionCard } from "./SectionCard";

interface CreditScoreSectionProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
}

export function CreditScoreSection({
  value,
  error,
  onChange,
}: CreditScoreSectionProps) {
  return (
    <SectionCard
      stepNumber={6}
      title="Score Crediticio"
      description="Ingresa el score del buró de crédito (300–850)"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="credit-score" className="text-xs">
            Puntaje
          </Label>
          <Input
            id="credit-score"
            type="number"
            placeholder="Ej: 720"
            min={300}
            max={850}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 bg-secondary/50"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "credit-score-error" : undefined}
          />
          {error && (
            <p id="credit-score-error" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
