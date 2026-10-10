<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import { PiggyBank, ShieldCheck, TrendingUp, Wallet } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";

const authStore = useAuthStore();
const router = useRouter();

// Guard: pengguna yang sudah login tidak perlu melihat halaman login/register.
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) router.replace("/");
  },
  { immediate: true }
);

const highlights = [
  { icon: TrendingUp, text: "Catat pemasukan & pengeluaran dengan cepat" },
  { icon: Wallet, text: "Pantau saldo tunai, tabungan, dan pinjaman" },
  { icon: PiggyBank, text: "Filter transaksi berdasarkan label & tanggal" },
  { icon: ShieldCheck, text: "Data tersimpan aman di akun pribadimu" },
];
</script>

<template>
  <div class="flex min-h-screen" data-testid="auth-layout">
    <!-- Banner (desktop) -->
    <aside
      class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 text-white lg:flex"
      data-testid="auth-banner"
    >
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10"
      />
      <div
        class="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10"
      />

      <div class="relative flex items-center gap-3">
        <img src="/logo.svg" alt="Logo" class="h-10 w-10 rounded-xl" />
        <span class="text-xl font-extrabold tracking-tight">Delcom Cash Flow</span>
      </div>

      <div class="relative">
        <h1 class="text-4xl font-extrabold leading-tight">
          Kelola arus kas pribadi<br />tanpa ribet.
        </h1>
        <p class="mt-4 max-w-md text-emerald-100">
          Satu tempat untuk mencatat setiap rupiah yang masuk dan keluar, lengkap
          dengan ringkasan saldo yang mudah dipahami.
        </p>

        <ul class="mt-8 space-y-4">
          <li
            v-for="item in highlights"
            :key="item.text"
            class="flex items-center gap-3 text-sm font-medium"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"
            >
              <component :is="item.icon" class="h-5 w-5" />
            </span>
            {{ item.text }}
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-emerald-200">
        © {{ new Date().getFullYear() }} Delcom Cash Flow
      </p>
    </aside>

    <!-- Konten form -->
    <main class="flex w-full flex-1 items-center justify-center px-6 py-12 lg:w-1/2">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <img src="/logo.svg" alt="Logo" class="h-10 w-10 rounded-xl" />
          <span class="text-xl font-extrabold tracking-tight text-slate-900"
            >Delcom Cash Flow</span
          >
        </div>

        <RouterView />
      </div>
    </main>
  </div>
</template>
