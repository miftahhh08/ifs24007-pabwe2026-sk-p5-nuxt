<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Mail, SearchX, Search, Users } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { formatDate, getInitials, getPhotoUrl } from "../../../helpers/toolsHelper";
import { useUsersStore } from "../states/usersStore";

const usersStore = useUsersStore();

const [search, onSearchChange] = useInput("");
/** id pengguna yang fotonya gagal dimuat -> tampilkan inisial. */
const failedPhotos = ref<number[]>([]);

const filteredUsers = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return usersStore.users;

  return usersStore.users.filter(
    (user) =>
      (user.name ?? "").toLowerCase().includes(keyword) ||
      (user.email ?? "").toLowerCase().includes(keyword)
  );
});

function showPhoto(id: number, photo?: string | null): string | null {
  return failedPhotos.value.includes(id) ? null : getPhotoUrl(photo);
}

function onPhotoError(id: number) {
  failedPhotos.value.push(id);
}

onMounted(() => {
  usersStore.fetchUsers();
  if (!usersStore.profile) usersStore.fetchProfile();
});
</script>

<template>
  <div data-testid="users-page">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <Users class="h-6 w-6 text-emerald-600" /> Direktori Pengguna
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Seluruh pengguna yang terdaftar di Delcom Cash Flow.
        </p>
      </div>

      <div class="relative w-full sm:w-72">
        <Search class="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Cari nama atau email..."
          data-testid="search-input"
          :value="search"
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          @input="onSearchChange"
        />
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="usersStore.isUsers && usersStore.users.length === 0"
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      data-testid="users-loading"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="h-28 animate-pulse rounded-2xl border border-slate-100 bg-white"
      />
    </div>

    <!-- Kosong -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
      data-testid="users-empty"
    >
      <SearchX class="h-10 w-10 text-slate-300" />
      <p class="mt-3 font-semibold text-slate-700">Pengguna tidak ditemukan</p>
      <p class="text-sm text-slate-500">Coba kata kunci lain.</p>
    </div>

    <!-- Daftar -->
    <template v-else>
      <p class="mb-3 text-sm text-slate-500" data-testid="users-count">
        Menampilkan <span class="font-bold text-slate-700">{{ filteredUsers.length }}</span> pengguna
      </p>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="user in filteredUsers"
          :key="user.id"
          class="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          data-testid="user-card"
        >
          <img
            v-if="showPhoto(user.id, user.photo)"
            :src="showPhoto(user.id, user.photo)!"
            :alt="user.name"
            class="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
            @error="onPhotoError(user.id)"
          />
          <div
            v-else
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700"
            data-testid="user-initials"
          >
            {{ getInitials(user.name) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h2 class="truncate font-bold text-slate-900">{{ user.name }}</h2>
              <span
                v-if="usersStore.profile?.id === user.id"
                class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700"
                data-testid="me-badge"
                >Kamu</span
              >
            </div>
            <p class="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
              <Mail class="h-3.5 w-3.5 shrink-0" /> {{ user.email }}
            </p>
            <p class="mt-1 text-xs text-slate-400">Bergabung {{ formatDate(user.created_at) }}</p>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>
