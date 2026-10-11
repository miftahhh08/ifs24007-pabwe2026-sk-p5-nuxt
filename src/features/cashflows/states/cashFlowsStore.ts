import { defineStore } from "pinia";
import { getErrorMessage } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { cashFlowApi } from "../api/cashFlowApi";

/* --------------------------------- Tipe data -------------------------------- */

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: number;
  user_id: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

/** Data yang dikirim saat menambah/mengubah catatan. */
export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

/** Filter untuk GET /cash-flows. Nilai kosong ("") berarti tanpa filter. */
export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  /** Format "YYYY-MM-DD" atau "YYYY-MM-DD HH:mm:ss" */
  start_date?: string;
  end_date?: string;
}

/** Ringkasan saldo dari API (key tambahan per label/sumber bersifat dinamis). */
export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  [key: string]: number;
}

/** Statistik per hari/bulan: { "05-10-2024": 2500000, ... } */
export interface CashFlowChartStats {
  stats_inflow: Record<string, number>;
  stats_outflow: Record<string, number>;
  stats_cashflow: Record<string, number>;
}

export interface CashFlowChartQueryParams {
  end_date?: string;
  total_data?: number;
}

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: CashFlowChartStats | null;
  statsMonthly: CashFlowChartStats | null;

  // Status pemuatan
  isCashFlows: boolean;
  isCashFlow: boolean;
  isLabels: boolean;
  isStatsDaily: boolean;
  isStatsMonthly: boolean;

  // Status mutasi (isXxx = sedang berjalan, isXxxed = baru berhasil)
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

/* --------------------------------- Normalisasi ------------------------------- */

function emptyStats(): CashFlowStats {
  return { cashflow: 0, total_inflow: 0, total_outflow: 0 };
}

/**
 * Backend PHP mengirim objek kosong sebagai array `[]`.
 * Normalisasi agar `stats` selalu berupa objek dengan nilai default 0.
 */
function normalizeStats(raw: unknown): CashFlowStats {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyStats();
  return { ...emptyStats(), ...(raw as Partial<CashFlowStats>) };
}

function asRecord(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, number>;
}

function normalizeChart(raw: any): CashFlowChartStats {
  return {
    stats_inflow: asRecord(raw?.stats_inflow),
    stats_outflow: asRecord(raw?.stats_outflow),
    stats_cashflow: asRecord(raw?.stats_cashflow),
  };
}

function initialState(): CashFlowsState {
  return {
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    statsDaily: null,
    statsMonthly: null,

    isCashFlows: false,
    isCashFlow: false,
    isLabels: false,
    isStatsDaily: false,
    isStatsMonthly: false,

    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  };
}

/** Mengambil nilai angka dari stats; key yang belum ada dianggap 0. */
function statValue(stats: CashFlowStats, key: string): number {
  return Number(stats[key]) || 0;
}

