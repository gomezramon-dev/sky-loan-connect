import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { SectionCard } from "./SectionCard";

interface ExperienceSectionProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
}

export function ExperienceSection({
  value,
  error,
  onChange,
}: ExperienceSectionProps) {
  return (
    <SectionCard
      stepNumber={5}
      title="Experiencia en el Giro"
      description="Ingresa los años de experiencia del cliente en el giro"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-xs">
            Años de experiencia
          </Label>
          <Input
            id="experience"
            type="number"
            placeholder="Ej: 5"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 bg-secondary/50"
                aria-invalid={Boolean(error)}
              aria-describedby={error ? "experience-error" : undefined}
          />
          {error && (
            <p id="experience-error" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
