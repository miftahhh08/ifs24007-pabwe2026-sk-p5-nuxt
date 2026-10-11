import { ref } from "vue";
import type { Ref } from "vue";

export interface UseInputReturn<T> {
  value: Ref<T>;
  onChange: (event: Event) => void;
  reset: () => void;
}

/**
 * Hook kecil untuk mengelola nilai input form.
 * - `value`    : ref yang bisa dipakai dengan v-model
 * - `onChange` : handler untuk @input / @change
 * - `reset`    : mengembalikan nilai ke nilai awal
 */
export function useInput<T = string>(initialValue: T): UseInputReturn<T> {
  const value = ref(initialValue) as Ref<T>;

  const onChange = (event: Event) => {
    value.value = (event.target as HTMLInputElement).value as unknown as T;
  };

  const reset = () => {
    value.value = initialValue;
  };

  return { value, onChange, reset };
}
