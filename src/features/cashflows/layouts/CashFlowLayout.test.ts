import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { Stub, renderWithProviders } from "../../../test-utils";
import { getMe } from "../../users/api/userApi";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import CashFlowLayout from "./CashFlowLayout.vue";

vi.mock("../../users/api/userApi");

const routes = [
  { path: "/", component: Stub },
  { path: "/users", component: Stub },
  { path: "/profile", component: Stub },
  { path: "/auth/login", component: Stub },
];

const profile = { id: "1", name: "Budi", email: "budi@x.c", photo: null };

describe("CashFlowLayout", () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset();
  });

  it("belum login: diarahkan ke halaman login tanpa memanggil API", async () => {
    const { router } = await renderWithProviders(CashFlowLayout, { routes });
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
    expect(getMe).not.toHaveBeenCalled();
  });

  it("sudah login: memuat profil dan tetap di halaman", async () => {
    putAccessToken("tok");
    vi.mocked(getMe).mockResolvedValue({
      success: true,
      message: "OK",
      data: { user: profile },
      status: 200,
    });
    const { wrapper, router } = await renderWithProviders(CashFlowLayout, { routes });
    expect(router.currentRoute.value.fullPath).toBe("/");
    expect(wrapper.text()).toContain("Budi");
  });

  it("token tidak valid (401): logout lalu ke halaman login", async () => {
    putAccessToken("kedaluwarsa");
    vi.mocked(getMe).mockResolvedValue({
      success: false,
      message: "Unauthorized",
      data: null,
      status: 401,
    });
    const { router } = await renderWithProviders(CashFlowLayout, { routes });
    expect(getAccessToken()).toBeNull();
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("gagal bukan 401: tetap login", async () => {
    putAccessToken("tok");
    vi.mocked(getMe).mockResolvedValue({
      success: false,
      message: "Server error",
      data: null,
      status: 500,
    });
    const { router } = await renderWithProviders(CashFlowLayout, { routes });
    expect(getAccessToken()).toBe("tok");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("tombol menu membuka dan sidebar menutup kembali", async () => {
    putAccessToken("tok");
    vi.mocked(getMe).mockResolvedValue({
      success: true,
      message: "OK",
      data: { user: profile },
      status: 200,
    });
    const { wrapper } = await renderWithProviders(CashFlowLayout, { routes });
    const sidebar = wrapper.findComponent(SidebarComponent);
    expect(sidebar.props("open")).toBe(false);

    await wrapper.findComponent(NavbarComponent).vm.$emit("toggle");
    expect(sidebar.props("open")).toBe(true);

    await sidebar.vm.$emit("close");
    expect(sidebar.props("open")).toBe(false);
  });
});