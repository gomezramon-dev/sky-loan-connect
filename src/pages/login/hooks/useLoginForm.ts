import { useState, useCallback } from "react";
import type { LoginErrors } from "../types";

export function useLoginForm(onLogin: (email: string, password: string) => Promise<void>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: LoginErrors = {};
    if (!email) newErrors.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Correo no válido";
    if (!password) newErrors.password = "La contraseña es requerida";
    else if (password.length < 6)
      newErrors.password = "Mínimo 6 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setLoading(true);
      setErrors({});
      try {
        await onLogin(email, password);
      } catch (err) {
        setErrors({
          password: err instanceof Error ? err.message : "Error al iniciar sesión",
        });
      } finally {
        setLoading(false);
      }
    },
    [validate, onLogin, email, password]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    loading,
    handleSubmit,
  };
}
