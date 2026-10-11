<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = useRouter();
const authStore = useAuthStore();

const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const showPassword = ref(false);

const errors = reactive({ email: "", password: "" });

function validate(): boolean {
  const emailValue = email.value.trim();

  if (!emailValue) errors.email = "Email wajib diisi.";
  else if (!EMAIL_REGEX.test(emailValue)) errors.email = "Format email tidak valid.";
  else errors.email = "";

  errors.password = password.value ? "" : "Kata sandi wajib diisi.";

  return !errors.email && !errors.password;
}

async function onSubmit() {
  if (!validate()) return;

  const isSuccess = await authStore.login({
    email: email.value.trim(),
    password: password.value,
  });

  if (isSuccess) router.push("/");
}
</script>

<template>
  <div data-testid="login-page">
    <div class="mb-8">
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">
        Selamat datang kembali 👋
      </h2>
      <p class="mt-2 text-slate-500">Masuk untuk melanjutkan pencatatan arus kasmu.</p>
    </div>

    <form class="space-y-5" novalidate data-testid="login-form" @submit.prevent="onSubmit">
      <!-- Email -->
      <div>
        <label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700"
          >Email</label
        >
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
        <label for="password" class="mb-1.5 block text-sm font-semibold text-slate-700"
          >Kata Sandi</label
        >
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
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

      <button
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        data-testid="login-button"
      >
        <Loader2 v-if="authStore.isAuthLogin" class="h-4 w-4 animate-spin" />
        {{ authStore.isAuthLogin ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink
        to="/auth/register"
        class="font-bold text-emerald-600 hover:text-emerald-700"
        data-testid="to-register"
        >Daftar sekarang</RouterLink
      >
    </p>
  </div>
</template>
