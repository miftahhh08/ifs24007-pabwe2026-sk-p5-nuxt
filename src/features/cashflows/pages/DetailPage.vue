<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import {
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  sourceLabels,
  typeBadgeClasses,
  typeLabels,
  typeSigns,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useCashFlowsStore();
const showEdit = ref(false);

const cashFlowId = String(route.params.cashFlowId);

async function loadDetail() {
  await store.fetchCashFlow(cashFlowId);
}

async function handleDelete() {
  const confirmed = await showConfirmDialog(
    "Hapus transaksi?",
    "Transaksi ini akan dihapus permanen.",
    "Ya, hapus"
  );
  if (!confirmed) {
    return;
  }
  const response = await store.deleteCashFlow(cashFlowId);
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
  await router.replace("/");
}

onMounted(loadDetail);
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
      <ArrowLeft class="size-4" />
      Kembali ke ringkasan
    </RouterLink>

    <p v-if="store.isCashFlow" class="text-slate-500" data-testid="detail-loading">
      Memuat detail transaksi...
    </p>

    <article
      v-else-if="store.cashFlow"
      data-testid="detail-card"
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-bold"
            :class="typeBadgeClasses[store.cashFlow.type]"
          >
            {{ typeLabels[store.cashFlow.type] }}
          </span>
          <h1 class="mt-3 text-2xl font-extrabold tracking-tight">{{ store.cashFlow.label }}</h1>
        </div>
        <p class="text-2xl font-extrabold">
          {{ typeSigns[store.cashFlow.type] }}{{ formatRupiah(store.cashFlow.nominal) }}
        </p>
      </div>

      <dl class="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-slate-500">Sumber dana</dt>
          <dd class="font-semibold">{{ sourceLabels[store.cashFlow.source] }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Dibuat</dt>
          <dd class="font-semibold">{{ formatDateTime(store.cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Terakhir diubah</dt>
          <dd class="font-semibold">{{ formatDateTime(store.cashFlow.updated_at) }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-slate-500">Keterangan</dt>
          <dd class="font-semibold">{{ store.cashFlow.description }}</dd>
        </div>
      </dl>

      <div class="mt-8 flex gap-3">
        <button
          type="button"
          data-testid="detail-edit"
          class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
          @click="showEdit = true"
        >
          <Pencil class="size-4" />
          Ubah
        </button>
        <button
          type="button"
          data-testid="detail-delete"
          class="flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-600 hover:bg-rose-50"
          @click="handleDelete"
        >
          <Trash2 class="size-4" />
          Hapus
        </button>
      </div>

      <ChangeModal
        v-if="showEdit"
        :cash-flow="store.cashFlow"
        @close="showEdit = false"
        @saved="loadDetail"
      />
    </article>

    <p
      v-else
      class="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500"
      data-testid="detail-not-found"
    >
      Transaksi tidak ditemukan.
    </p>
  </section>
</template>
