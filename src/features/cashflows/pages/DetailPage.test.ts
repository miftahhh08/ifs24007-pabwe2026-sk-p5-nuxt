import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { Stub, renderWithProviders } from "../../../test-utils";
import * as api from "../api/cashFlowApi";
import ChangeModal from "../modals/ChangeModal.vue";
import DetailPage from "./DetailPage.vue";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const ok = (data: any = null) => ({ success: true, message: "Berhasil", data, status: 200 });
const fail = { success: false, message: "Gagal", data: null, status: 404 };

const item = {
  id: "cf-1",
  type: "inflow",
  source: "cash",
  label: "Gaji",
  nominal: 5000000,
  description: "Gaji bulanan",
  created_at: "2026-01-15T03:00:00Z",
  updated_at: "2026-01-16T03:00:00Z",
};

const routes = [
  { path: "/", component: Stub },
  { path: "/cash-flows/:cashFlowId", component: Stub },
];

async function render(response: any = ok({ cash_flow: item })) {
  vi.mocked(api.getCashFlow).mockResolvedValue(response);
  return renderWithProviders(DetailPage, { route: "/cash-flows/cf-1", routes });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("memuat transaksi berdasarkan id pada URL dan menampilkan detail", async () => {
    const { wrapper } = await render();
    expect(api.getCashFlow).toHaveBeenCalledWith("cf-1");
    const card = wrapper.find('[data-testid="detail-card"]');
    expect(card.text()).toContain("Gaji");
    expect(card.text()).toContain("Pemasukan");
    expect(card.text()).toContain("Tunai");
    expect(card.text()).toContain("5.000.000");
    expect(card.text()).toContain("Gaji bulanan");
  });

  it("menampilkan status memuat", async () => {
    vi.mocked(api.getCashFlow).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(DetailPage, {
      route: "/cash-flows/cf-1",
      routes,
    });
    expect(wrapper.find('[data-testid="detail-loading"]').exists()).toBe(true);
  });

  it("menampilkan pesan jika transaksi tidak ditemukan", async () => {
    const { wrapper } = await render(fail);
    expect(wrapper.find('[data-testid="detail-not-found"]').exists()).toBe(true);
  });

  it("membuka modal ubah, memuat ulang saat tersimpan, dan menutupnya", async () => {
    const { wrapper } = await render();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    await wrapper.find('[data-testid="detail-edit"]').trigger("click");
    const modal = wrapper.findComponent(ChangeModal);
    expect(modal.exists()).toBe(true);

    await modal.vm.$emit("saved");
    await flushPromises();
    expect(api.getCashFlow).toHaveBeenCalledTimes(2);

    // Setelah reload, kartu dibuat ulang sehingga modal juga baru.
    // Karena itu cari lagi komponennya sebelum mengirim event close.
    await wrapper.findComponent(ChangeModal).vm.$emit("close");
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
  });

  describe("hapus", () => {
    it("dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { wrapper } = await render();
      await wrapper.find('[data-testid="detail-delete"]').trigger("click");
      await flushPromises();
      expect(api.deleteCashFlow).not.toHaveBeenCalled();
    });

    it("gagal", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(api.deleteCashFlow).mockResolvedValue(fail);
      const { wrapper, router } = await render();
      await wrapper.find('[data-testid="detail-delete"]').trigger("click");
      await flushPromises();
      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(router.currentRoute.value.fullPath).toBe("/cash-flows/cf-1");
    });

    it("sukses lalu kembali ke beranda", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(api.deleteCashFlow).mockResolvedValue(ok());
      const { wrapper, router } = await render();
      await wrapper.find('[data-testid="detail-delete"]').trigger("click");
      await flushPromises();
      expect(api.deleteCashFlow).toHaveBeenCalledWith("cf-1");
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
      expect(router.currentRoute.value.fullPath).toBe("/");
    });
  });
});