import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiFetch,
  buildQueryString,
  getAccessToken,
  isPlainObject,
  pickArray,
  pickNumber,
  pickObject,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

const mockResponse = (ok: boolean, status: number, json: unknown) => ({
  ok,
  status,
  json: json === "invalid" ? () => Promise.reject(new Error("bad json")) : () => Promise.resolve(json),
});

describe("token", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("buildQueryString", () => {
  it("mengabaikan nilai kosong", () => {
    expect(buildQueryString({ a: "1", b: undefined, c: null, d: "", e: 0, f: false })).toBe(
      "?a=1&e=0&f=false"
    );
  });

  it("mengembalikan string kosong jika tidak ada parameter", () => {
    expect(buildQueryString({})).toBe("");
  });
});

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sukses: mengembalikan success, message, data, status", async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, 200, { success: true, message: "OK", data: { a: 1 } })
    );
    const result = await apiFetch("/users", { method: "GET", query: { page: 1 } });

    expect(result).toEqual({ success: true, message: "OK", data: { a: 1 }, status: 200 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/users?page=1`);
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("menambahkan header Authorization jika token ada", async () => {
    putAccessToken("token-123");
    fetchMock.mockResolvedValue(mockResponse(true, 200, { success: true, message: "OK", data: null }));
    await apiFetch("/users/me", { method: "GET" });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-123");
  });

  it("tidak menambahkan Authorization jika auth=false", async () => {
    putAccessToken("token-123");
    fetchMock.mockResolvedValue(mockResponse(true, 200, { success: true, message: "OK", data: null }));
    await apiFetch("/auth/login", { method: "POST", body: { a: 1 }, auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim body JSON dengan Content-Type", async () => {
    fetchMock.mockResolvedValue(mockResponse(true, 200, { success: true, message: "OK", data: null }));
    await apiFetch("/cash-flows", { method: "POST", body: { nominal: 5 } });
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ nominal: 5 }));
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    fetchMock.mockResolvedValue(mockResponse(true, 200, { success: true, message: "OK", data: null }));
    const formData = new FormData();
    formData.append("photo", "x");
    await apiFetch("/users/me/photo", { method: "POST", formData });
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(formData);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("gagal dari server: memakai pesan dari response", async () => {
    fetchMock.mockResolvedValue(
      mockResponse(false, 400, { success: false, message: "Gagal", data: null })
    );
    const result = await apiFetch("/x", { method: "GET" });
    expect(result).toEqual({ success: false, message: "Gagal", data: null, status: 400 });
  });

  it("response ok tetapi success=false dianggap gagal", async () => {
    fetchMock.mockResolvedValue(
      mockResponse(true, 200, { success: false, message: "Ditolak", data: null })
    );
    const result = await apiFetch("/x", { method: "GET" });
    expect(result.success).toBe(false);
    expect(result.message).toBe("Ditolak");
  });

  it("ok tanpa message memakai pesan default", async () => {
    fetchMock.mockResolvedValue(mockResponse(true, 200, { success: true, data: 1 }));
    const result = await apiFetch("/x", { method: "GET" });
    expect(result.message).toBe("Berhasil");
  });

  it("JSON tidak valid pada response ok", async () => {
    fetchMock.mockResolvedValue(mockResponse(true, 200, "invalid"));
    const result = await apiFetch("/x", { method: "GET" });
    expect(result).toEqual({ success: false, message: "Berhasil", data: null, status: 200 });
  });

  it("JSON tidak valid pada response gagal", async () => {
    fetchMock.mockResolvedValue(mockResponse(false, 500, "invalid"));
    const result = await apiFetch("/x", { method: "GET" });
    expect(result).toEqual({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
      status: 500,
    });
  });

  it("kegagalan jaringan", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const result = await apiFetch("/x", { method: "GET" });
    expect(result).toEqual({
      success: false,
      message: "Tidak dapat terhubung ke server",
      data: null,
      status: 0,
    });
  });
});

describe("pembaca data", () => {
  it("isPlainObject", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject("x")).toBe(false);
  });

  it("pickArray", () => {
    expect(pickArray([1], ["a"])).toEqual([1]);
    expect(pickArray({ a: [2] }, ["x", "a"])).toEqual([2]);
    expect(pickArray({ a: "bukan array" }, ["a"])).toEqual([]);
    expect(pickArray(null, ["a"])).toEqual([]);
  });

  it("pickObject", () => {
    expect(pickObject({ user: { id: 1 } }, ["user"])).toEqual({ id: 1 });
    expect(pickObject({ id: 2 }, ["user"])).toEqual({ id: 2 });
    expect(pickObject({ user: "x" }, ["user"])).toEqual({ user: "x" });
    expect(pickObject([1], ["user"])).toEqual({});
    expect(pickObject(null, ["user"])).toEqual({});
  });

  it("pickNumber", () => {
    expect(pickNumber({ a: 5 }, ["a"], 9)).toBe(5);
    expect(pickNumber({ a: "7" }, ["a"], 9)).toBe(7);
    expect(pickNumber({ a: undefined, b: null, c: "", d: "abc", e: 3 }, ["a", "b", "c", "d", "e"], 9)).toBe(3);
    expect(pickNumber({}, ["a"], 9)).toBe(9);
  });
});
