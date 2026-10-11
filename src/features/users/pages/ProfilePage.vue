<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { Camera, Eye, EyeOff, KeyRound, Loader2, Save, UserRound } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { formatDate, getInitials, getPhotoUrl } from "../../../helpers/toolsHelper";
import { useUsersStore } from "../states/usersStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

const usersStore = useUsersStore();

/* ------------------------------- Info akun ------------------------------- */
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const profileErrors = reactive({ name: "", email: "" });

// Isi form dari data profil (saat pertama dimuat dan setelah disimpan).
watch(
  () => usersStore.profile,
  (profile) => {
    if (profile) {
      name.value = profile.name ?? "";
      email.value = profile.email ?? "";
    }
  },
  { immediate: true }
);

async function onProfileSubmit() {
  profileErrors.name = name.value.trim() ? "" : "Nama wajib diisi.";

  if (!email.value.trim()) profileErrors.email = "Email wajib diisi.";
  else if (!EMAIL_REGEX.test(email.value.trim())) profileErrors.email = "Format email tidak valid.";
  else profileErrors.email = "";

  if (profileErrors.name || profileErrors.email) return;

  await usersStore.changeProfile({ name: name.value.trim(), email: email.value.trim() });
}

/* ------------------------------- Foto profil ------------------------------ */
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const photoError = ref("");
const photoFailed = ref(false);

function clearPhotoSelection() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
}

function onPhotoSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    photoError.value = "Format foto harus JPG atau PNG.";
    return;
  }
  if (file.size > MAX_PHOTO_SIZE) {
    photoError.value = "Ukuran foto maksimal 2 MB.";
    return;
  }

  photoError.value = "";
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

async function onPhotoSubmit() {
  if (!selectedFile.value) return;

  const isSuccess = await usersStore.changePhoto(selectedFile.value);
  if (isSuccess) {
    photoFailed.value = false;
    clearPhotoSelection();
  }
}

function displayPhoto(): string | null {
  if (previewUrl.value) return previewUrl.value;
  return photoFailed.value ? null : getPhotoUrl(usersStore.profile?.photo);
}

/* ------------------------------ Kata sandi ------------------------------- */
const [currentPassword, onCurrentPasswordChange] = useInput("");
const [newPassword, onNewPasswordChange] = useInput("");
const [confirmPassword, onConfirmPasswordChange] = useInput("");
const showPasswords = ref(false);
const passwordErrors = reactive({ current: "", next: "", confirm: "" });

async function onPasswordSubmit() {
  passwordErrors.current = currentPassword.value ? "" : "Kata sandi saat ini wajib diisi.";

  if (!newPassword.value) passwordErrors.next = "Kata sandi baru wajib diisi.";
  else if (newPassword.value.length < MIN_PASSWORD)
    passwordErrors.next = `Kata sandi baru minimal ${MIN_PASSWORD} karakter.`;
  else passwordErrors.next = "";

  passwordErrors.confirm =
    confirmPassword.value === newPassword.value ? "" : "Konfirmasi kata sandi tidak sama.";

  if (passwordErrors.current || passwordErrors.next || passwordErrors.confirm) return;

  const isSuccess = await usersStore.changePassword({
    password: currentPassword.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmPassword.value,
  });

  if (isSuccess) {
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  }
}

onMounted(() => {
  usersStore.fetchProfile();
});

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-4";
const okClass = "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100";
const errClass = "border-red-400 focus:ring-red-100";
</script>

