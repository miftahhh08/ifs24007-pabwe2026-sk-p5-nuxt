import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  getAccessToken,
  getErrorMessage,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  authApi,
  extractToken,
  type LoginPayload,
  type RegisterPayload,
} from "../api/authApi";

export const useAuthStore = defineStore("auth", () => {
  /** Token sesi. Diinisialisasi dari localStorage agar sesi tetap ada saat refresh. */
  const token = ref<string | null>(getAccessToken());

  // Status proses (true = sedang berjalan)
  const isAuthLogin = ref(false);
  const isAuthRegister = ref(false);
  const isAuthLogout = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  async function login(payload: LoginPayload): Promise<boolean> {
    isAuthLogin.value = true;
    const response = await authApi.login(payload);
    isAuthLogin.value = false;

    const accessToken = extractToken(response.data);

    if (!response.success || !accessToken) {
      showErrorDialog(getErrorMessage(response, "Login gagal."), "Login Gagal");
      return false;
    }

    putAccessToken(accessToken);
    token.value = accessToken;
    return true;
  }

  async function register(payload: RegisterPayload): Promise<boolean> {
    isAuthRegister.value = true;
    const response = await authApi.register(payload);
    isAuthRegister.value = false;

    if (!response.success) {
      showErrorDialog(
        getErrorMessage(response, "Registrasi gagal."),
        "Registrasi Gagal"
      );
      return false;
    }

    await showSuccessDialog(
      response.message || "Akun berhasil dibuat. Silakan login.",
      "Registrasi Berhasil"
    );
    return true;
  }

  async function logout(): Promise<boolean> {
    const confirmed = await showConfirmDialog(
      "Kamu akan keluar dari akun ini.",
      "Keluar dari aplikasi?",
      "Ya, keluar"
    );
    if (!confirmed) return false;

    isAuthLogout.value = true;
    removeAccessToken();
    token.value = null;
    isAuthLogout.value = false;
    return true;
  }

  return {
    token,
    isAuthLogin,
    isAuthRegister,
    isAuthLogout,
    isAuthenticated,
    login,
    register,
    logout,
  };
});