/* ----------------------------------- Store ----------------------------------- */

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => initialState(),

  getters: {
    totalInflow: (state): number => statValue(state.stats, "total_inflow"),
    totalOutflow: (state): number => statValue(state.stats, "total_outflow"),
    /** Saldo kas bersih = total pemasukan - total pengeluaran. */
    netCashflow: (state): number => statValue(state.stats, "cashflow"),
    balanceCash: (state): number =>
      statValue(state.stats, "total_inflow_cash") - statValue(state.stats, "total_outflow_cash"),
    balanceSavings: (state): number =>
      statValue(state.stats, "total_inflow_savings") -
      statValue(state.stats, "total_outflow_savings"),
    balanceLoans: (state): number =>
      statValue(state.stats, "total_inflow_loans") - statValue(state.stats, "total_outflow_loans"),
  },

  actions: {
    /* ------------------------------ Pengambilan data ----------------------------- */

    async fetchCashFlows(params: CashFlowQueryParams = {}): Promise<boolean> {
      this.isCashFlows = true;
      const response = await cashFlowApi.getCashFlows(params);
      this.isCashFlows = false;

      if (!response.success) {
        showErrorDialog(getErrorMessage(response, "Gagal memuat catatan arus kas."));
        return false;
      }

      this.cashFlows = response.data?.cash_flows ?? [];
      this.stats = normalizeStats(response.data?.stats);
      return true;
    },

    async fetchCashFlow(id: number | string): Promise<boolean> {
      this.isCashFlow = true;
      this.cashFlow = null;
      const response = await cashFlowApi.getCashFlow(id);
      this.isCashFlow = false;

      if (!response.success || !response.data?.cash_flow) {
        showErrorDialog(getErrorMessage(response, "Catatan arus kas tidak ditemukan."));
        return false;
      }

      this.cashFlow = response.data.cash_flow;
      return true;
    },

    /** Dipanggil "diam": label hanya pelengkap filter, kegagalannya tak perlu dialog. */
    async fetchLabels(): Promise<boolean> {
      this.isLabels = true;
      const response = await cashFlowApi.getLabels();
      this.isLabels = false;

      if (!response.success) return false;

      this.labels = response.data?.labels ?? [];
      return true;
    },

    async fetchStatsDaily(params: CashFlowChartQueryParams = {}): Promise<boolean> {
      this.isStatsDaily = true;
      const response = await cashFlowApi.getStatsDaily(params);
      this.isStatsDaily = false;

      if (!response.success) return false;

      this.statsDaily = normalizeChart(response.data);
      return true;
    },

    async fetchStatsMonthly(params: CashFlowChartQueryParams = {}): Promise<boolean> {
      this.isStatsMonthly = true;
      const response = await cashFlowApi.getStatsMonthly(params);
      this.isStatsMonthly = false;

      if (!response.success) return false;

      this.statsMonthly = normalizeChart(response.data);
      return true;
    },

    /* ---------------------------------- Mutasi ---------------------------------- */

    async addCashFlow(payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowAdd = true;
      this.isCashFlowAdded = false;
      const response = await cashFlowApi.createCashFlow(payload);
      this.isCashFlowAdd = false;

      if (!response.success) {
        showErrorDialog(getErrorMessage(response, "Gagal menambahkan catatan."));
        return false;
      }

      this.isCashFlowAdded = true;
      showSuccessDialog(response.message || "Catatan arus kas berhasil ditambahkan.");
      return true;
    },

    async changeCashFlow(id: number | string, payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowChange = true;
      this.isCashFlowChanged = false;
      const response = await cashFlowApi.updateCashFlow(id, payload);
      this.isCashFlowChange = false;

      if (!response.success) {
        showErrorDialog(getErrorMessage(response, "Gagal mengubah catatan."));
        return false;
      }

      this.isCashFlowChanged = true;
      showSuccessDialog(response.message || "Catatan arus kas berhasil diubah.");
      return true;
    },

    async deleteCashFlow(id: number | string): Promise<boolean> {
      this.isCashFlowDelete = true;
      this.isCashFlowDeleted = false;
      const response = await cashFlowApi.deleteCashFlow(id);
      this.isCashFlowDelete = false;

      if (!response.success) {
        showErrorDialog(getErrorMessage(response, "Gagal menghapus catatan."));
        return false;
      }

      this.isCashFlowDeleted = true;
      showSuccessDialog(response.message || "Catatan arus kas berhasil dihapus.");
      return true;
    },

    async deleteAllCashFlows(): Promise<boolean> {
      this.isCashFlowDeleteAll = true;
      this.isCashFlowDeletedAll = false;
      const response = await cashFlowApi.deleteAllCashFlows();
      this.isCashFlowDeleteAll = false;

      if (!response.success) {
        showErrorDialog(getErrorMessage(response, "Gagal mereset catatan."));
        return false;
      }

      this.isCashFlowDeletedAll = true;
      showSuccessDialog(response.message || "Seluruh catatan arus kas berhasil dihapus.");
      return true;
    },

    /** Kembalikan semua state ke awal (dipanggil saat logout). */
    reset() {
      this.$reset();
    },
  },
});
