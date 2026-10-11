<script setup lang="ts">
import CashFlowForm from "../components/CashFlowForm.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import type { CashFlow, CashFlowPayload } from "../api/cashFlowApi";

const props = defineProps<{ cashFlow: CashFlow }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const store = useCashFlowsStore();

const initial: CashFlowPayload = {
  type: props.cashFlow.type,
  source: props.cashFlow.source,
  label: props.cashFlow.label,
  nominal: props.cashFlow.nominal,
  description: props.cashFlow.description,
};

async function handleSubmit(payload: CashFlowPayload) {
  const response = await store.changeCashFlow(props.cashFlow.id, payload);
  if (!response.success) {
    await showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
  emit("saved");
  emit("close");
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    role="dialog"
    aria-modal="true"
    data-testid="change-modal"
  >
    <div class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <h2 class="mb-5 text-xl font-extrabold tracking-tight">Ubah Transaksi</h2>
      <CashFlowForm
        :initial="initial"
        :labels="store.labels"
        :busy="store.isCashFlowChange"
        submit-label="Simpan perubahan"
        @submit="handleSubmit"
        @cancel="emit('close')"
      />
    </div>
  </div>
</template>
