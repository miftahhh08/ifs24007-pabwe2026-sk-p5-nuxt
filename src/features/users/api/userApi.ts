import { fetchApi, type ApiResponse } from "../../../helpers/apiHelper";

// Endpoint yang berbeda antara spesifikasi tugas dan dokumentasi Delcom
// dipusatkan di sini supaya mudah diganti jika backend berubah.
const PHOTO_PATH = "/users/me/photo";
const PASSWORD_PATH = "/users/password";

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const userApi = {
  /** GET /users */
  getUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return fetchApi<{ users: User[] }>("/users");
  },

  /** GET /users/me */
  getProfile(): Promise<ApiResponse<{ user: User }>> {
    return fetchApi<{ user: User }>("/users/me");
  },

  /** PUT /users/me */
  updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<{ user?: User }>> {
    return fetchApi<{ user?: User }>("/users/me", {
      method: "PUT",
      body: { ...payload },
    });
  },

  /** POST /users/me/photo (multipart/form-data) */
  changePhoto(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("photo", file);

    return fetchApi<any>(PHOTO_PATH, { method: "POST", body: formData });
  },

  /** PUT /users/password */
  changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<any>> {
    return fetchApi<any>(PASSWORD_PATH, {
      method: "PUT",
      body: { ...payload },
    });
  },
};
