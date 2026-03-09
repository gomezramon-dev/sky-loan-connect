import { Progress } from "@/components/progress";

const TOTAL_STEPS = 7;

interface CompletionProgressProps {
  completedSteps: number;
}

export function CompletionProgress({
  completedSteps,
}: CompletionProgressProps) {
  const percentage = Math.round((completedSteps / TOTAL_STEPS) * 100);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {completedSteps} de {TOTAL_STEPS} pasos completados
        </span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
