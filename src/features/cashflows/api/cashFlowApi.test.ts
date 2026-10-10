import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
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
} from "./cashFlowApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

const payload = {
  type: "inflow" as const,
  source: "cash" as const,
  label: "Gaji",
  nominal: 5000,
  description: "",
};

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("getCashFlows meneruskan filter sebagai query", () => {
    getCashFlows({ type: "inflow", label: "Gaji" });
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", {
      method: "GET",
      query: { type: "inflow", label: "Gaji" },
    });
  });

  it("getCashFlow", () => {
    getCashFlow("a1");
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/a1", { method: "GET" });
  });

  it("postCashFlow", () => {
    postCashFlow(payload);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { method: "POST", body: payload });
  });

  it("putCashFlow", () => {
    putCashFlow("a1", payload);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/a1", { method: "PUT", body: payload });
  });

  it("deleteCashFlow", () => {
    deleteCashFlow("a1");
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/a1", { method: "DELETE" });
  });

  it("getLabels, getStatsDaily, getStatsMonthly", () => {
    getLabels();
    getStatsDaily();
    getStatsMonthly();
    expect(vi.mocked(apiFetch).mock.calls.map((call) => call[0])).toEqual([
      "/cash-flows/labels",
      "/cash-flows/stats/daily",
      "/cash-flows/stats/monthly",
    ]);
  });

  it("deleteAllCashFlows", () => {
    deleteAllCashFlows();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { method: "DELETE" });
  });
});
