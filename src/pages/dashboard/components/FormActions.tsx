import { FileSpreadsheet, Loader2, CheckCircle, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";

interface FormActionsProps {
  isComplete: boolean;
  generating: boolean;
  generated: boolean;
  onGenerate: () => void;
  onReset: () => void;
}

export function FormActions({
  isComplete,
  generating,
  generated,
  onGenerate,
  onReset,
}: FormActionsProps) {
  return (
    <div className="pt-2 space-y-4">
      <Button
        onClick={onGenerate}
        disabled={!isComplete || generating}
        className="w-full h-12 sky-gradient text-white font-semibold hover:opacity-90 transition-opacity border-0 text-base gap-2 disabled:opacity-40"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando documento...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-5 h-5" />
            Generar Documento Excel
          </>
        )}
      </Button>

      {generated && (
        <Card className="border-success/30 bg-success/5 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Documento generado exitosamente
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  El archivo se descargó automáticamente
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerate}
                  className="gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar de nuevo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="gap-1 text-muted-foreground"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Nueva solicitud
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
