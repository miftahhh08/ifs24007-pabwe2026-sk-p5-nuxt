import { apiFetch } from "../../../helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const postLogin = (payload: LoginPayload) =>
  apiFetch<{ token: string }>("/auth/login", { method: "POST", body: payload, auth: false });

export const postRegister = (payload: RegisterPayload) =>
  apiFetch("/auth/register", { method: "POST", body: payload, auth: false });
