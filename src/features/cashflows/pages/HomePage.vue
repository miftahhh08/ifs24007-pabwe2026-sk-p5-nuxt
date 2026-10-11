<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { Eye, Pencil, Plus, Trash2 } from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { useInput } from "../../../hooks/useInput";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  sourceLabels,
  typeBadgeClasses,
  typeLabels,
  typeSigns,
} from "../../../helpers/toolsHelper";
import type { CashFlow, CashFlowQueryParams } from "../api/cashFlowApi";

const store = useCashFlowsStore();

const { value: filterType } = useInput("");
const { value: filterSource } = useInput("");
const { value: filterLabel } = useInput("");
const { value: filterStart } = useInput("");
const { value: filterEnd } = useInput("");

const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const metrics = computed(() => [
  { key: "balance", title: "Total Saldo Kas Bersih", value: store.stats.total_balance, tone: "text-slate-900" },
  { key: "inflow", title: "Total Pemasukan", value: store.stats.total_inflow, tone: "text-emerald-700" },
  { key: "outflow", title: "Total Pengeluaran", value: store.stats.total_outflow, tone: "text-rose-700" },
  { key: "cash", title: "Saldo Kas Tunai", value: store.stats.cash, tone: "text-slate-900" },
  { key: "savings", title: "Saldo Tabungan", value: store.stats.savings, tone: "text-slate-900" },
  { key: "loans", title: "Saldo Pinjaman", value: store.stats.loans, tone: "text-slate-900" },
]);

function currentQuery(): CashFlowQueryParams {
  return {
    type: filterType.value as CashFlowQueryParams["type"],
    source: filterSource.value as CashFlowQueryParams["source"],
    label: filterLabel.value,
    start_date: filterStart.value,
    end_date: filterEnd.value,
  };
}

async function loadData() {
  await store.fetchCashFlows(currentQuery());
}

async function reloadAll() {
  await Promise.all([loadData(), store.fetchLabels()]);
}

async function resetFilters() {
  filterType.value = "";
  filterSource.value = "";
  filterLabel.value = "";
  filterStart.value = "";
  filterEnd.value = "";
  await loadData();
}

async function handleDelete(item: CashFlow) {
  const confirmed = await showConfirmDialog(
    "Hapus transaksi?",
    `Transaksi "${item.label}" akan dihapus permanen.`,
    "Ya, hapus"
  );
  if (!confirmed) {
    return;
  }
  const response = await store.deleteCashFlow(item.id);
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
  await loadData();
}

async function handleDeleteAll() {
  const confirmed = await showConfirmDialog(
    "Reset semua data?",
    "Seluruh transaksi akan dihapus permanen dan tidak bisa dikembalikan.",
    "Ya, reset semua"
  );
  if (!confirmed) {
    return;
  }
  const response = await store.deleteAllCashFlows();
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
  await reloadAll();
}

async function handleSaved() {
  await reloadAll();
}

onMounted(reloadAll);

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-500">
          Pantau pemasukan, pengeluaran, dan saldo dari tiap sumber dana.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          data-testid="reset-all-button"
          class="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          @click="handleDeleteAll"
        >
          Reset Semua
        </button>
        <button
          type="button"
          data-testid="add-button"
          class="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
          @click="showAdd = true"
        >
          <Plus class="size-4" />
          Tambah Transaksi
        </button>
      </div>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="metric in metrics"
        :key="metric.key"
        data-testid="metric-card"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm font-medium text-slate-500">{{ metric.title }}</p>
        <p class="mt-2 text-2xl font-extrabold tracking-tight" :class="metric.tone">
          {{ formatRupiah(metric.value) }}
        </p>
      </article>
    </div>

    <form
      data-testid="filter-form"
      class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
      @submit.prevent="loadData"
    >
      <select v-model="filterType" aria-label="Filter jenis" :class="fieldClass">
        <option value="">Semua jenis</option>
        <option v-for="(text, key) in typeLabels" :key="key" :value="key">{{ text }}</option>
      </select>
      <select v-model="filterSource" aria-label="Filter sumber" :class="fieldClass">
        <option value="">Semua sumber</option>
        <option v-for="(text, key) in sourceLabels" :key="key" :value="key">{{ text }}</option>
      </select>
      <select v-model="filterLabel" aria-label="Filter label" :class="fieldClass">
        <option value="">Semua label</option>
        <option v-for="item in store.labels" :key="item" :value="item">{{ item }}</option>
      </select>
      <input v-model="filterStart" type="date" aria-label="Tanggal mulai" :class="fieldClass" />
      <input v-model="filterEnd" type="date" aria-label="Tanggal akhir" :class="fieldClass" />
      <div class="flex gap-2">
        <button
          type="submit"
          class="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700"
        >
          Terapkan
        </button>
        <button
          type="button"
          data-testid="reset-filter"
          class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          @click="resetFilters"
        >
          Reset
        </button>
      </div>
    </form>

    <p v-if="store.isCashFlow" class="text-slate-500" data-testid="cash-flow-loading">
      Memuat data arus kas...
    </p>
    <p
      v-else-if="store.cashFlows.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      data-testid="cash-flow-empty"
    >
      Belum ada transaksi yang cocok. Tambahkan transaksi pertama kamu.
    </p>
    <div
      v-else
      class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="bg-slate-50 text-slate-500">
          <tr>
            <th class="px-4 py-3 font-semibold">Tanggal</th>
            <th class="px-4 py-3 font-semibold">Label</th>
            <th class="px-4 py-3 font-semibold">Jenis</th>
            <th class="px-4 py-3 font-semibold">Sumber</th>
            <th class="px-4 py-3 text-right font-semibold">Nominal</th>
            <th class="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in store.cashFlows" :key="item.id" data-testid="cash-flow-row">
            <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(item.created_at) }}</td>
            <td class="px-4 py-3 font-semibold">{{ item.label }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-bold"
                :class="typeBadgeClasses[item.type]"
              >
                {{ typeLabels[item.type] }}
              </span>
            </td>
            <td class="px-4 py-3">{{ sourceLabels[item.source] }}</td>
            <td class="px-4 py-3 text-right font-bold whitespace-nowrap">
              {{ typeSigns[item.type] }}{{ formatRupiah(item.nominal) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <RouterLink
                  :to="`/cash-flows/${item.id}`"
                  aria-label="Lihat detail"
                  class="rounded-lg p-2 hover:bg-slate-100"
                >
                  <Eye class="size-4" />
                </RouterLink>
                <button
                  type="button"
                  :data-testid="`edit-${item.id}`"
                  aria-label="Ubah"
                  class="rounded-lg p-2 hover:bg-slate-100"
                  @click="editing = item"
                >
                  <Pencil class="size-4" />
                </button>
                <button
                  type="button"
                  :data-testid="`delete-${item.id}`"
                  aria-label="Hapus"
                  class="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                  @click="handleDelete(item)"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="handleSaved" />
    <ChangeModal
      v-if="editing"
      :cash-flow="editing"
      @close="editing = null"
      @saved="handleSaved"
    />
  </section>
</template>
