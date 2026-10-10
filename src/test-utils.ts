import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const Stub = { render: () => null };

/** Membuat Pinia baru dan menjadikannya aktif (dipakai untuk menguji store). */
export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export interface RenderOptions {
  props?: Record<string, unknown>;
  route?: string;
  routes?: RouteRecordRaw[];
  pinia?: ReturnType<typeof createPinia>;
}

/**
 * Me-render komponen lengkap dengan Pinia dan Memory Router.
 * Secara default semua path diterima oleh rute catch-all.
 */
export async function renderWithProviders(component: any, options: RenderOptions = {}) {
  const pinia = options.pinia ?? createMockPinia();
  setActivePinia(pinia);

  const routes: RouteRecordRaw[] = options.routes ?? [
    { path: "/:pathMatch(.*)*", component: Stub },
  ];
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(options.route ?? "/");
  await router.isReady();

  const wrapper = mount(component, {
    props: options.props,
    global: { plugins: [pinia, router] },
  });
  await flushPromises();

  return { wrapper, router, pinia };
}

export { Stub };
