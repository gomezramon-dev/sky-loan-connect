import { useState, useMemo, useCallback } from "react";
import {
  Building2,
  LogOut,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  X,
  Download,
  Loader2,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface DashboardProps {
  onLogout: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  file: File;
  banco?: string;
  moneda?: "pesos" | "dolares";
}

const CREDIT_TYPES = [
  {
    value: "capital_trabajo",
    label: "Capital de Trabajo",
    description: "Financiamiento para operaciones del día a día",
  },
  {
    value: "adquisicion_activos",
    label: "Adquisición de Activos",
    description: "Compra de maquinaria, equipo o inmuebles",
  },
  {
    value: "proyectos_inversion",
    label: "Proyectos de Inversión y Crecimiento",
    description: "Expansión, nuevos mercados o líneas de negocio",
  },
];

const Dashboard = ({ onLogout }: DashboardProps) => {
  const { toast } = useToast();

  const [creditType, setCreditType] = useState("");
  const [estadoCuentaAnio, setEstadoCuentaAnio] = useState("");
  const [estadoCuenta, setEstadoCuenta] = useState<UploadedFile[]>([]);
  const [estadoResultados, setEstadoResultados] = useState<UploadedFile[]>([]);
  const [balanceGeneral, setBalanceGeneral] = useState<UploadedFile[]>([]);
  const [creditScore, setCreditScore] = useState("");
  const [creditScoreError, setCreditScoreError] = useState("");

  const [uploading, setUploading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const estadoCuentaComplete = useMemo(() => {
    return estadoCuenta.length > 0 && estadoCuentaAnio && estadoCuenta.every((f) => f.banco && f.moneda);
  }, [estadoCuenta, estadoCuentaAnio]);

  const isComplete = useMemo(() => {
    return (
      creditType &&
      estadoCuentaComplete &&
      estadoResultados.length > 0 &&
      balanceGeneral.length > 0 &&
      creditScore &&
      !creditScoreError
    );
  }, [creditType, estadoCuentaComplete, estadoResultados, balanceGeneral, creditScore, creditScoreError]);

  const completionSteps = useMemo(() => {
    let done = 0;
    if (creditType) done++;
    if (estadoCuentaComplete) done++;
    if (estadoResultados.length > 0) done++;
    if (balanceGeneral.length > 0) done++;
    if (creditScore && !creditScoreError) done++;
    return done;
  }, [creditType, estadoCuentaComplete, estadoResultados, balanceGeneral, creditScore, creditScoreError]);

  type FileZone = "cuenta" | "estado" | "balance";

  const setterMap: Record<FileZone, React.Dispatch<React.SetStateAction<UploadedFile[]>>> = {
    cuenta: setEstadoCuenta,
    estado: setEstadoResultados,
    balance: setBalanceGeneral,
  };

  const getterMap: Record<FileZone, UploadedFile[]> = {
    cuenta: estadoCuenta,
    estado: estadoResultados,
    balance: balanceGeneral,
  };

  const handleFileUpload = useCallback(
    async (type: FileZone, fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setUploading(type);
      await new Promise((r) => setTimeout(r, 800));

      const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({ name: f.name, size: f.size, file: f }));
      setterMap[type]((prev) => [...prev, ...newFiles]);
      setUploading(null);

      toast({
        title: "Archivo(s) cargado(s)",
        description: `${newFiles.length} archivo(s) agregado(s) correctamente.`,
      });
    },
    [toast],
  );

  const removeFile = (type: FileZone, index: number) => {
    setterMap[type]((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCuentaFile = (index: number, field: "banco" | "moneda", value: string) => {
    setEstadoCuenta((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const handleDrop = (type: FileZone, e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFileUpload(type, e.dataTransfer.files);
  };

  const validateScore = (value: string) => {
    setCreditScore(value);
    const num = Number(value);
    if (!value) setCreditScoreError("");
    else if (isNaN(num) || num < 300 || num > 850) setCreditScoreError("El score debe estar entre 300 y 850");
    else setCreditScoreError("");
  };

  const handleGenerate = async () => {
    if (!isComplete) return;
    setGenerating(true);
    toast({ title: "Generando documento...", description: "Procesando la información proporcionada." });
    await new Promise((r) => setTimeout(r, 2000));

    const creditLabel = CREDIT_TYPES.find((t) => t.value === creditType)?.label || creditType;
    const score = Number(creditScore);

    const headerData: (string | number)[][] = [
      ["SOLICITUD DE CRÉDITO"],
      [],
      ["Tipo de Solicitud", creditLabel],
      ["Score Crediticio", score],
      ["Nivel de Riesgo", score >= 700 ? "Bajo" : score >= 600 ? "Medio" : "Alto"],
      [],
      ["DOCUMENTOS ADJUNTOS"],
      ["Estado de Cuenta", estadoCuenta.map((f) => f.name).join(", ")],
      ["Estado de Resultados", estadoResultados.map((f) => f.name).join(", ")],
      ["Balance General", balanceGeneral.map((f) => f.name).join(", ")],
      [],
      ["ANÁLISIS PRELIMINAR"],
      ["Parámetro", "Valor", "Evaluación"],
      ["Score Crediticio", score, score >= 700 ? "Favorable" : score >= 600 ? "Aceptable" : "Requiere revisión"],
      ["Documentación Financiera", "Completa", "✓"],
      ["Tipo de Crédito", creditLabel, "Registrado"],
      [],
      ["RECOMENDACIÓN"],
      [
        "",
        score >= 700
          ? "Aprobación sugerida - Cliente con buen historial crediticio"
          : score >= 600
            ? "Revisión adicional recomendada"
            : "Se requiere análisis detallado de riesgo",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(headerData);
    ws["!cols"] = [{ wch: 25 }, { wch: 40 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Solicitud");
    XLSX.writeFile(wb, `Solicitud_Credito_${creditLabel.replace(/\s/g, "_")}.xlsx`);

    setGenerating(false);
    setGenerated(true);
    toast({ title: "¡Documento generado!", description: "El archivo Excel se descargó automáticamente." });
  };

  const handleReset = () => {
    setCreditType("");
    setEstadoCuentaAnio("");
    setEstadoCuenta([]);
    setEstadoResultados([]);
    setBalanceGeneral([]);
    setCreditScore("");
    setCreditScoreError("");
    setGenerated(false);
    toast({ title: "Formulario reiniciado", description: "Puedes iniciar una nueva solicitud." });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const FileUploadZone = ({ type, label }: { type: FileZone; label: string }) => {
    const files = getterMap[type];
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">{label}</Label>
        {uploading === type ? (
          <div className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-primary rounded-xl bg-accent/30">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando archivo(s)...</p>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(type, e)}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-5 text-center transition-all hover:bg-accent/20 cursor-pointer"
          >
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Arrastra o haz clic para subir</p>
              <p className="text-xs text-muted-foreground/70">
                .xlsx, .xls, .pdf, .csv — múltiples archivos permitidos
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".xlsx,.xls,.pdf,.csv"
                onChange={(e) => handleFileUpload(type, e.target.files)}
              />
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg sky-gradient flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">MasterHelper</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Generador de MasterCliente (parte cuantitativa)</h1>
          <p className="text-sm text-muted-foreground mt-1">Completa la información para generar el documento Excel</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completionSteps} de 5 pasos completados</span>
              <span>{Math.round((completionSteps / 5) * 100)}%</span>
            </div>
            <Progress value={(completionSteps / 5) * 100} className="h-2" />
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Credit Type */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full sky-gradient flex items-center justify-center text-xs font-bold text-white">
                  1
                </div>
                <CardTitle className="text-base">Tipo de Solicitud Crediticia</CardTitle>
              </div>
              <CardDescription>Selecciona el tipo de financiamiento que necesitas</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={creditType}
                onValueChange={(v) => {
                  setCreditType(v);
                  if (generated) setGenerated(false);
                }}
              >
                {CREDIT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      creditType === type.value
                        ? "border-primary bg-accent/50"
                        : "border-border hover:border-primary/40 hover:bg-accent/20"
                    }`}
                  >
                    <RadioGroupItem value={type.value} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 2. Estado de Cuenta */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full sky-gradient flex items-center justify-center text-xs font-bold text-white">
                  2
                </div>
                <CardTitle className="text-base">Estado de Cuenta</CardTitle>
              </div>
              <CardDescription>Sube tu(s) estado(s) de cuenta bancario(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Año del Estado de Cuenta</Label>
                <Input
                  type="number"
                  placeholder="Ej: 2024"
                  min={2000}
                  max={2099}
                  value={estadoCuentaAnio}
                  onChange={(e) => setEstadoCuentaAnio(e.target.value)}
                  className="h-10 bg-secondary/50 max-w-[200px]"
                />
              </div>

              <FileUploadZone type="cuenta" label="Archivos del Estado de Cuenta" />

              {estadoCuenta.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Detalle por archivo
                  </p>
                  {estadoCuenta.map((file, i) => {
                    const isFilledOut = file.banco && file.moneda;
                    return (
                      <div
                        key={i}
                        className={`rounded-xl border transition-all ${
                          isFilledOut ? "border-success/40 bg-success/5" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                          </div>
                          {isFilledOut && (
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
                            onClick={() => removeFile("cuenta", i)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 px-4 py-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Banco</Label>
                            <Input
                              placeholder="Ej: BBVA, Banorte..."
                              value={file.banco || ""}
                              onChange={(e) => updateCuentaFile(i, "banco", e.target.value)}
                              className="h-9 bg-secondary/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Moneda</Label>
                            <Select value={file.moneda || ""} onValueChange={(v) => updateCuentaFile(i, "moneda", v)}>
                              <SelectTrigger className="h-9 bg-secondary/50">
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pesos">🇲🇽 Pesos (MXN)</SelectItem>
                                <SelectItem value="dolares">🇺🇸 Dólares (USD)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Estados Financieros (grouped) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full sky-gradient flex items-center justify-center text-xs font-bold text-white">
                  3
                </div>
                <CardTitle className="text-base">Estados Financieros</CardTitle>
              </div>
              <CardDescription>Sube los documentos financieros requeridos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-xl p-4 space-y-5 bg-secondary/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <FolderOpen className="w-4 h-4" />
                  Documentos requeridos
                </div>
                <FileUploadZone type="estado" label="Estado de Resultados" />
                <div className="border-t border-border" />
                <FileUploadZone type="balance" label="Balance General" />
              </div>
            </CardContent>
          </Card>

          {/* 4. Credit Score */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full sky-gradient flex items-center justify-center text-xs font-bold text-white">
                  4
                </div>
                <CardTitle className="text-base">Score Crediticio</CardTitle>
              </div>
              <CardDescription>Ingresa el score del buró de crédito (300–850)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="score" className="text-xs">
                  Puntaje
                </Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="Ej: 720"
                  min={300}
                  max={850}
                  value={creditScore}
                  onChange={(e) => validateScore(e.target.value)}
                  className="h-10 bg-secondary/50"
                />
                {creditScoreError && <p className="text-xs text-destructive">{creditScoreError}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="pt-2 space-y-4">
            <Button
              onClick={handleGenerate}
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
                      <p className="text-sm font-semibold text-foreground">Documento generado exitosamente</p>
                      <p className="text-xs text-muted-foreground mt-0.5">El archivo se descargó automáticamente</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-1">
                        <Download className="w-3.5 h-3.5" />
                        Descargar de nuevo
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground">
                        <ChevronRight className="w-3.5 h-3.5" />
                        Nueva solicitud
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
