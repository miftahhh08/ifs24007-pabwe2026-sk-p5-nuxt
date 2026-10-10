import { apiFetch } from "../../../helpers/apiHelper";

export interface ProfilePayload {
  name: string;
  email: string;
}

export interface PasswordPayload {
  password: string;
  new_password: string;
}

export const getUsers = () => apiFetch("/users", { method: "GET" });

export const getMe = () => apiFetch("/users/me", { method: "GET" });

export const putMe = (payload: ProfilePayload) =>
  apiFetch("/users/me", { method: "PUT", body: payload });

export const postPhoto = (file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return apiFetch("/users/me/photo", { method: "POST", formData });
};

/**
 * Sesuai modul: PUT /users/me/password.
 * Jika server menjawab 404 (endpoint berbeda pada dokumentasi), coba PUT /users/password.
 */
export const putPassword = async (payload: PasswordPayload) => {
  const response = await apiFetch("/users/me/password", { method: "PUT", body: payload });
  if (response.status === 404) {
    return apiFetch("/users/password", { method: "PUT", body: payload });
  }
  return response;
};
