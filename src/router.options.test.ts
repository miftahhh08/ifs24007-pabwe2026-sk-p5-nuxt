import { describe, expect, it } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import routerOptions from "./router.options";
import { routes } from "./routes";

function flatten(list: RouteRecordRaw[]): RouteRecordRaw[] {
  return list.flatMap((route) => [route, ...flatten(route.children ?? [])]);
}

describe("router.options", () => {
  it("menyuplai daftar rute dari routes.ts", () => {
    expect(routerOptions.routes()).toBe(routes);
  });
});

describe("routes", () => {
  const all = flatten(routes);

  it("mendefinisikan semua halaman utama", () => {
    const names = all.map((route) => route.name).filter(Boolean);
    expect(names).toEqual(
      expect.arrayContaining([
        "login",
        "register",
        "home",
        "cash-flow-detail",
        "users",
        "profile",
        "not-found",
      ])
    );
  });

  it("/auth diarahkan ke /auth/login", () => {
    const auth = routes.find((route) => route.path === "/auth")!;
    expect(auth.children!.find((child) => child.path === "")!.redirect).toBe("/auth/login");
  });

  it("setiap komponen dimuat secara lazy tanpa error", async () => {
    const loaders = all
      .map((route) => route.component)
      .filter((component): component is () => Promise<unknown> => typeof component === "function");
    expect(loaders.length).toBeGreaterThanOrEqual(9);

    for (const load of loaders) {
      const module: any = await load();
      expect(module.default).toBeDefined();
    }
  });
});
