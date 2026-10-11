import { defineStore } from "pinia";
import {
  getAccessToken,
  pickString,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import { postLogin, postRegister } from "../api/authApi";
import type { LoginPayload, RegisterPayload } from "../api/authApi";

export interface AuthState {
  token: string | null;
  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },
  actions: {
    async login(payload: LoginPayload) {
      this.isAuthLogin = true;
      const response = await postLogin(payload);
      this.isAuthLogin = false;

      if (!response.success) {
        return response;
      }

      const token = pickString(response.data, ["token", "access_token", "accessToken"]);
      if (!token) {
        return { ...response, success: false, message: "Token tidak ditemukan pada response login." };
      }

      putAccessToken(token);
      this.token = token;
      return response;
    },
    async register(payload: RegisterPayload) {
      this.isAuthRegister = true;
      const response = await postRegister(payload);
      this.isAuthRegister = false;
      return response;
    },
    async logout() {
      this.isAuthLogout = true;
      removeAccessToken();
      this.token = null;
      this.isAuthLogout = false;
    },
  },
});
