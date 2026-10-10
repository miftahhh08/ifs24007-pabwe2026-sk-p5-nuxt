import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { getMe, postPhoto, putMe, putPassword } from "../api/userApi";
import ProfilePage from "./ProfilePage.vue";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

const ok = (data: any = null) => ({ success: true, message: "Berhasil", data, status: 200 });
const fail = { success: false, message: "Gagal", data: null, status: 400 };
const user = { id: "u1", name: "Budi Santoso", email: "budi@x.c", photo: null };

async function render(profileResponse: any = ok({ user })) {
  vi.mocked(getMe).mockResolvedValue(profileResponse);
  return renderWithProviders(ProfilePage);
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("mengisi form dari profil dan menampilkan inisial", async () => {
    const { wrapper } = await render();
    expect((wrapper.find("#profile-name").element as HTMLInputElement).value).toBe("Budi Santoso");
    expect((wrapper.find("#profile-email").element as HTMLInputElement).value).toBe("budi@x.c");
    expect(wrapper.find('[data-testid="profile-initials"]').text()).toBe("BS");
  });

  it("menampilkan foto jika profil punya foto", async () => {
    const { wrapper } = await render(ok({ user: { ...user, photo: "https://cdn.test/b.png" } }));
    expect(wrapper.find('[data-testid="profile-photo"]').attributes("src")).toBe(
      "https://cdn.test/b.png"
    );
  });

  it("form kosong dan inisial '?' jika profil gagal dimuat", async () => {
    const { wrapper } = await render(fail);
    expect((wrapper.find("#profile-name").element as HTMLInputElement).value).toBe("");
    expect(wrapper.find('[data-testid="profile-initials"]').text()).toBe("?");
  });

  describe("form data diri", () => {
    it.each([
      ["", "a@b.c"],
      ["Budi", ""],
    ])("menolak input kosong (%s, %s)", async (name, email) => {
      const { wrapper } = await render();
      await wrapper.find("#profile-name").setValue(name);
      await wrapper.find("#profile-email").setValue(email);
      await wrapper.find('[data-testid="profile-form"]').trigger("submit");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Nama dan email wajib diisi.");
      expect(putMe).not.toHaveBeenCalled();
    });

    it("sukses", async () => {
      vi.mocked(putMe).mockResolvedValue(ok());
      const { wrapper } = await render();
      await wrapper.find("#profile-name").setValue("Budi Baru");
      await wrapper.find('[data-testid="profile-form"]').trigger("submit");
      await flushPromises();
      expect(putMe).toHaveBeenCalledWith({ name: "Budi Baru", email: "budi@x.c" });
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    });

    it("gagal", async () => {
      vi.mocked(putMe).mockResolvedValue(fail);
      const { wrapper } = await render();
      await wrapper.find('[data-testid="profile-form"]').trigger("submit");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    });
  });

  describe("form foto", () => {
    async function chooseFile(wrapper: any, files: File[]) {
      const input = wrapper.find("#profile-photo");
      Object.defineProperty(input.element, "files", { value: files, configurable: true });
      await input.trigger("change");
    }

    it("menolak jika belum memilih file", async () => {
      const { wrapper } = await render();
      await chooseFile(wrapper, []);
      await wrapper.find('[data-testid="photo-form"]').trigger("submit");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Pilih file foto terlebih dahulu.");
      expect(postPhoto).not.toHaveBeenCalled();
    });

    it("sukses mengunggah", async () => {
      vi.mocked(postPhoto).mockResolvedValue(ok());
      const { wrapper } = await render();
      const file = new File(["x"], "a.png", { type: "image/png" });
      await chooseFile(wrapper, [file]);
      await wrapper.find('[data-testid="photo-form"]').trigger("submit");
      await flushPromises();
      expect(postPhoto).toHaveBeenCalledWith(file);
      expect(showSuccessDialog).toHaveBeenCalled();
    });

    it("gagal mengunggah", async () => {
      vi.mocked(postPhoto).mockResolvedValue(fail);
      const { wrapper } = await render();
      await chooseFile(wrapper, [new File(["x"], "a.png")]);
      await wrapper.find('[data-testid="photo-form"]').trigger("submit");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    });
  });

  describe("form kata sandi", () => {
    it.each([
      ["", "baru"],
      ["lama", ""],
    ])("menolak input kosong (%s, %s)", async (current, next) => {
      const { wrapper } = await render();
      await wrapper.find("#current-password").setValue(current);
      await wrapper.find("#new-password").setValue(next);
      await wrapper.find('[data-testid="password-form"]').trigger("submit");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi lama dan baru wajib diisi.");
      expect(putPassword).not.toHaveBeenCalled();
    });

    it("sukses lalu mengosongkan input", async () => {
      vi.mocked(putPassword).mockResolvedValue(ok());
      const { wrapper } = await render();
      await wrapper.find("#current-password").setValue("lama");
      await wrapper.find("#new-password").setValue("baru");
      await wrapper.find('[data-testid="password-form"]').trigger("submit");
      await flushPromises();
      expect(putPassword).toHaveBeenCalledWith({ password: "lama", new_password: "baru" });
      expect((wrapper.find("#current-password").element as HTMLInputElement).value).toBe("");
      expect((wrapper.find("#new-password").element as HTMLInputElement).value).toBe("");
      expect(showSuccessDialog).toHaveBeenCalled();
    });

    it("gagal", async () => {
      vi.mocked(putPassword).mockResolvedValue(fail);
      const { wrapper } = await render();
      await wrapper.find("#current-password").setValue("lama");
      await wrapper.find("#new-password").setValue("baru");
      await wrapper.find('[data-testid="password-form"]').trigger("submit");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    });
  });
});
