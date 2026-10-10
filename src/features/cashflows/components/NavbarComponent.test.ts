import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { putAccessToken, getAccessToken } from "../../../helpers/apiHelper";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { Stub, createMockPinia, renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../../users/states/usersStore";
import NavbarComponent from "./NavbarComponent.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
}));

const routes = [
  { path: "/", component: Stub },
  { path: "/auth/login", component: Stub },
];

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.mocked(showConfirmDialog).mockReset();
  });

  it("menampilkan 'Memuat profil' jika profil belum ada", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, { routes });
    expect(wrapper.text()).toContain("Memuat profil");
    expect(wrapper.text()).toContain("Sesi aktif");
  });

  it("menampilkan nama dan email pengguna aktif", async () => {
    const pinia = createMockPinia();
    useUsersStore().$patch({
      profile: { id: "1", name: "Budi", email: "budi@x.c", photo: null },
    });
    const { wrapper } = await renderWithProviders(NavbarComponent, { pinia, routes });
    expect(wrapper.find('[data-testid="navbar-name"]').text()).toBe("Budi");
    expect(wrapper.find('[data-testid="navbar-email"]').text()).toBe("budi@x.c");
  });

  it("emit toggle saat tombol menu diklik", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.find('[data-testid="toggle-sidebar"]').trigger("click");
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("batal keluar jika dialog tidak dikonfirmasi", async () => {
    putAccessToken("tok");
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper, router } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await flushPromises();
    expect(getAccessToken()).toBe("tok");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("keluar: hapus token lalu ke halaman login", async () => {
    putAccessToken("tok");
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    const { wrapper, router } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await flushPromises();
    expect(getAccessToken()).toBeNull();
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });
});
