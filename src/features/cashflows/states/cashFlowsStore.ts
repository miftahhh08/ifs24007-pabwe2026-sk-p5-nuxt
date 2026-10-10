import { defineStore } from "pinia";
import { pickArray, pickNumber, pickObject } from "../../../helpers/apiHelper";
import {
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getLabels,
  getStatsDaily,
  getStatsMonthly,
  postCashFlow,
  putCashFlow,
} from "../api/cashFlowApi";
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowSource,
  CashFlowStats,
  CashFlowType,
} from "../api/cashFlowApi";

export type { CashFlow, CashFlowQueryParams, CashFlowStats };

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: any[];
  statsMonthly: any[];
  isCashFlow: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

/* ---------- Normalisasi data dari API ---------- */

const emptyStats = (): CashFlowStats => ({
  total_inflow: 0,
  total_outflow: 0,
  total_balance: 0,
  cash: 0,
  savings: 0,
  loans: 0,
});

export function normalizeCashFlow(raw: Record<string, any>): CashFlow {
  return {
    ...(raw as CashFlow),
    nominal: pickNumber(raw, ["nominal", "amount"], 0),
    description: String(raw.description ?? ""),
  };
}

const signed = (item: CashFlow) => (item.type === "inflow" ? item.nominal : -item.nominal);
const sumByType = (items: CashFlow[], type: CashFlowType) =>
  items.filter((item) => item.type === type).reduce((total, item) => total + item.nominal, 0);
const balanceBySource = (items: CashFlow[], source: CashFlowSource) =>
  items.filter((item) => item.source === source).reduce((total, item) => total + signed(item), 0);

/** Saldo satu sumber dana: langsung dari stats, atau inflow - outflow, atau dihitung dari daftar. */
function sourceBalance(
  stats: Record<string, any>,
  items: CashFlow[],
  source: CashFlowSource
): number {
  const direct = pickNumber(stats, [source, `total_${source}`], Number.NaN);
  if (!Number.isNaN(direct)) {
    return direct;
  }
  const inflow = pickNumber(stats, [`total_inflow_${source}`], Number.NaN);
  const outflow = pickNumber(stats, [`total_outflow_${source}`], Number.NaN);
  if (Number.isNaN(inflow) && Number.isNaN(outflow)) {
    return balanceBySource(items, source);
  }
  return (Number.isNaN(inflow) ? 0 : inflow) - (Number.isNaN(outflow) ? 0 : outflow);
}

export function normalizeStats(data: unknown, items: CashFlow[]): CashFlowStats {
  const stats = pickObject(data, ["stats", "summary"]);
  const totalInflow = pickNumber(stats, ["total_inflow", "inflow"], sumByType(items, "inflow"));
  const totalOutflow = pickNumber(stats, ["total_outflow", "outflow"], sumByType(items, "outflow"));

  return {
    total_inflow: totalInflow,
    total_outflow: totalOutflow,
    total_balance: pickNumber(
      stats,
      ["total_balance", "balance", "net_balance"],
      totalInflow - totalOutflow
    ),
    cash: sourceBalance(stats, items, "cash"),
    savings: sourceBalance(stats, items, "savings"),
    loans: sourceBalance(stats, items, "loans"),
  };
}

/* ---------- Store ---------- */

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    statsDaily: [],
    statsMonthly: [],
    isCashFlow: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    async fetchCashFlows(query: CashFlowQueryParams) {
      this.isCashFlow = true;
      const response = await getCashFlows(query);
      if (response.success) {
        const items = pickArray(response.data, ["cash_flows", "cashFlows", "items"]).map(
          normalizeCashFlow
        );
        this.cashFlows = items;
        this.stats = normalizeStats(response.data, items);
      }
      this.isCashFlow = false;
      return response;
    },
    async fetchCashFlow(id: string) {
      this.isCashFlow = true;
      this.cashFlow = null;
      const response = await getCashFlow(id);
      this.cashFlow = response.success
        ? normalizeCashFlow(pickObject(response.data, ["cash_flow", "cashFlow"]))
        : null;
      this.isCashFlow = false;
      return response;
    },
    async fetchLabels() {
      const response = await getLabels();
      if (response.success) {
        this.labels = pickArray(response.data, ["labels"]).map((item) =>
          typeof item === "string" ? item : String(item.label)
        );
      }
      return response;
    },
    async fetchStatsDaily() {
      const response = await getStatsDaily();
      if (response.success) {
        this.statsDaily = pickArray(response.data, ["stats", "daily"]);
      }
      return response;
    },
    async fetchStatsMonthly() {
      const response = await getStatsMonthly();
      if (response.success) {
        this.statsMonthly = pickArray(response.data, ["stats", "monthly"]);
      }
      return response;
    },
    async addCashFlow(payload: CashFlowPayload) {
      this.isCashFlowAdd = true;
      this.isCashFlowAdded = false;
      const response = await postCashFlow(payload);
      this.isCashFlowAdd = false;
      this.isCashFlowAdded = response.success;
      return response;
    },
    async changeCashFlow(id: string, payload: CashFlowPayload) {
      this.isCashFlowChange = true;
      this.isCashFlowChanged = false;
      const response = await putCashFlow(id, payload);
      this.isCashFlowChange = false;
      this.isCashFlowChanged = response.success;
      return response;
    },
    async deleteCashFlow(id: string) {
      this.isCashFlowDelete = true;
      this.isCashFlowDeleted = false;
      const response = await deleteCashFlow(id);
      this.isCashFlowDelete = false;
      this.isCashFlowDeleted = response.success;
      return response;
    },
    async deleteAllCashFlows() {
      this.isCashFlowDeleteAll = true;
      this.isCashFlowDeletedAll = false;
      const response = await deleteAllCashFlows();
      this.isCashFlowDeleteAll = false;
      this.isCashFlowDeletedAll = response.success;
      return response;
    },
  },
});
