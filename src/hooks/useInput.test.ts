import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("memiliki nilai awal", () => {
    const { value } = useInput("awal");
    expect(value.value).toBe("awal");
  });

  it("onChange memperbarui nilai dari event", () => {
    const { value, onChange } = useInput("");
    onChange({ target: { value: "baru" } } as unknown as Event);
    expect(value.value).toBe("baru");
  });

  it("reset mengembalikan nilai awal", () => {
    const { value, onChange, reset } = useInput("awal");
    onChange({ target: { value: "ubah" } } as unknown as Event);
    reset();
    expect(value.value).toBe("awal");
  });
});
