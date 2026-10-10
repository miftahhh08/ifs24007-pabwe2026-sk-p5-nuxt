import { describe, expect, it } from "vitest";
import { putAccessToken } from "../../../helpers/apiHelper";
import { Stub, renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

const routes = [
  { path: "/", component: Stub },
  { path: "/auth/login", component: Stub },
];

describe("AuthLayout", () => {
  it("menampilkan panel merek dan tetap di halaman auth jika belum login", async () => {
    const { wrapper, router } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
      routes,
    });
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("mengarahkan ke beranda jika sudah login", async () => {
    putAccessToken("token");
    const { router } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
      routes,
    });
    expect(router.currentRoute.value.fullPath).toBe("/");
  });
});
