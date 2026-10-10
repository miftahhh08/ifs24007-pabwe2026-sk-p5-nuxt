<script setup lang="ts">
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, sourceLabels, typeLabels } from "../../../helpers/toolsHelper";
import type { CashFlowPayload, CashFlowSource, CashFlowType } from "../api/cashFlowApi";

const props = defineProps<{
  initial: CashFlowPayload;
  labels: string[];
  busy: boolean;
  submitLabel: string;
}>();

const emit = defineEmits<{
  submit: [payload: CashFlowPayload];
  cancel: [];
}>();

const { value: type } = useInput<CashFlowType>(props.initial.type);
const { value: source } = useInput<CashFlowSource>(props.initial.source);
const { value: label } = useInput(props.initial.label);
const { value: nominal } = useInput(props.initial.nominal ? String(props.initial.nominal) : "");
const { value: description } = useInput(props.initial.description);

async function handleSubmit() {
  const amount = Number(nominal.value);

  if (!label.value.trim()) {
    await showErrorDialog("Label wajib diisi.");
    return;
  }
  if (!(amount > 0)) {
    await showErrorDialog("Nominal harus lebih besar dari 0.");
    return;
  }

  emit("submit", {
    type: type.value,
    source: source.value,
    label: label.value.trim(),
    nominal: amount,
    description: description.value.trim(),
  });
}

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";
</script>

<template>
  <form class="space-y-4" data-testid="cash-flow-form" @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="cf-type" class="mb-1.5 block text-sm font-semibold">Jenis arus kas</label>
        <select id="cf-type" v-model="type" :class="fieldClass">
          <option v-for="(text, key) in typeLabels" :key="key" :value="key">{{ text }}</option>
        </select>
      </div>
      <div>
        <label for="cf-source" class="mb-1.5 block text-sm font-semibold">Sumber dana</label>
        <select id="cf-source" v-model="source" :class="fieldClass">
          <option v-for="(text, key) in sourceLabels" :key="key" :value="key">{{ text }}</option>
        </select>
      </div>
    </div>

    <div>
      <label for="cf-label" class="mb-1.5 block text-sm font-semibold">Label kategori</label>
      <input
        id="cf-label"
        v-model="label"
        type="text"
        list="cf-label-options"
        placeholder="Contoh: Gaji, Makan, Transport"
        :class="fieldClass"
      />
      <datalist id="cf-label-options">
        <option v-for="item in labels" :key="item" :value="item" />
      </datalist>
    </div>

    <div>
      <label for="cf-nominal" class="mb-1.5 block text-sm font-semibold">Nominal (Rp)</label>
      <input
        id="cf-nominal"
        v-model="nominal"
        type="number"
        min="1"
        placeholder="0"
        :class="fieldClass"
      />
    </div>

    <div>
      <label for="cf-description" class="mb-1.5 block text-sm font-semibold">Keterangan</label>
      <textarea
        id="cf-description"
        v-model="description"
        rows="3"
        placeholder="Catatan tambahan (opsional)"
        :class="fieldClass"
      />
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        data-testid="cancel-button"
        class="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold hover:bg-slate-50"
        @click="emit('cancel')"
      >
        Batal
      </button>
      <button
        type="submit"
        :disabled="busy"
        class="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>
