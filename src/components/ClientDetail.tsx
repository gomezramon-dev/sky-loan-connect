import { useState } from "react";
import { ArrowLeft, Mail, Phone, Building, CreditCard, TrendingUp } from "lucide-react";
import { Client, DocumentZone, FinancingData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import DocumentUpload from "@/components/DocumentUpload";
import FinancingForm from "@/components/FinancingForm";
import ExcelPreview from "@/components/ExcelPreview";

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

const statusConfig = {
  activo: { label: "Activo", className: "bg-success/15 text-success border-success/30" },
  en_revision: { label: "En Revisión", className: "bg-warning/15 text-warning border-warning/30" },
  pendiente: { label: "Pendiente", className: "bg-muted text-muted-foreground border-border" },
};

const ClientDetail = ({ client, onBack }: ClientDetailProps) => {
  const [documents, setDocuments] = useState<DocumentZone>({
    reportesFinancieros: [],
    reportesFiscales: [],
    buroCredito: [],
  });
  const [financing, setFinancing] = useState<FinancingData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFinancingSubmit = async (data: FinancingData) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setFinancing(data);
    setShowPreview(true);
    setProcessing(false);
  };

  return (
    <div className="animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Clientes", onClick: onBack },
          { label: client.name },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      {/* Client Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl sky-gradient flex items-center justify-center text-sky-foreground font-bold text-lg shadow-md">
              {client.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge variant="outline" className={statusConfig[client.status].className}>
                  {statusConfig[client.status].label}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CreditCard className="w-3 h-3" /> {client.rfc}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-lg">
            <TrendingUp className={`w-4 h-4 ${client.creditScore >= 700 ? "text-success" : "text-warning"}`} />
            <span className="text-sm font-bold text-foreground">{client.creditScore}</span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            {client.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 text-primary" />
            {client.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4 text-primary" />
            {client.sector}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <DocumentUpload documents={documents} onDocumentsChange={setDocuments} />
      </div>

      {/* Financing Form */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <FinancingForm onSubmit={handleFinancingSubmit} loading={processing} />
      </div>

      {/* Excel Preview */}
      {showPreview && financing && (
        <div className="glass-card rounded-xl p-6">
          <ExcelPreview client={client} financing={financing} />
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
