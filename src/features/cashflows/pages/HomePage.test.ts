import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { Stub, renderWithProviders } from "../../../test-utils";
import * as api from "../api/cashFlowApi";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import HomePage from "./HomePage.vue";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const ok = (data: any = null) => ({ success: true, message: "Berhasil", data, status: 200 });
const fail = { success: false, message: "Gagal", data: null, status: 400 };

const items = [
  {
    id: "cf-1",
    type: "inflow",
    source: "cash",
    label: "Gaji",
    nominal: 5000000,
    description: "Gaji bulanan",
    created_at: "2026-01-15T03:00:00Z",
    updated_at: "2026-01-15T03:00:00Z",
  },
  {
    id: "cf-2",
    type: "outflow",
    source: "savings",
    label: "Makan",
    nominal: 25000,
    description: "",
    created_at: "2026-01-16T03:00:00Z",
    updated_at: "2026-01-16T03:00:00Z",
  },
];

const routes = [{ path: "/:pathMatch(.*)*", component: Stub }];

async function render(listResponse: any = ok({ cash_flows: items })) {
  vi.mocked(api.getCashFlows).mockResolvedValue(listResponse);
  vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: ["Gaji", "Makan"] }));
  return renderWithProviders(HomePage, { routes });
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("menampilkan enam kartu metrik dan baris transaksi", async () => {
    const { wrapper } = await render();
    expect(wrapper.findAll('[data-testid="metric-card"]')).toHaveLength(6);
    expect(wrapper.text()).toContain("Total Saldo Kas Bersih");
    const rows = wrapper.findAll('[data-testid="cash-flow-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Gaji");
    expect(rows[0].text()).toContain("Pemasukan");
    expect(rows[0].text()).toContain("5.000.000");
    expect(rows[1].text()).toContain("Pengeluaran");
    expect(rows[1].text()).toContain("Tabungan");
  });

  it("menghitung ringkasan dari daftar saat API tidak mengirim stats", async () => {
    const { wrapper } = await render();
    const cards = wrapper.findAll('[data-testid="metric-card"]').map((card) => card.text());
    expect(cards[1]).toContain("5.000.000"); // total pemasukan
    expect(cards[2]).toContain("25.000"); // total pengeluaran
  });

  it("menampilkan status memuat", async () => {
    vi.mocked(api.getCashFlows).mockReturnValue(new Promise(() => {}));
    vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: [] }));
    const { wrapper } = await renderWithProviders(HomePage, { routes });
    expect(wrapper.find('[data-testid="cash-flow-loading"]').exists()).toBe(true);
  });

  it("menampilkan status kosong", async () => {
    const { wrapper } = await render(ok({ cash_flows: [] }));
    expect(wrapper.find('[data-testid="cash-flow-empty"]').exists()).toBe(true);
  });

  it("menerapkan dan mereset filter", async () => {
    const { wrapper } = await render();
    const selects = wrapper.findAll("select");
    await selects[0].setValue("inflow");
    await selects[1].setValue("cash");
    await selects[2].setValue("Gaji");
    const dates = wrapper.findAll('input[type="date"]');
    await dates[0].setValue("2026-01-01");
    await dates[1].setValue("2026-01-31");
    await wrapper.find('[data-testid="filter-form"]').trigger("submit");
    await flushPromises();

    expect(api.getCashFlows).toHaveBeenLastCalledWith({
      type: "inflow",
      source: "cash",
      label: "Gaji",
      start_date: "2026-01-01",
      end_date: "2026-01-31",
    });

    await wrapper.find('[data-testid="reset-filter"]').trigger("click");
    await flushPromises();
    expect(api.getCashFlows).toHaveBeenLastCalledWith({
      type: "",
      source: "",
      label: "",
      start_date: "",
      end_date: "",
    });
  });

  it("membuka dan menutup modal tambah, serta memuat ulang saat tersimpan", async () => {
    const { wrapper } = await render();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
    await wrapper.find('[data-testid="add-button"]').trigger("click");
    const modal = wrapper.findComponent(AddModal);
    expect(modal.exists()).toBe(true);

    const callsBefore = vi.mocked(api.getCashFlows).mock.calls.length;
    await modal.vm.$emit("saved");
    await flushPromises();
    expect(vi.mocked(api.getCashFlows).mock.calls.length).toBe(callsBefore + 1);

    await modal.vm.$emit("close");
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
  });

  it("membuka dan menutup modal ubah, serta memuat ulang saat tersimpan", async () => {
    const { wrapper } = await render();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    await wrapper.find('[data-testid="edit-cf-1"]').trigger("click");
    const modal = wrapper.findComponent(ChangeModal);
    expect(modal.props("cashFlow").id).toBe("cf-1");

    const callsBefore = vi.mocked(api.getCashFlows).mock.calls.length;
    await modal.vm.$emit("saved");
    await flushPromises();
    expect(vi.mocked(api.getCashFlows).mock.calls.length).toBe(callsBefore + 1);

    await modal.vm.$emit("close");
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
  });

  describe("hapus satu transaksi", () => {
    it("dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { wrapper } = await render();
      await wrapper.find('[data-testid="delete-cf-1"]').trigger("click");
      await flushPromises();
      expect(api.deleteCashFlow).not.toHaveBeenCalled();
    });

    it("gagal", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(api.deleteCashFlow).mockResolvedValue(fail);
      const { wrapper } = await render();
      await wrapper.find('[data-testid="delete-cf-1"]').trigger("click");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    });

    it("sukses lalu memuat ulang daftar", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(api.deleteCashFlow).mockResolvedValue(ok());
      const { wrapper } = await render();
      const callsBefore = vi.mocked(api.getCashFlows).mock.calls.length;
      await wrapper.find('[data-testid="delete-cf-1"]').trigger("click");
      await flushPromises();
      expect(api.deleteCashFlow).toHaveBeenCalledWith("cf-1");
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
      expect(vi.mocked(api.getCashFlows).mock.calls.length).toBe(callsBefore + 1);
    });
  });

  describe("reset semua data", () => {
    it("dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { wrapper } = await render();
      await wrapper.find('[data-testid="reset-all-button"]').trigger("click");
      await flushPromises();
      expect(api.deleteAllCashFlows).not.toHaveBeenCalled();
    });

    it("gagal", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(api.deleteAllCashFlows).mockResolvedValue(fail);
      const { wrapper } = await render();
      await wrapper.find('[data-testid="reset-all-button"]').trigger("click");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    });

    it("sukses lalu memuat ulang data dan label", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(api.deleteAllCashFlows).mockResolvedValue(ok());
      const { wrapper } = await render();
      const labelCalls = vi.mocked(api.getLabels).mock.calls.length;
      await wrapper.find('[data-testid="reset-all-button"]').trigger("click");
      await flushPromises();
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
      expect(vi.mocked(api.getLabels).mock.calls.length).toBe(labelCalls + 1);
    });
  });
});
