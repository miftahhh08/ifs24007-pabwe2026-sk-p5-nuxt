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

  /** POST /auth/register */
  register(payload: RegisterPayload): Promise<ApiResponse<null>> {
    return fetchApi<null>("/auth/register", {
      method: "POST",
      body: { ...payload },
      withAuth: false,
    });
  },
};
