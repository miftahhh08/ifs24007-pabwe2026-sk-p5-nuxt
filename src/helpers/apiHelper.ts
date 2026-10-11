export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface ApiRequestOptions {
  method: HttpMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  formData?: FormData;
  /** Default: true. Isi false untuk endpoint publik (login/register). */
  auth?: boolean;
}

const TOKEN_KEY = "delcom_cashflow_token";

/* ---------- Token ---------- */

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/* ---------- Query string ---------- */

export function buildQueryString(
  query: Record<string, string | number | boolean | null | undefined>
): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const result = params.toString();
  return result ? `?${result}` : "";
}

/* ---------- Fetch wrapper ---------- */

export async function apiFetch<T = any>(
  path: string,
  options: ApiRequestOptions
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    // Content-Type multipart diatur otomatis oleh browser
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  try {
    const url = `${DELCOM_BASEURL}${path}${buildQueryString(options.query || {})}`;
    const response = await fetch(url, { method: options.method, headers, body });
    const json = await response.json().catch(() => null);

    return {
      success: response.ok && isSuccessBody(json),
      message:
        (json && json.message) ||
        (response.ok ? "Berhasil" : "Terjadi kesalahan pada server"),
      data: json ? json.data : null,
      status: response.status,
    };
  } catch {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server",
      data: null as T,
      status: 0,
    };
  }
}

/* ---------- Pembaca data response yang toleran terhadap bentuk data ---------- */

export function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Menentukan apakah isi response menandakan sukses.
 * - `success` boolean / "true"  -> dipakai langsung
 * - `status` "success" / "ok"   -> sukses
 * - tidak ada penanda sama sekali -> dianggap sukses (status HTTP sudah dicek terpisah)
 */
export function isSuccessBody(body: unknown): boolean {
  if (!isPlainObject(body)) {
    return false;
  }
  if (body.success !== undefined) {
    return body.success === true || body.success === "true";
  }
  if (typeof body.status === "string") {
    return ["success", "ok"].includes(body.status.toLowerCase());
  }
  return true;
}

/** Ambil string tidak kosong pertama dari daftar key. */
export function pickString(source: unknown, keys: string[]): string {
  if (isPlainObject(source)) {
    for (const key of keys) {
      if (typeof source[key] === "string" && source[key] !== "") {
        return source[key];
      }
    }
  }
  return "";
}

/** Ambil array dari `data` (langsung array, atau di bawah salah satu key). */
export function pickArray(data: unknown, keys: string[]): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (isPlainObject(data)) {
    for (const key of keys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  return [];
}

/** Ambil object dari `data` (di bawah salah satu key, atau `data` itu sendiri). */
export function pickObject(data: unknown, keys: string[]): Record<string, any> {
  if (isPlainObject(data)) {
    for (const key of keys) {
      if (isPlainObject(data[key])) {
        return data[key];
      }
    }
    return data;
  }
  return {};
}

/** Ambil angka pertama yang valid dari daftar key; jika tidak ada pakai fallback. */
export function pickNumber(
  source: Record<string, any>,
  keys: string[],
  fallback: number
): number {
  for (const key of keys) {
    const raw = source[key];
    if (raw !== undefined && raw !== null && raw !== "" && Number.isFinite(Number(raw))) {
      return Number(raw);
    }
  }
  return fallback;
}