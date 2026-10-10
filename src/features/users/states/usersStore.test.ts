import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";
import { useUsersStore } from "./usersStore";

vi.mock("../api/userApi");

const ok = (data: any) => ({ success: true, message: "Berhasil", data, status: 200 });
const fail = { success: false, message: "Gagal", data: null, status: 400 };
const user = { id: "u1", name: "Budi", email: "b@x.c", photo: null };

describe("usersStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    createMockPinia();
  });

  it("fetchUsers sukses & gagal", async () => {
    vi.mocked(getUsers).mockResolvedValueOnce(ok({ users: [user] }));
    const store = useUsersStore();
    await store.fetchUsers();
    expect(store.users).toEqual([user]);
    expect(store.isUsers).toBe(false);

    vi.mocked(getUsers).mockResolvedValueOnce(fail);
    await store.fetchUsers();
    expect(store.users).toEqual([user]);
  });

  it("fetchProfile sukses & gagal", async () => {
    vi.mocked(getMe).mockResolvedValueOnce(ok({ user }));
    const store = useUsersStore();
    await store.fetchProfile();
    expect(store.profile).toEqual(user);

    vi.mocked(getMe).mockResolvedValueOnce(fail);
    await store.fetchProfile();
    expect(store.profile).toEqual(user);
    expect(store.isProfile).toBe(false);
  });

  it("changeProfile memuat ulang profil saat sukses", async () => {
    vi.mocked(putMe).mockResolvedValueOnce(ok(null));
    vi.mocked(getMe).mockResolvedValueOnce(ok({ user }));
    const store = useUsersStore();
    const response = await store.changeProfile({ name: "Budi", email: "b@x.c" });
    expect(response.success).toBe(true);
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(store.profile).toEqual(user);
    expect(store.isProfileChange).toBe(false);
  });

  it("changeProfile gagal tidak memuat ulang profil", async () => {
    vi.mocked(putMe).mockResolvedValueOnce(fail);
    const store = useUsersStore();
    const response = await store.changeProfile({ name: "Budi", email: "b@x.c" });
    expect(response.success).toBe(false);
    expect(getMe).not.toHaveBeenCalled();
  });

  it("changePhoto sukses & gagal", async () => {
    const file = new File(["x"], "a.png");
    vi.mocked(postPhoto).mockResolvedValueOnce(ok(null));
    vi.mocked(getMe).mockResolvedValueOnce(ok({ user }));
    const store = useUsersStore();
    expect((await store.changePhoto(file)).success).toBe(true);
    expect(getMe).toHaveBeenCalledTimes(1);

    vi.mocked(postPhoto).mockResolvedValueOnce(fail);
    expect((await store.changePhoto(file)).success).toBe(false);
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(store.isPhotoChange).toBe(false);
  });

  it("changePassword", async () => {
    vi.mocked(putPassword).mockResolvedValueOnce(ok(null));
    const store = useUsersStore();
    const response = await store.changePassword({ password: "a", new_password: "b" });
    expect(response.success).toBe(true);
    expect(store.isPasswordChange).toBe(false);
  });
});
