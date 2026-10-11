<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { LayoutDashboard, UserRound, Users, X } from "lucide-vue-next";

defineProps<{ open?: boolean }>();
defineEmits<{ (e: "close"): void }>();

const route = useRoute();

interface MenuItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** true: aktif hanya jika path persis sama (untuk "/") */
  exact: boolean;
  /** path lain yang juga menandai menu ini aktif */
  extra: string[];
}

const menus: MenuItem[] = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard, exact: true, extra: ["/cash-flows"] },
  { to: "/users", label: "Direktori Pengguna", icon: Users, exact: false, extra: [] },
  { to: "/profile", label: "Profil Saya", icon: UserRound, exact: false, extra: [] },
];

function isActive(item: MenuItem): boolean {
  const path = route.path;
  const matched = item.exact ? path === item.to : path.startsWith(item.to);
  return matched || item.extra.some((prefix) => path.startsWith(prefix));
}
</script>

<template>
  <!-- Latar gelap saat menu terbuka di layar kecil -->
  <div
    v-if="open"
    class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
    data-testid="sidebar-backdrop"
    @click="$emit('close')"
  />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
    data-testid="sidebar"
  >
    <div class="flex h-16 items-center justify-between border-b border-slate-100 px-6">
      <div class="flex items-center gap-3">
        <img src="/logo.svg" alt="Logo" class="h-9 w-9 rounded-xl" />
        <span class="text-lg font-extrabold tracking-tight text-slate-900">Delcom Cash Flow</span>
      </div>
      <button
        type="button"
        class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Tutup menu"
        data-testid="close-button"
        @click="$emit('close')"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 p-4" data-testid="sidebar-nav">
      <p class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Menu</p>

      <RouterLink
        v-for="item in menus"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
          isActive(item)
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        ]"
        :data-testid="`menu-${item.to === '/' ? 'home' : item.to.slice(1)}`"
        :data-active="isActive(item)"
        @click="$emit('close')"
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <p class="border-t border-slate-100 p-4 text-center text-xs text-slate-400">
      © {{ new Date().getFullYear() }} Delcom Cash Flow
    </p>
  </aside>
</template>
