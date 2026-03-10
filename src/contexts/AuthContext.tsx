import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, type User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
  }, []);

  useEffect(() => {
    const access = localStorage.getItem("accessToken");
    if (!access) {
      setLoading(false);
      return;
    }
    // Decode JWT payload (base64) to get user info without extra request
    try {
      const payload = JSON.parse(atob(access.split(".")[1] ?? "{}"));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.userId as number,
          email: payload.email as string,
          role: (payload.role ?? "base") as "base" | "admin",
        });
      } else {
        logout();
      }
    } catch {
      logout();
    }
    setLoading(false);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
