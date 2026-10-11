import { fetchApi, type ApiResponse } from "../../../helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
}

export interface LoginData {
  token: string;
  user?: AuthUser;
}

export const authApi = {
  /** POST /auth/login */
  login(payload: LoginPayload): Promise<ApiResponse<LoginData>> {
    return fetchApi<LoginData>("/auth/login", {
      method: "POST",
      body: { ...payload },
      withAuth: false,
    });
  },

  /** POST /auth/logout (mencabut token di server) */
  logout(): Promise<ApiResponse<null>> {
    return fetchApi<null>("/auth/logout", { method: "POST" });
  },

  /** POST /auth/register */
  register(payload: RegisterPayload): Promise<ApiResponse<null>> {
    return fetchApi<null>("/auth/register", {
      method: "POST",
      body: { ...payload },
      withAuth: false,
    });
  },
};

/**
 * Mencari token di dalam data respons login. Nama field token bisa berbeda
 * antar versi API (token, access_token, ...) atau berada di dalam objek lain,
 * jadi dicari berdasarkan nama yang mengandung kata "token".
 */
export function extractToken(data: unknown): string | null {
  if (typeof data === "string") return data || null;
  if (!data || typeof data !== "object") return null;

  const entries = Object.entries(data as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (/token/i.test(key) && typeof value === "string" && value) return value;
  }

  for (const [, value] of entries) {
    const nested = extractToken(value && typeof value === "object" ? value : null);
    if (nested) return nested;
  }

  return null;
}
