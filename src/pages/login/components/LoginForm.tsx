import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  errors: { email?: string; password?: string };
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  /** Texto del botón submit (default: "Iniciar Sesión") */
  submitLabel?: string;
  /** Texto del botón cuando loading (default: "Ingresando...") */
  submitLoadingLabel?: string;
  /** Texto de ayuda debajo del botón (ej. credenciales admin) */
  hint?: string;
  /** Prefijo para ids de inputs (evita colisiones cuando hay varios forms) */
  idPrefix?: string;
}

export function LoginForm({
  email,
  password,
  showPassword,
  errors,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  submitLabel = "Iniciar Sesión",
  submitLoadingLabel = "Ingresando...",
  hint,
  idPrefix = "",
}: LoginFormProps) {
  const emailId = idPrefix ? `${idPrefix}-email` : "email";
  const passwordId = idPrefix ? `${idPrefix}-password` : "password";
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={emailId} className="text-sm font-medium text-foreground">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id={emailId}
            type="email"
            placeholder="usuario@empresa.mx"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId} className="text-sm font-medium text-foreground">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="pl-10 pr-10 h-11 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 sky-gradient text-white font-semibold hover:opacity-90 transition-opacity border-0"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-sky-foreground/30 border-t-sky-foreground rounded-full animate-spin" />
            {submitLoadingLabel}
          </div>
        ) : (
          submitLabel
        )}
      </Button>
      {hint && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          {hint}
        </p>
      )}
    </form>
  );
}
