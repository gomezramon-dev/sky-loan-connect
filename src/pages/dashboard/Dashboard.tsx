import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { kickoffMasterGeneration, downloadMasterFile } from "@/lib/api";
import { useDashboardForm } from "./hooks/useDashboardForm";
import {
  DashboardHeader,
  CompletionProgress,
  CreditTypeSection,
  FormalidadSection,
  BankStatementSection,
  FinancialPeriodsSection,
  ExperienceSection,
  CreditScoreSection,
  EsgScoreSection,
  FormActions,
} from "./components";

export default function Dashboard() {
  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useDashboardForm();

  const handleGenerate = useCallback(async () => {
    const data = await form.getFormData();
    if (!data) return;

    form.setGenerating(true);
    toast({
      title: "Generando documento...",
      description: "Procesando la información proporcionada.",
    });

    try {
      await kickoffMasterGeneration({
        creditType: data.creditType,
        formalidad: data.formalidad,
        bankStatements: data.bankStatements,
        financialStatements: data.financialStatements,
        experienceYears: data.experienceYears,
        creditScore: data.creditScore,
        esgScore: data.esgScore,
      });

      const blob = await downloadMasterFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "master_cliente.xlsx";
      a.click();
      URL.revokeObjectURL(url);

      form.setGenerated(true);
      toast({
        title: "¡Documento generado!",
        description: "El archivo master_cliente.xlsx se descargó automáticamente.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      form.setGenerating(false);
    }
  }, [form, toast]);

  const handleReset = useCallback(() => {
    form.reset();
      toast({
        title: "Formulario reiniciado",
        description: "Puedes iniciar una nueva solicitud.",
      });
  }, [form, toast]);

  if (!loading && !user) {
    navigate("/", { replace: true });
    return null;
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={logout} isAdmin={user?.role === "admin"} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Generador de MasterCliente (parte cuantitativa)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completa la información para generar el documento Excel
          </p>
          <CompletionProgress completedSteps={form.completionSteps} />
        </div>

        <div className="space-y-6">
          <CreditTypeSection
            value={form.creditType}
            onChange={form.setCreditType}
          />

          <FormalidadSection
            value={form.formalidad}
            onChange={form.setFormalidad}
          />

          <BankStatementSection
            files={form.bankStatements}
            uploading={form.uploading === "bank"}
            onUpload={form.addBankStatements}
            onRemove={form.removeBankStatement}
            onUpdate={form.updateBankStatementFile}
            onUploadingChange={(v) => form.setUploading(v ? "bank" : null)}
            onUploadSuccess={(count) =>
              toast({
                title: "Archivo(s) cargado(s)",
                description: `${count} archivo(s) agregado(s) correctamente.`,
              })
            }
          />

          <FinancialPeriodsSection
            periods={form.financialPeriods}
            onChange={form.setFinancialPeriods}
          />

          <ExperienceSection
            value={form.experienceYears}
            error={form.experienceError}
            onChange={form.validateExperience}
          />

          <CreditScoreSection
            value={form.creditScore}
            error={form.creditScoreError}
            onChange={form.validateCreditScore}
          />

          <EsgScoreSection
            value={form.esgScore}
            error={form.esgScoreError}
            onChange={form.validateEsgScore}
          />

          <FormActions
            isComplete={form.isComplete}
            generating={form.generating}
            generated={form.generated}
            onGenerate={handleGenerate}
            onReset={handleReset}
          />
        </div>
      </main>
    </div>
  );
}
