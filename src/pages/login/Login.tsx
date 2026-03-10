import { useAuth } from "@/contexts/AuthContext";
import { useLoginForm } from "./hooks/useLoginForm";
import { LoginHeader, LoginForm } from "./components";

export default function Login() {
  const { login } = useAuth();
  const form = useLoginForm(login);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 sky-gradient-light opacity-40" />
      <div className="relative w-full max-w-md mx-4 animate-fade-in">
        <div className="glass-card rounded-2xl p-8 shadow-lg">
          <LoginHeader />
          <LoginForm
            email={form.email}
            password={form.password}
            showPassword={form.showPassword}
            errors={form.errors}
            loading={form.loading}
            onEmailChange={form.setEmail}
            onPasswordChange={form.setPassword}
            onTogglePassword={() => form.setShowPassword(!form.showPassword)}
            onSubmit={form.handleSubmit}
            hint="Admin: admin@sky-loan.com / Admin123!"
          />
        </div>
      </div>
    </div>
  );
}
