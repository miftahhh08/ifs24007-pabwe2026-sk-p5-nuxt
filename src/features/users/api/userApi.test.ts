import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

const res = (status: number) => ({ success: status === 200, message: "", data: null, status });

describe("userApi", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("getUsers", () => {
    getUsers();
    expect(apiFetch).toHaveBeenCalledWith("/users", { method: "GET" });
  });

  it("getMe", () => {
    getMe();
    expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "GET" });
  });

  it("putMe", () => {
    putMe({ name: "B", email: "a@b.c" });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "B", email: "a@b.c" },
    });
  });

  it("postPhoto mengirim FormData dengan field photo", () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    postPhoto(file);
    const [path, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect((options.formData as FormData).get("photo")).toBeInstanceOf(File);
  });

  it("putPassword memakai endpoint utama", async () => {
    vi.mocked(apiFetch).mockResolvedValue(res(200));
    const result = await putPassword({ password: "a", new_password: "b" });
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: { password: "a", new_password: "b" },
    });
    expect(result.status).toBe(200);
  });

  it("putPassword mencoba endpoint alternatif saat 404", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(res(404)).mockResolvedValueOnce(res(200));
    const result = await putPassword({ password: "a", new_password: "b" });
    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(apiFetch).mock.calls[1][0]).toBe("/users/password");
    expect(result.status).toBe(200);
  });
});
