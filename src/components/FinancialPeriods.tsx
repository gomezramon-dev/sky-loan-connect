import { useState, useMemo } from "react";
import {
  Plus,
  X,
  FileSpreadsheet,
  Upload,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

export interface FinancialPeriod {
  id: string;
  year: string;
  type: "completo" | "parcial";
  endDate?: Date;
  estadoResultados: UploadedFile[];
  balanceGeneral: UploadedFile[];
}

interface FinancialPeriodsProps {
  periods: FinancialPeriod[];
  onChange: (periods: FinancialPeriod[]) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const FinancialPeriods = ({ periods, onChange }: FinancialPeriodsProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newType, setNewType] = useState<"completo" | "parcial">("completo");
  const [newEndDate, setNewEndDate] = useState<Date | undefined>();

  const completeYears = useMemo(
    () => periods.filter((p) => p.type === "completo"),
    [periods]
  );

  const hasPartial = useMemo(
    () => periods.some((p) => p.type === "parcial"),
    [periods]
  );

  const canAddPartial = completeYears.length >= 1;
  const canAddMore = periods.length < 3; // up to 3 periods total
  const usedYears = periods.map((p) => p.year);

  const handleAddPeriod = () => {
    if (!newYear) return;
    if (usedYears.includes(newYear)) {
      toast({
        title: "Año duplicado",
        description: `Ya existe un periodo para el año ${newYear}.`,
        variant: "destructive",
      });
      return;
    }
    if (newType === "parcial" && !newEndDate) {
      toast({
        title: "Fecha requerida",
        description: "Especifica la fecha de corte para el año parcial.",
        variant: "destructive",
      });
      return;
    }

    const period: FinancialPeriod = {
      id: crypto.randomUUID(),
      year: newYear,
      type: newType,
      endDate: newType === "parcial" ? newEndDate : undefined,
      estadoResultados: [],
      balanceGeneral: [],
    };

    onChange([...periods, period]);
    setShowAddForm(false);
    setNewYear("");
    setNewType("completo");
    setNewEndDate(undefined);
    toast({
      title: "Periodo agregado",
      description: `Año ${newYear} (${newType === "completo" ? "completo" : "parcial"}) agregado.`,
    });
  };

  const removePeriod = (id: string) => {
    const period = periods.find((p) => p.id === id);
    // Don't allow removing the last complete year if a partial exists
    if (period?.type === "completo" && completeYears.length === 1 && hasPartial) {
      toast({
        title: "No se puede eliminar",
        description: "Necesitas al menos un año completo mientras tengas un año parcial.",
        variant: "destructive",
      });
      return;
    }
    onChange(periods.filter((p) => p.id !== id));
  };

  const handleFileUpload = async (
    periodId: string,
    docType: "estadoResultados" | "balanceGeneral",
    fileList: FileList | null
  ) => {
    if (!fileList || fileList.length === 0) return;
    const key = `${periodId}-${docType}`;
    setUploading(key);
    await new Promise((r) => setTimeout(r, 600));

    const newFile: UploadedFile = {
      name: fileList[0].name,
      size: fileList[0].size,
      file: fileList[0],
    };

    onChange(
      periods.map((p) =>
        p.id === periodId
          ? { ...p, [docType]: [newFile] }
          : p
      )
    );
    setUploading(null);
    toast({
      title: "Archivo(s) cargado(s)",
      description: `${newFiles.length} archivo(s) agregado(s).`,
    });
  };

  const removeFile = (
    periodId: string,
    docType: "estadoResultados" | "balanceGeneral",
    fileIndex: number
  ) => {
    onChange(
      periods.map((p) =>
        p.id === periodId
          ? { ...p, [docType]: p[docType].filter((_, i) => i !== fileIndex) }
          : p
      )
    );
  };

  const MiniUploadZone = ({
    periodId,
    docType,
    label,
  }: {
    periodId: string;
    docType: "estadoResultados" | "balanceGeneral";
    label: string;
  }) => {
    const period = periods.find((p) => p.id === periodId)!;
    const files = period[docType];
    const key = `${periodId}-${docType}`;
    const isUploading = uploading === key;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-foreground">{label}</Label>
          {files.length > 0 && (
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          )}
        </div>

        {isUploading ? (
          <div className="flex items-center gap-2 p-3 border border-dashed border-primary rounded-lg bg-accent/30">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <label className="flex items-center gap-2 p-3 border border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all hover:bg-accent/20">
            <Upload className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Arrastra o haz clic para subir
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              accept=".xlsx,.xls,.pdf,.csv"
              onChange={(e) => handleFileUpload(periodId, docType, e.target.files)}
            />
          </label>
        )}

        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">
                  {file.name}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatSize(file.size)}
                </span>
                <button
                  onClick={() => removeFile(periodId, docType, i)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const isPeriodComplete = (p: FinancialPeriod) =>
    p.estadoResultados.length > 0 && p.balanceGeneral.length > 0;

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/40 border border-border">
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>
            <span className="font-semibold text-foreground">Mínimo:</span> 1 año
            completo.{" "}
            <span className="font-semibold text-foreground">Ideal:</span> 3 años
            completos.
          </p>
          <p>
            Puedes agregar un año parcial solo si ya tienes al menos un año
            completo.
          </p>
        </div>
      </div>

      {/* Period cards */}
      {periods.map((period) => {
        const complete = isPeriodComplete(period);
        return (
          <div
            key={period.id}
            className={cn(
              "rounded-xl border transition-all",
              complete
                ? "border-success/40 bg-success/5"
                : "border-border bg-card"
            )}
          >
            {/* Period header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                  period.type === "completo"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-500/10 text-amber-600"
                )}
              >
                {period.year.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Año {period.year}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      period.type === "completo"
                        ? "border-primary/30 text-primary"
                        : "border-amber-500/30 text-amber-600"
                    )}
                  >
                    {period.type === "completo" ? "Completo" : "Parcial"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {period.type === "completo"
                    ? `01/01/${period.year} — 31/12/${period.year}`
                    : period.endDate
                      ? `01/01/${period.year} — ${format(period.endDate, "dd/MM/yyyy")}`
                      : "Fecha de corte no definida"}
                </p>
              </div>
              {complete && (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removePeriod(period.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Upload zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              <MiniUploadZone
                periodId={period.id}
                docType="estadoResultados"
                label="Estado de Resultados"
              />
              <MiniUploadZone
                periodId={period.id}
                docType="balanceGeneral"
                label="Balance General"
              />
            </div>
          </div>
        );
      })}

      {/* Add period form / button */}
      {showAddForm ? (
        <div className="rounded-xl border border-primary/30 bg-accent/20 p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Agregar periodo
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Año</Label>
              <Input
                type="number"
                placeholder="Ej: 2024"
                min={2000}
                max={2099}
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="h-9 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <RadioGroup
                value={newType}
                onValueChange={(v) => setNewType(v as "completo" | "parcial")}
                className="flex gap-3 pt-1"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="completo" />
                  <span className="text-sm text-foreground">Completo</span>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-2",
                    canAddPartial && !hasPartial
                      ? "cursor-pointer"
                      : "opacity-40 cursor-not-allowed"
                  )}
                >
                  <RadioGroupItem
                    value="parcial"
                    disabled={!canAddPartial || hasPartial}
                  />
                  <span className="text-sm text-foreground">Parcial</span>
                </label>
              </RadioGroup>
            </div>
          </div>

          {newType === "parcial" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Fecha de corte del periodo parcial
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal h-9",
                      !newEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEndDate
                      ? format(newEndDate, "dd 'de' MMMM, yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEndDate}
                    onSelect={setNewEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddPeriod} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewYear("");
                setNewType("completo");
                setNewEndDate(undefined);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        canAddMore && (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full border-dashed gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4" />
            Agregar periodo fiscal
          </Button>
        )
      )}

      {/* Summary */}
      {periods.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <span>
            {completeYears.length} año{completeYears.length !== 1 ? "s" : ""}{" "}
            completo{completeYears.length !== 1 ? "s" : ""}
          </span>
          {hasPartial && (
            <>
              <span className="text-border">•</span>
              <span>1 año parcial</span>
            </>
          )}
          <span className="text-border">•</span>
          <span>
            {periods.filter(isPeriodComplete).length}/{periods.length}{" "}
            con documentos
          </span>
        </div>
      )}
    </div>
  );
};

export default FinancialPeriods;
