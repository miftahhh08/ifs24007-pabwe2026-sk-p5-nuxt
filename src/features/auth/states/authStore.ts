import { defineStore } from "pinia";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
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
      if (response.success) {
        putAccessToken(response.data.token);
        this.token = response.data.token;
      }
      this.isAuthLogin = false;
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
