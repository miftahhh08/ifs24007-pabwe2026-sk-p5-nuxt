import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { Stub, renderWithProviders } from "../../../test-utils";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { postRegister } from "../api/authApi";
import RegisterPage from "./RegisterPage.vue";

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

async function submit(name: string, email: string, password: string) {
  const ctx = await renderWithProviders(RegisterPage, { route: "/auth/register", routes });
  await ctx.wrapper.find("#register-name").setValue(name);
  await ctx.wrapper.find("#register-email").setValue(email);
  await ctx.wrapper.find("#register-password").setValue(password);
  await ctx.wrapper.find("form").trigger("submit");
  await flushPromises();
  return ctx;
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.mocked(postRegister).mockReset();
    vi.mocked(showErrorDialog).mockReset();
    vi.mocked(showSuccessDialog).mockReset();
  });

  it("menampilkan tautan masuk", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { routes });
    expect(wrapper.find("a").attributes("href")).toBe("/auth/login");
  });

  it.each([
    ["", "a@b.c", "123456"],
    ["Budi", "", "123456"],
    ["Budi", "a@b.c", ""],
  ])("menolak input tidak lengkap (%s, %s, %s)", async (name, email, password) => {
    await submit(name, email, password);
    expect(showErrorDialog).toHaveBeenCalledWith("Nama, email, dan kata sandi wajib diisi.");
    expect(postRegister).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error jika pendaftaran gagal", async () => {
    vi.mocked(postRegister).mockResolvedValue({ success: false, message: "Email dipakai", data: null, status: 400 });
    await submit("Budi", "a@b.c", "123456");
    expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
  });

  it("pendaftaran sukses lalu pindah ke login", async () => {
    vi.mocked(postRegister).mockResolvedValue({ success: true, message: "Terdaftar", data: null, status: 201 });
    const { router } = await submit("Budi", "a@b.c", "123456");
    expect(postRegister).toHaveBeenCalledWith({ name: "Budi", email: "a@b.c", password: "123456" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Terdaftar");
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });
});