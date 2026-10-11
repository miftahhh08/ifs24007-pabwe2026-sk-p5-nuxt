<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Loader2, LogOut, Menu } from "lucide-vue-next";
import { getInitials, getPhotoUrl } from "../../../helpers/toolsHelper";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { useCashFlowsStore } from "../states/cashFlowsStore";

defineEmits<{ (e: "toggle-sidebar"): void }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const cashFlowsStore = useCashFlowsStore();

/** Delcom tidak punya field username, jadi dipakai bagian depan email: budi@x.id -> @budi */
const username = computed(() => {
  const email = usersStore.profile?.email;
  return email ? `@${email.split("@")[0]}` : "";
});

const photoUrl = computed(() => getPhotoUrl(usersStore.profile?.photo));

async function onLogout() {
  const isSuccess = await authStore.logout();
  if (!isSuccess) return;

  usersStore.reset();
  cashFlowsStore.reset();
  router.replace("/auth/login");
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6"
    data-testid="navbar"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Buka menu"
        data-testid="menu-button"
        @click="$emit('toggle-sidebar')"
      >
        <Menu class="h-6 w-6" />
      </button>

      <div
        class="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex"
        data-testid="session-status"
      >
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Sesi aktif
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-3">
        <img
          v-if="photoUrl"
          :src="photoUrl"
          alt="Foto profil"
          class="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-100"
          data-testid="navbar-photo"
        />
        <div
          v-else
          class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700"
          data-testid="navbar-initials"
        >
          {{ getInitials(usersStore.profile?.name) }}
        </div>

        <div class="hidden leading-tight sm:block">
          <p class="text-sm font-bold text-slate-900" data-testid="navbar-name">
            {{ usersStore.profile?.name ?? "Memuat..." }}
          </p>
          <p class="text-xs text-slate-500" data-testid="navbar-username">{{ username }}</p>
        </div>
      </div>

      <button
        type="button"
        :disabled="authStore.isAuthLogout"
        class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        data-testid="logout-button"
        @click="onLogout"
      >
        <Loader2 v-if="authStore.isAuthLogout" class="h-4 w-4 animate-spin" />
        <LogOut v-else class="h-4 w-4" />
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>
