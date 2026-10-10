import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import { getUsers } from "../api/userApi";
import UsersPage from "./UsersPage.vue";

vi.mock("../api/userApi");

const ok = (data: any) => ({ success: true, message: "OK", data, status: 200 });

describe("UsersPage", () => {
  beforeEach(() => {
    vi.mocked(getUsers).mockReset();
  });

  it("menampilkan status memuat", async () => {
    vi.mocked(getUsers).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(true);
  });

  it("menampilkan status kosong", async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [] }));
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(true);
  });

  it("menampilkan kartu pengguna dengan foto atau inisial", async () => {
    vi.mocked(getUsers).mockResolvedValue(
      ok({
        users: [
          { id: "1", name: "Budi Santoso", email: "budi@x.c", photo: "https://cdn.test/b.png" },
          { id: "2", name: "Siti Aminah", email: "siti@x.c", photo: null },
        ],
      })
    );
    const { wrapper } = await renderWithProviders(UsersPage);
    const cards = wrapper.findAll('[data-testid="user-card"]');
    expect(cards).toHaveLength(2);
    expect(cards[0].find("img").attributes("src")).toBe("https://cdn.test/b.png");
    expect(cards[1].text()).toContain("SA");
    expect(cards[1].text()).toContain("siti@x.c");
  });
});
