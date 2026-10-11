import { defineStore } from "pinia";
import { ref } from "vue";
import { getErrorMessage } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import {
  userApi,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
  type User,
} from "../api/userApi";

export const useUsersStore = defineStore("users", () => {
  /** Daftar seluruh pengguna sistem. */
  const users = ref<User[]>([]);
  /** Profil pengguna yang sedang login. */
  const profile = ref<User | null>(null);

  // Status pemuatan data
  const isUsers = ref(false);
  const isProfile = ref(false);

  // Status mutasi (isXxx = sedang berjalan, isXxxed = baru saja berhasil)
  const isProfileChange = ref(false);
  const isProfileChanged = ref(false);
  const isPhotoChange = ref(false);
  const isPhotoChanged = ref(false);
  const isPasswordChange = ref(false);
  const isPasswordChanged = ref(false);

  async function fetchUsers(): Promise<boolean> {
    isUsers.value = true;
    const response = await userApi.getUsers();
    isUsers.value = false;

    if (!response.success) {
      showErrorDialog(getErrorMessage(response, "Gagal memuat daftar pengguna."));
      return false;
    }

    users.value = response.data?.users ?? [];
    return true;
  }

  /**
   * Dibuat "diam" (tanpa dialog): jika gagal (mis. token kedaluwarsa),
   * pemanggil yang memutuskan langkah selanjutnya.
   */
  async function fetchProfile(): Promise<boolean> {
    isProfile.value = true;
    const response = await userApi.getProfile();
    isProfile.value = false;

    if (!response.success || !response.data?.user) return false;

    profile.value = response.data.user;
    return true;
  }

  async function changeProfile(payload: UpdateProfilePayload): Promise<boolean> {
    isProfileChange.value = true;
    isProfileChanged.value = false;
    const response = await userApi.updateProfile(payload);
    isProfileChange.value = false;

    if (!response.success) {
      showErrorDialog(getErrorMessage(response, "Gagal memperbarui profil."));
      return false;
    }

    profile.value = response.data?.user ?? ({ ...profile.value, ...payload } as User);
    isProfileChanged.value = true;
    await showSuccessDialog(response.message || "Profil berhasil diperbarui.");
    return true;
  }

  async function changePhoto(file: File): Promise<boolean> {
    isPhotoChange.value = true;
    isPhotoChanged.value = false;
    const response = await userApi.changePhoto(file);
    isPhotoChange.value = false;

    if (!response.success) {
      showErrorDialog(getErrorMessage(response, "Gagal mengubah foto profil."));
      return false;
    }

    await fetchProfile(); // ambil ulang agar URL foto terbaru terbaca
    isPhotoChanged.value = true;
    await showSuccessDialog(response.message || "Foto profil berhasil diperbarui.");
    return true;
  }

  async function changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    isPasswordChange.value = true;
    isPasswordChanged.value = false;
    const response = await userApi.changePassword(payload);
    isPasswordChange.value = false;

    if (!response.success) {
      showErrorDialog(getErrorMessage(response, "Gagal mengubah kata sandi."));
      return false;
    }

    isPasswordChanged.value = true;
    await showSuccessDialog(response.message || "Kata sandi berhasil diubah.");
    return true;
  }

  /** Dipanggil saat logout agar data akun lama tidak terbawa. */
  function reset() {
    users.value = [];
    profile.value = null;
    isProfileChanged.value = false;
    isPhotoChanged.value = false;
    isPasswordChanged.value = false;
  }

  return {
    users,
    profile,
    isUsers,
    isProfile,
    isProfileChange,
    isProfileChanged,
    isPhotoChange,
    isPhotoChanged,
    isPasswordChange,
    isPasswordChanged,
    fetchUsers,
    fetchProfile,
    changeProfile,
    changePhoto,
    changePassword,
    reset,
  };
});
