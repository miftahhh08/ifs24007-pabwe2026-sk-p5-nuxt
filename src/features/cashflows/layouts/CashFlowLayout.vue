<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const sidebarOpen = ref(false);

// Guard: halaman ini hanya untuk pengguna yang sudah login
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await router.replace("/auth/login");
    return;
  }

  const response = await usersStore.fetchProfile();
  if (!response.success && response.status === 401) {
    // Token tidak valid / kedaluwarsa
    await authStore.logout();
    await router.replace("/auth/login");
  }
});
</script>

<template>
  <div class="min-h-screen lg:pl-64">
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="flex min-h-screen flex-col">
      <NavbarComponent @toggle="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-4 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
