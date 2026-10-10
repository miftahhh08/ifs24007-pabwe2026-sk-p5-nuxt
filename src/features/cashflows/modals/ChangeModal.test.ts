import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import { putCashFlow } from "../api/cashFlowApi";
import ChangeModal from "./ChangeModal.vue";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

const cashFlow = {
  id: "cf-1",
  type: "outflow" as const,
  source: "savings" as const,
  label: "Makan",
  nominal: 25000,
  description: "siang",
  created_at: "2026-01-15T03:00:00Z",
  updated_at: "2026-01-15T03:00:00Z",
};

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("form terisi dengan data transaksi", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { cashFlow } });
    expect(wrapper.text()).toContain("Ubah Transaksi");
    expect((wrapper.find("#cf-label").element as HTMLInputElement).value).toBe("Makan");
    expect((wrapper.find("#cf-nominal").element as HTMLInputElement).value).toBe("25000");
  });

  it("emit close saat batal", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { cashFlow } });
    await wrapper.find('[data-testid="cancel-button"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("sukses: memanggil API dengan id lalu emit saved dan close", async () => {
    vi.mocked(putCashFlow).mockResolvedValue({
      success: true,
      message: "Diubah",
      data: null,
      status: 200,
    });
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { cashFlow } });
    await wrapper.find("#cf-nominal").setValue("30000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(putCashFlow).toHaveBeenCalledWith(
      "cf-1",
      expect.objectContaining({ label: "Makan", nominal: 30000, type: "outflow" })
    );
    expect(showSuccessDialog).toHaveBeenCalledWith("Diubah");
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: menampilkan error", async () => {
    vi.mocked(putCashFlow).mockResolvedValue({
      success: false,
      message: "Ditolak",
      data: null,
      status: 400,
    });
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { cashFlow } });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Ditolak");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });
});
