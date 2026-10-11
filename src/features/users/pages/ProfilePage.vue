<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import {
  getInitials,
  resolveAssetUrl,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

const { value: name } = useInput("");
const { value: email } = useInput("");
const { value: currentPassword, reset: resetCurrentPassword } = useInput("");
const { value: newPassword, reset: resetNewPassword } = useInput("");
const selectedFile = ref<File | null>(null);

const avatarUrl = computed(() =>
  usersStore.profile ? resolveAssetUrl(usersStore.profile.photo) : ""
);
const initials = computed(() => (usersStore.profile ? getInitials(usersStore.profile.name) : "?"));

onMounted(async () => {
  await usersStore.fetchProfile();
  const profile = usersStore.profile;
  if (profile) {
    name.value = profile.name;
    email.value = profile.email;
  }
});

async function handleProfileSubmit() {
  if (!name.value.trim() || !email.value.trim()) {
    await showErrorDialog("Nama dan email wajib diisi.");
    return;
  }
  const response = await usersStore.changeProfile({
    name: name.value.trim(),
    email: email.value.trim(),
  });
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  selectedFile.value = (input.files as FileList)[0] || null;
}

async function handlePhotoSubmit() {
  if (!selectedFile.value) {
    await showErrorDialog("Pilih file foto terlebih dahulu.");
    return;
  }
  const response = await usersStore.changePhoto(selectedFile.value);
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
}

async function handlePasswordSubmit() {
  if (!currentPassword.value || !newPassword.value) {
    await showErrorDialog("Kata sandi lama dan baru wajib diisi.");
    return;
  }
  const response = await usersStore.changePassword({
    password: currentPassword.value,
    new_password: newPassword.value,
  });
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  resetCurrentPassword();
  resetNewPassword();
  await showSuccessDialog(response.message);
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";
const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
const buttonClass =
  "rounded-xl bg-emerald-700 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60";
</script>

<template>
  <section class="space-y-6">
    <header class="flex items-center gap-4">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Foto profil"
        class="size-16 rounded-full object-cover"
        data-testid="profile-photo"
      />
      <div
        v-else
        class="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-extrabold text-emerald-700"
        data-testid="profile-initials"
      >
        {{ initials }}
      </div>
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Profil Saya</h1>
        <p class="text-sm text-slate-500">Kelola data akun dan keamanan kamu.</p>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-2">
      <form :class="cardClass" data-testid="profile-form" @submit.prevent="handleProfileSubmit">
        <h2 class="mb-4 text-lg font-bold">Data diri</h2>
        <div class="space-y-4">
          <div>
            <label for="profile-name" class="mb-1.5 block text-sm font-semibold">Nama</label>
            <input id="profile-name" v-model="name" type="text" :class="inputClass" />
          </div>
          <div>
            <label for="profile-email" class="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="profile-email" v-model="email" type="email" :class="inputClass" />
          </div>
          <button type="submit" :disabled="usersStore.isProfileChange" :class="buttonClass">
            Simpan perubahan
          </button>
        </div>
      </form>

      <form :class="cardClass" data-testid="photo-form" @submit.prevent="handlePhotoSubmit">
        <h2 class="mb-4 text-lg font-bold">Foto profil</h2>
        <div class="space-y-4">
          <label for="profile-photo" class="block text-sm font-semibold">Pilih file foto</label>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            class="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-semibold file:text-emerald-700"
            @change="handleFileChange"
          />
          <button type="submit" :disabled="usersStore.isPhotoChange" :class="buttonClass">
            Unggah foto
          </button>
        </div>
      </form>

      <form
        :class="[cardClass, 'lg:col-span-2']"
        data-testid="password-form"
        @submit.prevent="handlePasswordSubmit"
      >
        <h2 class="mb-4 text-lg font-bold">Ubah kata sandi</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="current-password" class="mb-1.5 block text-sm font-semibold">
              Kata sandi lama
            </label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              :class="inputClass"
            />
          </div>
          <div>
            <label for="new-password" class="mb-1.5 block text-sm font-semibold">
              Kata sandi baru
            </label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              :class="inputClass"
            />
          </div>
        </div>
        <button type="submit" :disabled="usersStore.isPasswordChange" :class="[buttonClass, 'mt-4']">
          Ubah kata sandi
        </button>
      </form>
    </div>
  </section>
</template>
