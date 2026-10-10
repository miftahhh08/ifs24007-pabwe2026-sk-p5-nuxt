import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "./App.vue";

describe("App", () => {
  it("merender komponen rute aktif lewat RouterView", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/", component: { render: () => "Halaman uji" } }],
    });
    await router.push("/");
    await router.isReady();

    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain("Halaman uji");
  });
});
