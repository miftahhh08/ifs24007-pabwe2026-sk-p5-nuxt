import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { Stub, renderWithProviders } from "../../../test-utils";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { postLogin } from "../api/authApi";
import LoginPage from "./LoginPage.vue";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

const routes = [
  { path: "/", component: Stub },
  { path: "/auth/login", component: Stub },
  { path: "/auth/register", component: Stub },
];

async function submit(email: string, password: string) {
  const ctx = await renderWithProviders(LoginPage, { route: "/auth/login", routes });
  await ctx.wrapper.find("#login-email-input").setValue(email);
  await ctx.wrapper.find("#login-password-input").setValue(password);
  await ctx.wrapper.find("form").trigger("submit");
  await flushPromises();
  return ctx;
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(postLogin).mockReset();
    vi.mocked(showErrorDialog).mockReset();
    vi.mocked(showSuccessDialog).mockReset();
  });

  it("menampilkan form dan tautan daftar", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { routes });
    expect(wrapper.text()).toContain("Masuk");
    expect(wrapper.find("#login-submit-button").exists()).toBe(true);
    expect(wrapper.find("a").attributes("href")).toBe("/auth/register");
  });

  it("menolak jika email kosong", async () => {
    await submit("", "rahasia");
    expect(showErrorDialog).toHaveBeenCalledWith("Email dan kata sandi wajib diisi.");
    expect(postLogin).not.toHaveBeenCalled();
  });

  it("menolak jika kata sandi kosong", async () => {
    await submit("a@b.c", "");
    expect(showErrorDialog).toHaveBeenCalledWith("Email dan kata sandi wajib diisi.");
    expect(postLogin).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error jika login gagal", async () => {
    vi.mocked(postLogin).mockResolvedValue({ success: false, message: "Email salah", data: null, status: 401 });
    const { router } = await submit("a@b.c", "rahasia");
    expect(showErrorDialog).toHaveBeenCalledWith("Email salah");
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("login sukses lalu pindah ke beranda", async () => {
    vi.mocked(postLogin).mockResolvedValue({
      success: true,
      message: "Login berhasil",
      data: { token: "tok" },
      status: 200,
    });
    const { router } = await submit(" a@b.c ", "rahasia");
    expect(postLogin).toHaveBeenCalledWith({ email: "a@b.c", password: "rahasia" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Login berhasil");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });
});
