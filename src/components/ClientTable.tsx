import { Search, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Client, MOCK_CLIENTS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ClientTableProps {
  onSelectClient: (client: Client) => void;
}

const statusConfig = {
  activo: { label: "Activo", className: "bg-success/15 text-success border-success/30" },
  en_revision: { label: "En Revisión", className: "bg-warning/15 text-warning border-warning/30" },
  pendiente: { label: "Pendiente", className: "bg-muted text-muted-foreground border-border" },
};

const ClientTable = ({ onSelectClient }: ClientTableProps) => {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.rfc.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total Clientes", value: MOCK_CLIENTS.length, color: "text-primary" },
          { icon: CheckCircle, label: "Activos", value: MOCK_CLIENTS.filter((c) => c.status === "activo").length, color: "text-success" },
          { icon: AlertCircle, label: "Pendientes", value: MOCK_CLIENTS.filter((c) => c.status === "pendiente").length, color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, RFC o sector..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-card border-border"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">RFC</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Sector</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, i) => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className="border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell font-mono">{client.rfc}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">{client.sector}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-3.5 h-3.5 ${client.creditScore >= 700 ? "text-success" : client.creditScore >= 600 ? "text-warning" : "text-destructive"}`} />
                      <span className="text-sm font-medium text-foreground">{client.creditScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={`text-xs ${statusConfig[client.status].className}`}>
                      {statusConfig[client.status].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientTable;
