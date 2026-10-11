import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { createMockPinia } from "../../../test-utils";
import { postLogin, postRegister } from "../api/authApi";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi");

const ok = (data: any) => ({ success: true, message: "Berhasil", data, status: 200 });
const fail = { success: false, message: "Salah", data: null, status: 401 };

describe("authStore", () => {
  beforeEach(() => {
    vi.mocked(postLogin).mockReset();
    vi.mocked(postRegister).mockReset();
    createMockPinia();
  });

  it("token awal kosong dan belum terautentikasi", () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it("membaca token yang sudah tersimpan", () => {
    putAccessToken("lama");
    createMockPinia();
    const store = useAuthStore();
    expect(store.token).toBe("lama");
    expect(store.isAuthenticated).toBe(true);
  });

  it("login sukses menyimpan token", async () => {
    vi.mocked(postLogin).mockResolvedValue(ok({ token: "baru" }));
    const store = useAuthStore();
    const response = await store.login({ email: "a@b.c", password: "1" });
    expect(response.success).toBe(true);
    expect(store.token).toBe("baru");
    expect(getAccessToken()).toBe("baru");
    expect(store.isAuthLogin).toBe(false);
  });

  it("login sukses dengan field access_token", async () => {
    vi.mocked(postLogin).mockResolvedValue(ok({ access_token: "dari-access-token" }));
    const store = useAuthStore();
    const response = await store.login({ email: "a@b.c", password: "1" });
    expect(response.success).toBe(true);
    expect(store.token).toBe("dari-access-token");
  });

  it("login dianggap gagal jika response tidak memuat token", async () => {
    vi.mocked(postLogin).mockResolvedValue(ok({}));
    const store = useAuthStore();
    const response = await store.login({ email: "a@b.c", password: "1" });
    expect(response.success).toBe(false);
    expect(response.message).toBe("Token tidak ditemukan pada response login.");
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("login gagal tidak menyimpan token", async () => {
    vi.mocked(postLogin).mockResolvedValue(fail);
    const store = useAuthStore();
    const response = await store.login({ email: "a@b.c", password: "1" });
    expect(response.success).toBe(false);
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogin).toBe(false);
  });

  it("register mengembalikan response", async () => {
    vi.mocked(postRegister).mockResolvedValue(ok(null));
    const store = useAuthStore();
    const response = await store.register({ name: "B", email: "a@b.c", password: "1" });
    expect(response.success).toBe(true);
    expect(store.isAuthRegister).toBe(false);
  });

  it("logout menghapus token", async () => {
    putAccessToken("x");
    createMockPinia();
    const store = useAuthStore();
    await store.logout();
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogout).toBe(false);
  });
});
