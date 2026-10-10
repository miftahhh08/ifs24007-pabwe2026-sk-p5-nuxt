import { defineStore } from "pinia";
import { pickArray, pickObject } from "../../../helpers/apiHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";
import type { PasswordPayload, ProfilePayload } from "../api/userApi";

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UsersState {
  users: User[];
  profile: User | null;
  isUsers: boolean;
  isProfile: boolean;
  isProfileChange: boolean;
  isPhotoChange: boolean;
  isPasswordChange: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isUsers: false,
    isProfile: false,
    isProfileChange: false,
    isPhotoChange: false,
    isPasswordChange: false,
  }),
  actions: {
    async fetchUsers() {
      this.isUsers = true;
      const response = await getUsers();
      if (response.success) {
        this.users = pickArray(response.data, ["users"]);
      }
      this.isUsers = false;
      return response;
    },
    async fetchProfile() {
      this.isProfile = true;
      const response = await getMe();
      if (response.success) {
        this.profile = pickObject(response.data, ["user"]) as User;
      }
      this.isProfile = false;
      return response;
    },
    async changeProfile(payload: ProfilePayload) {
      this.isProfileChange = true;
      const response = await putMe(payload);
      if (response.success) {
        await this.fetchProfile();
      }
      this.isProfileChange = false;
      return response;
    },
    async changePhoto(file: File) {
      this.isPhotoChange = true;
      const response = await postPhoto(file);
      if (response.success) {
        await this.fetchProfile();
      }
      this.isPhotoChange = false;
      return response;
    },
    async changePassword(payload: PasswordPayload) {
      this.isPasswordChange = true;
      const response = await putPassword(payload);
      this.isPasswordChange = false;
      return response;
    },
  },
});
