<script setup lang="ts">
import { LayoutDashboard, User, Users, Wallet } from "lucide-vue-next";
import { RouterLink } from "vue-router";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const menus = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard },
  { to: "/users", label: "Direktori Pengguna", icon: Users },
  { to: "/profile", label: "Profil Saya", icon: User },
];
</script>

<template>
  <div>
    <div
      v-if="open"
      data-testid="sidebar-backdrop"
      class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
      @click="emit('close')"
    />

    <aside
      data-testid="sidebar"
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-4 transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="mb-8 flex items-center gap-2.5 px-2 text-lg font-extrabold tracking-tight">
        <span class="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Wallet class="size-5" />
        </span>
        Cash Flow
      </div>

      <nav class="space-y-1">
        <RouterLink
          v-for="menu in menus"
          :key="menu.to"
          :to="menu.to"
          exact-active-class="!bg-emerald-50 !text-emerald-700"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-100"
          @click="emit('close')"
        >
          <component :is="menu.icon" class="size-5" />
          {{ menu.label }}
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>
