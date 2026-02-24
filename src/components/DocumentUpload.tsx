import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, X, FileSpreadsheet, FileCheck, ShieldCheck } from "lucide-react";
import { UploadedFile, DocumentZone } from "@/lib/types";

interface DocumentUploadProps {
  documents: DocumentZone;
  onDocumentsChange: (docs: DocumentZone) => void;
}

type ZoneKey = keyof DocumentZone;

const zones: { key: ZoneKey; label: string; icon: React.ElementType; description: string }[] = [
  { key: "reportesFinancieros", label: "Reportes Financieros", icon: FileSpreadsheet, description: "Estados financieros, balances, P&L" },
  { key: "reportesFiscales", label: "Reportes Fiscales", icon: FileCheck, description: "Declaraciones, constancias fiscales" },
  { key: "buroCredito", label: "Buró de Crédito", icon: ShieldCheck, description: "Reporte de buró actualizado" },
];

const DocumentUpload = ({ documents, onDocumentsChange }: DocumentUploadProps) => {
  const [dragOver, setDragOver] = useState<ZoneKey | null>(null);
  const [uploading, setUploading] = useState<ZoneKey | null>(null);

  const handleFiles = useCallback(
    async (zone: ZoneKey, fileList: FileList) => {
      setUploading(zone);
      await new Promise((r) => setTimeout(r, 800));
      const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date(),
      }));
      onDocumentsChange({
        ...documents,
        [zone]: [...documents[zone], ...newFiles],
      });
      setUploading(null);
    },
    [documents, onDocumentsChange]
  );

  const removeFile = (zone: ZoneKey, index: number) => {
    onDocumentsChange({
      ...documents,
      [zone]: documents[zone].filter((_, i) => i !== index),
    });
  };

  const handleDrop = (zone: ZoneKey, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (e.dataTransfer.files.length) handleFiles(zone, e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        Documentación Requerida
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="space-y-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(key, e)}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                dragOver === key
                  ? "border-primary bg-accent/50 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
            >
              {uploading === key ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground">Subiendo...</p>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                  <div className="flex items-center gap-1 text-xs text-primary mt-1">
                    <Upload className="w-3 h-3" />
                    <span>Subir archivo</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(key, e.target.files)}
                  />
                </label>
              )}
            </div>

            {documents[key].map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-accent/40 rounded-lg text-xs animate-scale-in">
                <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="truncate text-foreground flex-1">{file.name}</span>
                <button onClick={() => removeFile(key, i)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;
