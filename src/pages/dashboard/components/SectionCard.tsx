import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card";

interface SectionCardProps {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

/** Wrapper for consistent section layout with step indicator */
export function SectionCard({
  stepNumber,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full sky-gradient flex items-center justify-center text-xs font-bold text-white">
            {stepNumber}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