<template>
  <div data-testid="profile-page">
    <div class="mb-6">
      <h1 class="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
        <UserRound class="h-6 w-6 text-emerald-600" /> Profil Saya
      </h1>
      <p class="mt-1 text-sm text-slate-500">Kelola informasi akun, foto, dan keamananmu.</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Foto profil -->
      <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm" data-testid="photo-card">
        <h2 class="mb-5 font-bold text-slate-900">Foto Profil</h2>

        <div class="flex flex-col items-center text-center">
          <img
            v-if="displayPhoto()"
            :src="displayPhoto()!"
            alt="Foto profil"
            class="h-32 w-32 rounded-full object-cover ring-4 ring-emerald-100"
            data-testid="profile-photo"
            @error="photoFailed = true"
          />
          <div
            v-else
            class="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-700 ring-4 ring-emerald-50"
            data-testid="profile-initials"
          >
            {{ getInitials(usersStore.profile?.name) }}
          </div>

          <h3 class="mt-4 text-lg font-bold text-slate-900" data-testid="profile-name">
            {{ usersStore.profile?.name ?? "-" }}
          </h3>
          <p class="text-sm text-slate-500">{{ usersStore.profile?.email ?? "-" }}</p>
          <p class="mt-1 text-xs text-slate-400">
            Bergabung {{ formatDate(usersStore.profile?.created_at) }}
          </p>

          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg"
            class="hidden"
            data-testid="photo-input"
            @change="onPhotoSelected"
          />

          <button
            type="button"
            class="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            data-testid="choose-photo"
            @click="fileInput?.click()"
          >
            <Camera class="h-4 w-4" /> Pilih Foto Baru
          </button>

          <p v-if="photoError" class="mt-2 text-xs font-medium text-red-600" data-testid="photo-error">
            {{ photoError }}
          </p>
          <p v-else class="mt-2 text-xs text-slate-400">JPG atau PNG, maks. 2 MB</p>

          <div v-if="selectedFile" class="mt-4 flex gap-2" data-testid="photo-actions">
            <button
              type="button"
              :disabled="usersStore.isPhotoChange"
              class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-70"
              data-testid="save-photo"
              @click="onPhotoSubmit"
            >
              <Loader2 v-if="usersStore.isPhotoChange" class="h-4 w-4 animate-spin" />
              Simpan Foto
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              data-testid="cancel-photo"
              @click="clearPhotoSelection"
            >
              Batal
            </button>
          </div>
        </div>
      </section>

      <div class="space-y-6 lg:col-span-2">
        <!-- Informasi akun -->
        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="mb-5 font-bold text-slate-900">Informasi Akun</h2>

          <form class="space-y-4" novalidate data-testid="profile-form" @submit.prevent="onProfileSubmit">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="profile-name" class="mb-1.5 block text-sm font-semibold text-slate-700">Nama</label>
                <input
                  id="profile-name"
                  type="text"
                  data-testid="name-input"
                  :value="name"
                  :class="[inputClass, profileErrors.name ? errClass : okClass]"
                  @input="onNameChange"
                />
                <p v-if="profileErrors.name" class="mt-1.5 text-xs font-medium text-red-600" data-testid="name-error">
                  {{ profileErrors.name }}
                </p>
              </div>
              <div>
                <label for="profile-email" class="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  data-testid="email-input"
                  :value="email"
                  :class="[inputClass, profileErrors.email ? errClass : okClass]"
                  @input="onEmailChange"
                />
                <p v-if="profileErrors.email" class="mt-1.5 text-xs font-medium text-red-600" data-testid="email-error">
                  {{ profileErrors.email }}
                </p>
              </div>
            </div>

            <button
              type="submit"
              :disabled="usersStore.isProfileChange"
              class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-70"
              data-testid="save-profile"
            >
              <Loader2 v-if="usersStore.isProfileChange" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              Simpan Perubahan
            </button>
          </form>
        </section>

        <!-- Ubah kata sandi -->
        <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="flex items-center gap-2 font-bold text-slate-900">
              <KeyRound class="h-5 w-5 text-emerald-600" /> Ubah Kata Sandi
            </h2>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              data-testid="toggle-passwords"
              @click="showPasswords = !showPasswords"
            >
              <EyeOff v-if="showPasswords" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
              {{ showPasswords ? "Sembunyikan" : "Tampilkan" }}
            </button>
          </div>

          <form class="space-y-4" novalidate data-testid="password-form" @submit.prevent="onPasswordSubmit">
            <div>
              <label for="current-password" class="mb-1.5 block text-sm font-semibold text-slate-700"
                >Kata Sandi Saat Ini</label
              >
              <input
                id="current-password"
                :type="showPasswords ? 'text' : 'password'"
                autocomplete="current-password"
                data-testid="current-password-input"
                :value="currentPassword"
                :class="[inputClass, passwordErrors.current ? errClass : okClass]"
                @input="onCurrentPasswordChange"
              />
              <p v-if="passwordErrors.current" class="mt-1.5 text-xs font-medium text-red-600" data-testid="current-password-error">
                {{ passwordErrors.current }}
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="new-password" class="mb-1.5 block text-sm font-semibold text-slate-700"
                  >Kata Sandi Baru</label
                >
                <input
                  id="new-password"
                  :type="showPasswords ? 'text' : 'password'"
                  autocomplete="new-password"
                  data-testid="new-password-input"
                  :value="newPassword"
                  :class="[inputClass, passwordErrors.next ? errClass : okClass]"
                  @input="onNewPasswordChange"
                />
                <p v-if="passwordErrors.next" class="mt-1.5 text-xs font-medium text-red-600" data-testid="new-password-error">
                  {{ passwordErrors.next }}
                </p>
              </div>
              <div>
                <label for="confirm-password" class="mb-1.5 block text-sm font-semibold text-slate-700"
                  >Konfirmasi Kata Sandi Baru</label
                >
                <input
                  id="confirm-password"
                  :type="showPasswords ? 'text' : 'password'"
                  autocomplete="new-password"
                  data-testid="confirm-password-input"
                  :value="confirmPassword"
                  :class="[inputClass, passwordErrors.confirm ? errClass : okClass]"
                  @input="onConfirmPasswordChange"
                />
                <p v-if="passwordErrors.confirm" class="mt-1.5 text-xs font-medium text-red-600" data-testid="confirm-password-error">
                  {{ passwordErrors.confirm }}
                </p>
              </div>
            </div>

            <button
              type="submit"
              :disabled="usersStore.isPasswordChange"
              class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
              data-testid="save-password"
            >
              <Loader2 v-if="usersStore.isPasswordChange" class="h-4 w-4 animate-spin" />
              Ubah Kata Sandi
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
