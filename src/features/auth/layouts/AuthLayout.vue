<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView, useRouter } from "vue-router";
import { Wallet } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

// Pengguna yang sudah login tidak perlu melihat halaman login/register
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace("/");
  }
});
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-emerald-700 p-12 text-emerald-50 lg:flex"
    >
      <div class="flex items-center gap-3 text-lg font-extrabold tracking-tight">
        <Wallet class="size-7" />
        Delcom Cash Flow
      </div>
      <div class="max-w-md space-y-4">
        <h2 class="text-4xl font-extrabold leading-tight">
          Setiap rupiah tercatat, setiap saldo terlihat.
        </h2>
        <p class="leading-relaxed text-emerald-100">
          Catat pemasukan dan pengeluaran dari kas tunai, tabungan, maupun pinjaman, lalu
          pantau ringkasannya dalam satu dasbor.
        </p>
      </div>
      <p class="text-sm text-emerald-200">Praktikum Pengembangan Aplikasi Web 2026</p>
    </aside>

    <main class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <RouterView />
      </div>
    </main>
  </div>
</template>
