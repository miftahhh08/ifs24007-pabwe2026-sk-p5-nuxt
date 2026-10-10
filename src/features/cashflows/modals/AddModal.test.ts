import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import { postCashFlow } from "../api/cashFlowApi";
import AddModal from "./AddModal.vue";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
}));

async function fillAndSubmit(wrapper: any) {
  await wrapper.find("#cf-label").setValue("Gaji");
  await wrapper.find("#cf-nominal").setValue("5000000");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("menampilkan judul dan form", async () => {
    const { wrapper } = await renderWithProviders(AddModal);
    expect(wrapper.text()).toContain("Tambah Transaksi");
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("emit close saat batal", async () => {
    const { wrapper } = await renderWithProviders(AddModal);
    await wrapper.find('[data-testid="cancel-button"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("sukses: menyimpan, menampilkan dialog, lalu emit saved dan close", async () => {
    vi.mocked(postCashFlow).mockResolvedValue({
      success: true,
      message: "Tersimpan",
      data: null,
      status: 201,
    });
    const { wrapper } = await renderWithProviders(AddModal);
    await fillAndSubmit(wrapper);
    expect(postCashFlow).toHaveBeenCalledWith({
      type: "inflow",
      source: "cash",
      label: "Gaji",
      nominal: 5000000,
      description: "",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Tersimpan");
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: menampilkan error dan modal tetap terbuka", async () => {
    vi.mocked(postCashFlow).mockResolvedValue({
      success: false,
      message: "Ditolak",
      data: null,
      status: 400,
    });
    const { wrapper } = await renderWithProviders(AddModal);
    await fillAndSubmit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Ditolak");
    expect(wrapper.emitted("saved")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });
});
