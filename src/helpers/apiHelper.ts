const ACCESS_TOKEN_KEY = "access_token";

/** Bentuk respons standar dari Delcom Open API. */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface FetchApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Query string. Nilai kosong (null/undefined/"") otomatis diabaikan. */
  params?: QueryParams;
  /** Body JSON, atau FormData untuk unggah berkas. */
  body?: Record<string, any> | FormData;
  /** Jika false, header Authorization tidak dikirim (login/register). */
  withAuth?: boolean;
}

/* ----------------------------- Token storage ----------------------------- */

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/* ------------------------------ URL builder ------------------------------ */

export function buildUrl(path: string, params?: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return `${DELCOM_BASEURL}${path}${query ? `?${query}` : ""}`;
}

/* ------------------------------- HTTP fetch ------------------------------ */

export async function fetchApi<T = any>(
  path: string,
  options: FetchApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", params, body, withAuth = true } = options;

  const headers: Record<string, string> = { Accept: "application/json" };

  const token = withAuth ? getAccessToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    // Content-Type multipart di-set otomatis oleh browser (beserta boundary)
    requestBody = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: requestBody,
    });

    // Token ditolak server (kedaluwarsa/tidak valid): bersihkan & minta login ulang.
    if (response.status === 401 && token) {
      removeAccessToken();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.assign("/auth/login");
      }
      return {
        success: false,
        message: "Sesi berakhir, silakan login kembali.",
        data: null as T,
      };
    }

    const json = await response.json();

    return {
      success: json.status === "success" || json.success === true,
      message: json.message ?? "",
      data: json.data as T,
    };
  } catch {
    return {
      success: false,
      message: "Terjadi kesalahan jaringan atau server tidak merespons.",
      data: null as T,
    };
  }
}

/* ----------------------------- Pesan error API ---------------------------- */

/**
 * Membuat pesan error yang ramah dibaca dari respons gagal.
 * Pesan validasi per-field (data: { email: ["..."] }) ikut digabungkan.
 */
export function getErrorMessage(
  response: ApiResponse,
  fallback = "Terjadi kesalahan, silakan coba lagi."
): string {
  const data = response.data;
  const messages: string[] = [];

  if (data && typeof data === "object") {
    Object.values(data).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string") messages.push(item);
        });
      }
    });
  }

  if (messages.length > 0) {
    const detail = messages.join(" ");
    return response.message ? `${response.message}: ${detail}` : detail;
  }

  return response.message || fallback;
}
