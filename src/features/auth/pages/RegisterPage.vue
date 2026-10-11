<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const router = useRouter();
const authStore = useAuthStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const [confirmPassword, onConfirmPasswordChange] = useInput("");
const showPassword = ref(false);

const errors = reactive({ name: "", email: "", password: "", confirmPassword: "" });

function validate(): boolean {
  const emailValue = email.value.trim();

  errors.name = name.value.trim() ? "" : "Nama wajib diisi.";

  if (!emailValue) errors.email = "Email wajib diisi.";
  else if (!EMAIL_REGEX.test(emailValue)) errors.email = "Format email tidak valid.";
  else errors.email = "";

  if (!password.value) errors.password = "Kata sandi wajib diisi.";
  else if (password.value.length < MIN_PASSWORD)
    errors.password = `Kata sandi minimal ${MIN_PASSWORD} karakter.`;
  else errors.password = "";

  errors.confirmPassword =
    confirmPassword.value === password.value ? "" : "Konfirmasi kata sandi tidak sama.";

  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
}

async function onSubmit() {
  if (!validate()) return;

  const isSuccess = await authStore.register({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });

  if (isSuccess) router.push("/auth/login");
}
</script>

<template>
  <div data-testid="register-page">
    <div class="mb-8">
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">Buat akun baru ✨</h2>
      <p class="mt-2 text-slate-500">Daftar gratis dan mulai catat arus kasmu hari ini.</p>
    </div>

    <form class="space-y-5" novalidate data-testid="register-form" @submit.prevent="onSubmit">
      <!-- Nama -->
      <div>
        <label for="name" class="mb-1.5 block text-sm font-semibold text-slate-700">Nama Lengkap</label>
        <div class="relative">
          <User class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            id="name"
            type="text"
            autocomplete="name"
            placeholder="Nama kamu"
            data-testid="name-input"
            :value="name"
            :class="[
              'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4',
              errors.name
                ? 'border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100',
            ]"
            @input="onNameChange"
          />
        </div>
        <p v-if="errors.name" class="mt-1.5 text-xs font-medium text-red-600" data-testid="name-error">
          {{ errors.name }}
        </p>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
        <div class="relative">
          <Mail class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            id="email"
            type="email"
            autocomplete="email"
            placeholder="nama@email.com"
            data-testid="email-input"
            :value="email"
            :class="[
              'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4',
              errors.email
                ? 'border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100',
            ]"
            @input="onEmailChange"
          />
        </div>
        <p v-if="errors.email" class="mt-1.5 text-xs font-medium text-red-600" data-testid="email-error">
          {{ errors.email }}
        </p>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="mb-1.5 block text-sm font-semibold text-slate-700">Kata Sandi</label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Minimal 6 karakter"
            data-testid="password-input"
            :value="password"
            :class="[
              'w-full rounded-xl border bg-white py-3 pl-11 pr-12 text-sm outline-none transition focus:ring-4',
              errors.password
                ? 'border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100',
            ]"
            @input="onPasswordChange"
          />
          <button
            type="button"
            class="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            data-testid="toggle-password"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="h-5 w-5" />
            <Eye v-else class="h-5 w-5" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1.5 text-xs font-medium text-red-600" data-testid="password-error">
          {{ errors.password }}
        </p>
      </div>

      <!-- Konfirmasi password -->
      <div>
        <label for="confirmPassword" class="mb-1.5 block text-sm font-semibold text-slate-700"
          >Konfirmasi Kata Sandi</label
        >
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            id="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Ulangi kata sandi"
            data-testid="confirm-password-input"
            :value="confirmPassword"
            :class="[
              'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4',
              errors.confirmPassword
                ? 'border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100',
            ]"
            @input="onConfirmPasswordChange"
          />
        </div>
        <p
          v-if="errors.confirmPassword"
          class="mt-1.5 text-xs font-medium text-red-600"
          data-testid="confirm-password-error"
        >
          {{ errors.confirmPassword }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="authStore.isAuthRegister"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        data-testid="register-button"
      >
        <Loader2 v-if="authStore.isAuthRegister" class="h-4 w-4 animate-spin" />
        {{ authStore.isAuthRegister ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink
        to="/auth/login"
        class="font-bold text-emerald-600 hover:text-emerald-700"
        data-testid="to-login"
        >Masuk di sini</RouterLink
      >
    </p>
  </div>
</template>
