<script setup lang="ts">
import { LogOut, Menu } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits<{ toggle: [] }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

async function handleLogout() {
  const confirmed = await showConfirmDialog(
    "Keluar dari aplikasi?",
    "Sesi kamu akan diakhiri.",
    "Ya, keluar"
  );
  if (!confirmed) {
    return;
  }
  await authStore.logout();
  await router.replace("/auth/login");
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6"
  >
    <button
      type="button"
      aria-label="Buka menu"
      data-testid="toggle-sidebar"
      class="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
      @click="emit('toggle')"
    >
      <Menu class="size-5" />
    </button>

    <div class="ml-auto flex items-center gap-4">
      <div class="text-right leading-tight">
        <template v-if="usersStore.profile">
          <p class="text-sm font-bold" data-testid="navbar-name">{{ usersStore.profile.name }}</p>
          <p class="text-xs text-slate-500" data-testid="navbar-email">
            {{ usersStore.profile.email }}
          </p>
        </template>
        <p v-else class="text-sm text-slate-500">Memuat profil...</p>
        <p class="mt-0.5 flex items-center justify-end gap-1 text-xs font-semibold text-emerald-700">
          <span class="size-1.5 rounded-full bg-emerald-500" />
          Sesi aktif
        </p>
      </div>
      <button
        type="button"
        data-testid="logout-button"
        class="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        @click="handleLogout"
      >
        <LogOut class="size-4" />
        Keluar
      </button>
    </div>
  </header>
</template>
