import { useState } from "react";
import { Building2, LogOut, LayoutDashboard } from "lucide-react";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import ClientTable from "@/components/ClientTable";
import ClientDetail from "@/components/ClientDetail";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg sky-gradient flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-sky-foreground" />
            </div>
            <span className="font-bold text-foreground">FinanzaPro</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg text-xs text-muted-foreground">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {selectedClient ? (
          <ClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Clientes</h1>
              <p className="text-sm text-muted-foreground">Gestión y análisis de solicitudes de financiamiento</p>
            </div>
            <ClientTable onSelectClient={setSelectedClient} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
