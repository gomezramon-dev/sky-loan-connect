import { LogOut, Users, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/button";
import pontiLogo from "@/components/svg/ponti.svg";

interface DashboardHeaderProps {
  onLogout: () => void;
  isAdmin?: boolean;
  /** Cuando true, muestra link a Dashboard en vez de Usuarios (para página Users) */
  showDashboardLink?: boolean;
}

export function DashboardHeader({ onLogout, isAdmin, showDashboardLink }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg sky-gradient flex items-center justify-center shadow-sm">
              <img src={pontiLogo} alt="Ponti" className="w-5 h-5" />
            </div>
            <span className="font-bold text-foreground">MasterHelper</span>
          </Link>
          {(showDashboardLink || isAdmin) && (
            showDashboardLink ? (
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/users"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Usuarios
              </Link>
            )
          )}
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
  );
}
