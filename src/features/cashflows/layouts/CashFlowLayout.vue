<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const sidebarOpen = ref(false);

// Guard: area dashboard hanya untuk pengguna yang sudah login.
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) router.replace("/auth/login");
  },
  { immediate: true }
);

// Tutup sidebar (layar kecil) setiap kali berpindah halaman.
watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  }
);

onMounted(() => {
  if (authStore.isAuthenticated) usersStore.fetchProfile();
});
</script>

<template>
  <div v-if="authStore.isAuthenticated" class="flex min-h-screen" data-testid="cashflow-layout">
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
