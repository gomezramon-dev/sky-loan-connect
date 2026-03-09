import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { SectionCard } from "./SectionCard";

interface EsgScoreSectionProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
}

export function EsgScoreSection({
  value,
  error,
  onChange,
}: EsgScoreSectionProps) {
  return (
    <SectionCard
      stepNumber={7}
      title="Puntaje ESG"
      description="Ingresa el puntaje ESG (0–100)"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="esg-score" className="text-xs">
            Puntaje
          </Label>
          <Input
            id="esg-score"
            type="number"
            placeholder="Ej: 75"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 bg-secondary/50"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "esg-score-error" : undefined}
          />
          {error && (
            <p id="esg-score-error" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
