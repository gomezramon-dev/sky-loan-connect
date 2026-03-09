import { FileSpreadsheet, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Badge } from "@/components/badge";
import { SectionCard } from "./SectionCard";
import { MONTHS } from "../constants";
import { ACCEPTED_FILE_TYPES } from "../constants";
import type { BankStatementFile } from "../types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface BankStatementSectionProps {
  files: BankStatementFile[];
  uploading: boolean;
  onUpload: (files: BankStatementFile[]) => void;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    field: "bank" | "year" | "month" | "currency",
    value: string
  ) => void;
  onUploadingChange: (uploading: boolean) => void;
  onUploadSuccess?: (count: number) => void;
}

export function BankStatementSection({
  files,
  uploading,
  onUpload,
  onRemove,
  onUpdate,
  onUploadingChange,
  onUploadSuccess,
}: BankStatementSectionProps) {
  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onUploadingChange(true);
    await new Promise((r) => setTimeout(r, 800));

    const newFiles: BankStatementFile[] = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size,
      file: f,
    }));
    onUpload(newFiles);
    onUploadingChange(false);
    onUploadSuccess?.(newFiles.length);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files.length) return;
    onUploadingChange(true);
    await new Promise((r) => setTimeout(r, 800));
    const newFiles: BankStatementFile[] = Array.from(
      e.dataTransfer.files
    ).map((f) => ({
      name: f.name,
      size: f.size,
      file: f,
    }));
    onUpload(newFiles);
    onUploadingChange(false);
    onUploadSuccess?.(newFiles.length);
  };

  return (
    <SectionCard
      stepNumber={3}
      title="Estado de Cuenta"
      description="Sube los estados de cuenta bancarios"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">
            Archivos del Estado de Cuenta
          </Label>
          {uploading ? (
            <div className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-primary rounded-xl bg-accent/30">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando archivo(s)...</p>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-5 text-center transition-all hover:bg-accent/20 cursor-pointer"
            >
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Arrastra o haz clic para subir
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {ACCEPTED_FILE_TYPES} — múltiples archivos permitidos
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </label>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Detalle por archivo
            </p>
            {files.map((file, i) => {
              const isComplete =
                file.bank && file.year && file.month && file.currency;
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-all ${
                    isComplete
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    {isComplete && (
                      <Badge
                        variant="outline"
                        className="border-success/50 text-success bg-success/10 text-xs shrink-0"
                      >
                        Completo
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => onRemove(i)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Banco
                      </Label>
                      <Input
                        placeholder="Ej: BBVA"
                        value={file.bank ?? ""}
                        onChange={(e) => onUpdate(i, "bank", e.target.value)}
                        className="h-9 bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Año
                      </Label>
                      <Input
                        type="number"
                        placeholder="Ej: 2024"
                        min={2000}
                        max={2099}
                        value={file.year ?? ""}
                        onChange={(e) => onUpdate(i, "year", e.target.value)}
                        className="h-9 bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Mes
                      </Label>
                      <Select
                        value={file.month ?? ""}
                        onValueChange={(v) => onUpdate(i, "month", v)}
                      >
                        <SelectTrigger className="h-9 bg-secondary/50">
                          <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Moneda
                      </Label>
                      <Select
                        value={file.currency ?? ""}
                        onValueChange={(v) => onUpdate(i, "currency", v)}
                      >
                        <SelectTrigger className="h-9 bg-secondary/50">
                          <SelectValue placeholder="Moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pesos">MX Pesos (MXN)</SelectItem>
                          <SelectItem value="dolares">US Dólares (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
