<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const { value: name } = useInput("");
const { value: email } = useInput("");
const { value: password } = useInput("");

async function handleSubmit() {
  if (!name.value.trim() || !email.value.trim() || !password.value) {
    await showErrorDialog("Nama, email, dan kata sandi wajib diisi.");
    return;
  }

  const response = await authStore.register({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });

  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }

  await showSuccessDialog(response.message);
  await router.replace("/auth/login");
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight">Buat akun</h1>
    <p class="mt-2 text-slate-500">Daftar untuk mulai mencatat arus kas.</p>

    <form class="mt-8 space-y-5" data-testid="register-form" @submit.prevent="handleSubmit">
      <div>
        <label for="register-name-input" class="mb-1.5 block text-sm font-semibold">Nama lengkap</label>
        <input
          id="register-name-input"
          v-model="name"
          type="text"
          autocomplete="name"
          placeholder="Nama kamu"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>
      <div>
        <label for="register-email-input" class="mb-1.5 block text-sm font-semibold">Email</label>
        <input
          id="register-email-input"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>
      <div>
        <label for="register-password-input" class="mb-1.5 block text-sm font-semibold">Kata sandi</label>
        <input
          id="register-password-input"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="Buat kata sandi"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>
      <button
        id="register-submit-button"
        type="submit"
        :disabled="authStore.isAuthRegister"
        class="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        Daftar
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-bold text-emerald-700 hover:underline">
        Masuk
      </RouterLink>
    </p>
  </div>
</template>
