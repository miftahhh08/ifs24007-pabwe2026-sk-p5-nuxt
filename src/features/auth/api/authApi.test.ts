import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { postLogin, postRegister } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("authApi", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("postLogin memanggil POST /auth/login tanpa token", () => {
    const payload = { email: "a@b.c", password: "123456" };
    postLogin(payload);
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    });
  });

  it("postRegister memanggil POST /auth/register tanpa token", () => {
    const payload = { name: "Budi", email: "a@b.c", password: "123456" };
    postRegister(payload);
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
  });
});
