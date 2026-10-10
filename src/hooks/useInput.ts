import { ref, type Ref } from "vue";

export type InputChangeHandler = (event: Event) => void;

/**
 * Composable untuk mengelola satu input form.
 *
 * const [name, onNameChange, resetName] = useInput("");
 * <input :value="name" @input="onNameChange" />
 */
export function useInput(
  initialValue: string = ""
): [Ref<string>, InputChangeHandler, () => void] {
  const value = ref(initialValue);

  const onChange: InputChangeHandler = (event) => {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    value.value = target.value;
  };

  const reset = () => {
    value.value = initialValue;
  };

  return [value, onChange, reset];
}
