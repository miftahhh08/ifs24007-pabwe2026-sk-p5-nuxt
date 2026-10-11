import Swal from "sweetalert2";

/* ---------------------------- Dialog SweetAlert2 --------------------------- */

export function showSuccessDialog(message: string, title = "Berhasil") {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#059669",
  });
}

export function showErrorDialog(message: string, title = "Gagal") {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#059669",
  });
}

export function showWarningDialog(message: string, title = "Perhatian") {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: "#059669",
  });
}

export async function showConfirmDialog(
  message: string,
  title = "Apakah kamu yakin?",
  confirmText = "Ya, lanjutkan"
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
  });

  return result.isConfirmed;
}

/* -------------------------------- Formatter -------------------------------- */

/** 2500000 -> "Rp 2.500.000" */
export function formatRupiah(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0) || 0;
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return `${amount < 0 ? "-" : ""}Rp ${formatted}`;
}

/** "2024-10-05T12:09:16.000000Z" -> "5 Oktober 2024" */
export function formatDate(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "2024-10-05T12:09:16.000000Z" -> "5 Oktober 2024 pukul 19.09" */
export function formatDateTime(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const datePart = formatDate(value);
  const timePart = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} pukul ${timePart}`;
}

/* --------------------------------- Avatar --------------------------------- */

/** "Budi Santoso" -> "BS", "budi" -> "B", kosong -> "?" */
export function getInitials(name?: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

/**
 * Mengubah path foto dari API menjadi URL lengkap.
 * - URL penuh (http/https) dipakai apa adanya
 * - path relatif ("img/profile/1.png") digabung dengan host API
 * - kosong -> null (tampilkan inisial sebagai gantinya)
 */
export function getPhotoUrl(photo?: string | null): string | null {
  if (!photo) return null;
  if (/^https?:\/\//i.test(photo)) return photo;

  const origin = new URL(DELCOM_BASEURL).origin;
  return `${origin}/${photo.replace(/^\/+/, "")}`;
}

/* ---------------------------------- Label ---------------------------------- */

/** Label tampilan untuk jenis arus kas (nilai dari API: inflow / outflow). */
export const typeLabels: Record<string, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};

/** Label tampilan untuk sumber dana (nilai dari API: cash / savings / loans). */
export const sourceLabels: Record<string, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};
