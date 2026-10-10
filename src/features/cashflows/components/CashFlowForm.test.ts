import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import CashFlowForm from "./CashFlowForm.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
}));

const emptyInitial = {
  type: "inflow" as const,
  source: "cash" as const,
  label: "",
  nominal: 0,
  description: "",
};

const mountForm = (initial = emptyInitial, busy = false) =>
  mount(CashFlowForm, {
    props: { initial, labels: ["Gaji", "Makan"], busy, submitLabel: "Simpan" },
  });

describe("CashFlowForm", () => {
  beforeEach(() => {
    vi.mocked(showErrorDialog).mockReset();
  });

  it("menampilkan opsi label dan tombol sesuai props", () => {
    const wrapper = mountForm();
    expect(wrapper.findAll("datalist option")).toHaveLength(2);
    expect(wrapper.find('button[type="submit"]').text()).toBe("Simpan");
    expect((wrapper.find("#cf-nominal").element as HTMLInputElement).value).toBe("");
  });

  it("menonaktifkan tombol saat busy", () => {
    const wrapper = mountForm(emptyInitial, true);
    expect(wrapper.find('button[type="submit"]').attributes("disabled")).toBeDefined();
  });

  it("menolak label kosong", async () => {
    const wrapper = mountForm();
    await wrapper.find("#cf-nominal").setValue("1000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Label wajib diisi.");
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("menolak nominal nol", async () => {
    const wrapper = mountForm();
    await wrapper.find("#cf-label").setValue("Gaji");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Nominal harus lebih besar dari 0.");
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("mengirim payload yang sudah dibersihkan", async () => {
    const wrapper = mountForm();
    await wrapper.find("#cf-type").setValue("outflow");
    await wrapper.find("#cf-source").setValue("savings");
    await wrapper.find("#cf-label").setValue("  Makan  ");
    await wrapper.find("#cf-nominal").setValue("25000");
    await wrapper.find("#cf-description").setValue("  siang  ");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.emitted("submit")![0]).toEqual([
      { type: "outflow", source: "savings", label: "Makan", nominal: 25000, description: "siang" },
    ]);
  });

  it("memakai nilai awal untuk mode ubah", () => {
    const wrapper = mountForm({
      type: "outflow",
      source: "loans",
      label: "Cicilan",
      nominal: 750000,
      description: "bulanan",
    });
    expect((wrapper.find("#cf-label").element as HTMLInputElement).value).toBe("Cicilan");
    expect((wrapper.find("#cf-nominal").element as HTMLInputElement).value).toBe("750000");
  });

  it("emit cancel saat tombol batal diklik", async () => {
    const wrapper = mountForm();
    await wrapper.find('[data-testid="cancel-button"]').trigger("click");
    expect(wrapper.emitted("cancel")).toHaveLength(1);
  });
});
