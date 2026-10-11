import { fetchApi, type ApiResponse } from "../../../helpers/apiHelper";
import type {
  CashFlow,
  CashFlowChartQueryParams,
  CashFlowChartStats,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowStats,
} from "../states/cashFlowsStore";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * API meminta timestamp "YYYY-MM-DD HH:mm:ss". Input <input type="date">
 * hanya menghasilkan "YYYY-MM-DD", jadi jamnya dilengkapi di sini:
 * awal hari (00:00:00) untuk start_date, akhir hari (23:59:59) untuk end_date.
 */
export function toApiDate(value: string | undefined, edge: "start" | "end"): string | undefined {
  if (!value) return undefined;
  if (!DATE_ONLY.test(value)) return value;
  return `${value} ${edge === "start" ? "00:00:00" : "23:59:59"}`;
}

export const cashFlowApi = {
  /** GET /cash-flows (+ filter) */
  getCashFlows(
    params: CashFlowQueryParams = {}
  ): Promise<ApiResponse<{ cash_flows: CashFlow[]; stats: CashFlowStats }>> {
    return fetchApi("/cash-flows", {
      params: {
        type: params.type,
        source: params.source,
        label: params.label,
        start_date: toApiDate(params.start_date, "start"),
        end_date: toApiDate(params.end_date, "end"),
      },
    });
  },

  /** GET /cash-flows/:id */
  getCashFlow(id: number | string): Promise<ApiResponse<{ cash_flow: CashFlow }>> {
    return fetchApi(`/cash-flows/${id}`);
  },

  /** POST /cash-flows */
  createCashFlow(payload: CashFlowPayload): Promise<ApiResponse<{ cash_flow_id: number }>> {
    return fetchApi("/cash-flows", { method: "POST", body: { ...payload } });
  },

  /** PUT /cash-flows/:id */
  updateCashFlow(id: number | string, payload: CashFlowPayload): Promise<ApiResponse<null>> {
    return fetchApi(`/cash-flows/${id}`, { method: "PUT", body: { ...payload } });
  },

  /** DELETE /cash-flows/:id */
  deleteCashFlow(id: number | string): Promise<ApiResponse<null>> {
    return fetchApi(`/cash-flows/${id}`, { method: "DELETE" });
  },

  /** GET /cash-flows/labels */
  getLabels(): Promise<ApiResponse<{ labels: string[] }>> {
    return fetchApi("/cash-flows/labels");
  },

  /** GET /cash-flows/stats/daily */
  getStatsDaily(params: CashFlowChartQueryParams = {}): Promise<ApiResponse<CashFlowChartStats>> {
    return fetchApi("/cash-flows/stats/daily", {
      params: { end_date: toApiDate(params.end_date, "end"), total_data: params.total_data },
    });
  },

  /** GET /cash-flows/stats/monthly */
  getStatsMonthly(params: CashFlowChartQueryParams = {}): Promise<ApiResponse<CashFlowChartStats>> {
    return fetchApi("/cash-flows/stats/monthly", {
      params: { end_date: toApiDate(params.end_date, "end"), total_data: params.total_data },
    });
  },

  /** DELETE /cash-flows (hapus SEMUA catatan milik pengguna) */
  deleteAllCashFlows(): Promise<ApiResponse<null>> {
    return fetchApi("/cash-flows", { method: "DELETE" });
  },
};
