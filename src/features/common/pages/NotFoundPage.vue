<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <p class="text-7xl font-extrabold text-emerald-600">404</p>
    <h1 class="text-2xl font-bold">Halaman tidak ditemukan</h1>
    <p class="max-w-md text-slate-500">
      Alamat yang kamu tuju tidak ada atau sudah dipindahkan.
    </p>
    <RouterLink
      to="/"
      class="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-700"
    >
      Kembali ke beranda
    </RouterLink>
  </main>
</template>
