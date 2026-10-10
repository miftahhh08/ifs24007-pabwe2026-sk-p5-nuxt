import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatDateTime,
  formatRupiah,
  getInitials,
  resolveAssetUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  sourceLabels,
  typeBadgeClasses,
  typeLabels,
  typeSigns,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("dialog", () => {
  beforeEach(() => {
    vi.mocked(Swal.fire).mockReset();
  });

  it("showSuccessDialog", () => {
    showSuccessDialog("Tersimpan");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", text: "Tersimpan" })
    );
  });

  it("showErrorDialog", () => {
    showErrorDialog("Salah");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "error", text: "Salah" })
    );
  });

  it("showConfirmDialog mengembalikan true/false sesuai pilihan", async () => {
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
    expect(await showConfirmDialog("Judul", "Teks", "Ya")).toBe(true);
    vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as any);
    expect(await showConfirmDialog("Judul", "Teks", "Ya")).toBe(false);
  });
});

describe("format", () => {
  it("formatRupiah", () => {
    expect(formatRupiah(1500000)).toContain("1.500.000");
    expect(formatRupiah(1500000)).toMatch(/^Rp/);
    expect(formatRupiah(Number.NaN)).toMatch(/0$/);
  });

  it("formatDate", () => {
    expect(formatDate("2026-01-15T03:00:00Z")).toBe("15 Januari 2026");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bukan tanggal")).toBe("-");
  });

  it("formatDateTime", () => {
    expect(formatDateTime("2026-01-15T03:00:00Z")).toContain("15 Januari 2026");
    expect(formatDateTime(null)).toBe("-");
  });

  it("resolveAssetUrl", () => {
    expect(resolveAssetUrl(null)).toBe("");
    expect(resolveAssetUrl("https://cdn.test/a.png")).toBe("https://cdn.test/a.png");
    const origin = new URL(DELCOM_BASEURL).origin;
    expect(resolveAssetUrl("/uploads/a.png")).toBe(`${origin}/uploads/a.png`);
    expect(resolveAssetUrl("uploads/a.png")).toBe(`${origin}/uploads/a.png`);
  });

  it("getInitials", () => {
    expect(getInitials("Budi Santoso Putra")).toBe("BS");
    expect(getInitials("andi")).toBe("A");
    expect(getInitials("   ")).toBe("?");
  });
});

describe("konstanta label", () => {
  it("berisi pemetaan untuk jenis dan sumber dana", () => {
    expect(typeLabels.inflow).toBe("Pemasukan");
    expect(sourceLabels.savings).toBe("Tabungan");
    expect(typeBadgeClasses.outflow).toContain("rose");
    expect(typeSigns.inflow).toBe("+");
  });
});
