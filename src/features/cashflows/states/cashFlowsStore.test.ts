import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia } from "../../../test-utils";
import * as api from "../api/cashFlowApi";
import { normalizeCashFlow, normalizeStats, useCashFlowsStore } from "./cashFlowsStore";

vi.mock("../api/cashFlowApi");

const ok = (data: any = null) => ({ success: true, message: "Berhasil", data, status: 200 });
const fail = { success: false, message: "Gagal", data: null, status: 400 };

const item = (over: Record<string, any> = {}) => ({
  id: "1",
  type: "inflow",
  source: "cash",
  label: "Gaji",
  nominal: 1000,
  description: "x",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...over,
});

const payload = {
  type: "inflow" as const,
  source: "cash" as const,
  label: "Gaji",
  nominal: 1000,
  description: "",
};

describe("normalizeCashFlow", () => {
  it("mengubah nominal string menjadi angka dan melengkapi deskripsi", () => {
    const result = normalizeCashFlow(item({ nominal: "2500", description: undefined }));
    expect(result.nominal).toBe(2500);
    expect(result.description).toBe("");
  });

  it("memakai field amount jika nominal tidak ada", () => {
    expect(normalizeCashFlow({ amount: 700 } as any).nominal).toBe(700);
  });
});

describe("normalizeStats", () => {
  const list: any[] = [
    item({ type: "inflow", source: "cash", nominal: 1000 }),
    item({ type: "outflow", source: "cash", nominal: 300 }),
    item({ type: "inflow", source: "savings", nominal: 500 }),
    item({ type: "inflow", source: "loans", nominal: 200 }),
  ];

  it("menghitung dari daftar jika stats tidak tersedia", () => {
    expect(normalizeStats({ cash_flows: list }, list)).toEqual({
      total_inflow: 1700,
      total_outflow: 300,
      total_balance: 1400,
      cash: 700,
      savings: 500,
      loans: 200,
    });
  });

  it("memakai nilai langsung dari stats", () => {
    const data = {
      stats: { total_inflow: 10, total_outflow: 4, total_balance: 6, cash: 1, savings: 2, loans: 3 },
    };
    expect(normalizeStats(data, [])).toEqual({
      total_inflow: 10,
      total_outflow: 4,
      total_balance: 6,
      cash: 1,
      savings: 2,
      loans: 3,
    });
  });

  it("menurunkan saldo sumber dari total_inflow_x - total_outflow_x", () => {
    const data = {
      stats: {
        total_inflow_cash: 100,
        total_outflow_cash: 40,
        total_inflow_savings: 50,
        total_outflow_loans: 20,
      },
    };
    const result = normalizeStats(data, []);
    expect(result.cash).toBe(60);
    expect(result.savings).toBe(50);
    expect(result.loans).toBe(-20);
  });
});

describe("cashFlowsStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    createMockPinia();
  });

  it("fetchCashFlows sukses mengisi daftar dan statistik", async () => {
    vi.mocked(api.getCashFlows).mockResolvedValue(
      ok({ cash_flows: [item({ nominal: "1500" })], stats: { total_inflow: 1500 } })
    );
    const store = useCashFlowsStore();
    await store.fetchCashFlows({});
    expect(store.cashFlows).toHaveLength(1);
    expect(store.cashFlows[0].nominal).toBe(1500);
    expect(store.stats.total_inflow).toBe(1500);
    expect(store.isCashFlow).toBe(false);
  });

  it("fetchCashFlows gagal tidak mengubah data", async () => {
    vi.mocked(api.getCashFlows).mockResolvedValue(fail);
    const store = useCashFlowsStore();
    await store.fetchCashFlows({});
    expect(store.cashFlows).toEqual([]);
    expect(store.isCashFlow).toBe(false);
  });

  it("fetchCashFlow sukses & gagal", async () => {
    vi.mocked(api.getCashFlow).mockResolvedValueOnce(ok({ cash_flow: item() }));
    const store = useCashFlowsStore();
    await store.fetchCashFlow("1");
    expect(store.cashFlow?.label).toBe("Gaji");

    vi.mocked(api.getCashFlow).mockResolvedValueOnce(fail);
    await store.fetchCashFlow("1");
    expect(store.cashFlow).toBeNull();
    expect(store.isCashFlow).toBe(false);
  });

  it("fetchLabels menerima string maupun object", async () => {
    vi.mocked(api.getLabels).mockResolvedValueOnce(ok({ labels: ["Gaji", { label: "Makan" }] }));
    const store = useCashFlowsStore();
    await store.fetchLabels();
    expect(store.labels).toEqual(["Gaji", "Makan"]);

    vi.mocked(api.getLabels).mockResolvedValueOnce(fail);
    await store.fetchLabels();
    expect(store.labels).toEqual(["Gaji", "Makan"]);
  });

  it("fetchStatsDaily sukses & gagal", async () => {
    vi.mocked(api.getStatsDaily).mockResolvedValueOnce(ok({ stats: [{ day: 1 }] }));
    const store = useCashFlowsStore();
    await store.fetchStatsDaily();
    expect(store.statsDaily).toEqual([{ day: 1 }]);
    vi.mocked(api.getStatsDaily).mockResolvedValueOnce(fail);
    await store.fetchStatsDaily();
    expect(store.statsDaily).toEqual([{ day: 1 }]);
  });

  it("fetchStatsMonthly sukses & gagal", async () => {
    vi.mocked(api.getStatsMonthly).mockResolvedValueOnce(ok({ stats: [{ month: 1 }] }));
    const store = useCashFlowsStore();
    await store.fetchStatsMonthly();
    expect(store.statsMonthly).toEqual([{ month: 1 }]);
    vi.mocked(api.getStatsMonthly).mockResolvedValueOnce(fail);
    await store.fetchStatsMonthly();
    expect(store.statsMonthly).toEqual([{ month: 1 }]);
  });

  it("addCashFlow", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.postCashFlow).mockResolvedValueOnce(ok());
    await store.addCashFlow(payload);
    expect(store.isCashFlowAdd).toBe(false);
    expect(store.isCashFlowAdded).toBe(true);
    vi.mocked(api.postCashFlow).mockResolvedValueOnce(fail);
    await store.addCashFlow(payload);
    expect(store.isCashFlowAdded).toBe(false);
  });

  it("changeCashFlow", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.putCashFlow).mockResolvedValueOnce(ok());
    await store.changeCashFlow("1", payload);
    expect(store.isCashFlowChange).toBe(false);
    expect(store.isCashFlowChanged).toBe(true);
    vi.mocked(api.putCashFlow).mockResolvedValueOnce(fail);
    await store.changeCashFlow("1", payload);
    expect(store.isCashFlowChanged).toBe(false);
  });

  it("deleteCashFlow", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.deleteCashFlow).mockResolvedValueOnce(ok());
    await store.deleteCashFlow("1");
    expect(store.isCashFlowDelete).toBe(false);
    expect(store.isCashFlowDeleted).toBe(true);
    vi.mocked(api.deleteCashFlow).mockResolvedValueOnce(fail);
    await store.deleteCashFlow("1");
    expect(store.isCashFlowDeleted).toBe(false);
  });

  it("deleteAllCashFlows", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.deleteAllCashFlows).mockResolvedValueOnce(ok());
    await store.deleteAllCashFlows();
    expect(store.isCashFlowDeleteAll).toBe(false);
    expect(store.isCashFlowDeletedAll).toBe(true);
    vi.mocked(api.deleteAllCashFlows).mockResolvedValueOnce(fail);
    await store.deleteAllCashFlows();
    expect(store.isCashFlowDeletedAll).toBe(false);
  });
});
