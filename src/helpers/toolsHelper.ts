import Swal from "sweetalert2";

/* ---------- Label & gaya untuk jenis / sumber arus kas ---------- */

export const typeLabels: Record<string, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};

export const sourceLabels: Record<string, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

export const typeBadgeClasses: Record<string, string> = {
  inflow: "bg-emerald-100 text-emerald-700",
  outflow: "bg-rose-100 text-rose-700",
};

export const typeSigns: Record<string, string> = {
  inflow: "+",
  outflow: "-",
};

/* ---------- Dialog SweetAlert2 ---------- */

export function showSuccessDialog(message: string) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1800,
    showConfirmButton: false,
  });
}

export function showErrorDialog(message: string) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor: "#059669",
  });
}

export async function showConfirmDialog(
  title: string,
  text: string,
  confirmText: string
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
  });
  return result.isConfirmed;
}

/* ---------- Format ---------- */

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatWith(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions
): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...options }).format(date);
}

export function formatDate(value: string | null | undefined): string {
  return formatWith(value, { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(value: string | null | undefined): string {
  return formatWith(value, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Ubah path relatif dari API (mis. foto) menjadi URL absolut. */
export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, "")}`;
}

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return initials || "?";
}
