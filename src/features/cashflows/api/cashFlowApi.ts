import { apiFetch } from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: string;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  nominal: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlowStats {
  total_inflow: number;
  total_outflow: number;
  total_balance: number;
  cash: number;
  savings: number;
  loans: number;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  nominal: number;
  description: string;
}

export const getCashFlows = (query: CashFlowQueryParams) =>
  apiFetch("/cash-flows", { method: "GET", query: { ...query } });

export const getCashFlow = (id: string) => apiFetch(`/cash-flows/${id}`, { method: "GET" });

export const postCashFlow = (payload: CashFlowPayload) =>
  apiFetch("/cash-flows", { method: "POST", body: payload });

export const putCashFlow = (id: string, payload: CashFlowPayload) =>
  apiFetch(`/cash-flows/${id}`, { method: "PUT", body: payload });

export const deleteCashFlow = (id: string) =>
  apiFetch(`/cash-flows/${id}`, { method: "DELETE" });

export const getLabels = () => apiFetch("/cash-flows/labels", { method: "GET" });

export const getStatsDaily = () => apiFetch("/cash-flows/stats/daily", { method: "GET" });

export const getStatsMonthly = () => apiFetch("/cash-flows/stats/monthly", { method: "GET" });

export const deleteAllCashFlows = () => apiFetch("/cash-flows", { method: "DELETE" });
