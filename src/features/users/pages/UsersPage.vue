<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { getInitials, resolveAssetUrl } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

onMounted(async () => {
  await usersStore.fetchUsers();
});
</script>

<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight">Direktori Pengguna</h1>
      <p class="text-sm text-slate-500">Semua pengguna yang terdaftar di sistem.</p>
    </header>

    <p v-if="usersStore.isUsers" class="text-slate-500" data-testid="users-loading">
      Memuat pengguna...
    </p>
    <p
      v-else-if="usersStore.users.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      data-testid="users-empty"
    >
      Belum ada pengguna.
    </p>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="user in usersStore.users"
        :key="user.id"
        data-testid="user-card"
        class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <img
          v-if="user.photo"
          :src="resolveAssetUrl(user.photo)"
          :alt="user.name"
          class="size-12 rounded-full object-cover"
        />
        <div
          v-else
          class="flex size-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700"
        >
          {{ getInitials(user.name) }}
        </div>
        <div class="min-w-0">
          <p class="truncate font-bold">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
