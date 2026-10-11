<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const { value: email } = useInput("");
const { value: password } = useInput("");

async function handleSubmit() {
  if (!email.value.trim() || !password.value) {
    await showErrorDialog("Email dan kata sandi wajib diisi.");
    return;
  }

  const response = await authStore.login({
    email: email.value.trim(),
    password: password.value,
  });

  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }

  await showSuccessDialog(response.message);
  await router.replace("/");
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight">Masuk</h1>
    <p class="mt-2 text-slate-500">Lanjutkan ke dasbor arus kas kamu.</p>

    <form class="mt-8 space-y-5" data-testid="login-form" @submit.prevent="handleSubmit">
      <div>
        <label for="login-email" class="mb-1.5 block text-sm font-semibold">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>
      <div>
        <label for="login-password" class="mb-1.5 block text-sm font-semibold">Kata sandi</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Masukkan kata sandi"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>
      <button
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        Masuk
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-bold text-emerald-700 hover:underline">
        Daftar sekarang
      </RouterLink>
    </p>
  </div>
</template>
