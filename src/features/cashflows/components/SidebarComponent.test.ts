import { describe, expect, it } from "vitest";
import { Stub, renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

const routes = [{ path: "/:pathMatch(.*)*", component: Stub }];

describe("SidebarComponent", () => {
  it("tertutup: sidebar tergeser keluar dan tanpa backdrop", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, {
      props: { open: false },
      routes,
    });
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain("-translate-x-full");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("terbuka: menampilkan backdrop yang menutup sidebar saat diklik", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, {
      props: { open: true },
      routes,
    });
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain("translate-x-0");
    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("memiliki tiga menu dan menutup sidebar saat menu diklik", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, {
      props: { open: true },
      routes,
    });
    const links = wrapper.findAll("a");
    expect(links.map((link) => link.attributes("href"))).toEqual(["/", "/users", "/profile"]);
    await links[1].trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
