const API_BASE = "/api";

export interface User {
  id: number;
  email: string;
  role: "base" | "admin";
  created_at?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

async function getStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (access && refresh) return { accessToken: access, refreshToken: refresh };
  return null;
}

async function refreshTokens(): Promise<LoginResponse | null> {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as LoginResponse;
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const tokens = await getStoredTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (tokens) headers.Authorization = `Bearer ${tokens.accessToken}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed.accessToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignorar errores de red; limpiar local de todas formas
    }
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.error ?? "Login failed");
  }
  return res.json() as Promise<LoginResponse>;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetchWithAuth(`${API_BASE}/users`);
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json() as Promise<User[]>;
}

export async function createUser(email: string, password: string): Promise<User> {
  const res = await fetchWithAuth(`${API_BASE}/users`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.error ?? "Failed to create user");
  }
  return res.json() as Promise<User>;
}

export async function updateUser(id: number, data: { email?: string; password?: string }): Promise<User> {
  const res = await fetchWithAuth(`${API_BASE}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.error ?? "Failed to update user");
  }
  return res.json() as Promise<User>;
}

/**
 * Bank statements (Estado de Cuenta) format for API.
 * { "BankName": { "MXN"|"USD": { "YYYYMM": "base64..." } } }
 */
export type BankStatementsPayload = Record<
  string,
  Record<string, Record<string, string>>
>;

/**
 * Financial statements (Estados Financieros) format for API.
 * { "YYYY": { isComplete, trimester, incomeStatement, balanceSheet } }
 */
export interface FinancialStatementYear {
  isComplete: boolean;
  trimester: number;
  incomeStatement: string;
  balanceSheet: string;
}

export type FinancialStatementsPayload = Record<string, FinancialStatementYear>;

export interface MasterGenerationPayload {
  creditType: "capital_trabajo" | "adquisicion_activos" | "proyectos_inversion";
  formalidad: number;
  bankStatements: BankStatementsPayload;
  financialStatements: FinancialStatementsPayload;
  experienceYears: number;
  creditScore: number;
  esgScore: number;
}

export async function kickoffMasterGeneration(payload: MasterGenerationPayload): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/kickoff-master-generation`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.error ?? err.message ?? "Error al generar master");
  }
}

export async function downloadMasterFile(): Promise<Blob> {
  const res = await fetchWithAuth(`${API_BASE}/get-master`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.error ?? err.message ?? "No se pudo descargar el archivo");
  }
  return res.blob();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/users/${id}`, { method: "DELETE" });
  if (res.status === 403) throw new Error("FORBIDDEN");
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(err.error ?? "Failed to delete user");
  }
}
