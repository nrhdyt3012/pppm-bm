import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { JENJANG_LIST, JENIS_TAGIHAN_LIST } from "@/constants/menu-constant";
import { Loader2 } from "lucide-react";
import { FormEvent } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormMenu<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
}: {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: "Create" | "Update";
}) {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>{type === "Create" ? "Tambah" : "Edit"} Master Tagihan</DialogTitle>
          <DialogDescription>
            {type === "Create"
              ? "Tambah jenis tagihan baru"
              : "Ubah data jenis tagihan"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4 max-h-[60vh] px-1 overflow-y-auto">
            <FormInput
              form={form}
              name={"namaTagihan" as Path<T>}
              label="Nama Tagihan"
              placeholder="Contoh: SPP Bulanan TK A Reguler"
            />
            <FormSelect
              form={form}
              name={"jenjang" as Path<T>}
              label="Jenjang"
              selectItem={JENJANG_LIST}
            />
            <FormSelect
              form={form}
              name={"jenisTagihan" as Path<T>}
              label="Jenis Tagihan"
              selectItem={JENIS_TAGIHAN_LIST}
            />
            <FormInput
              form={form}
              name={"nominal" as Path<T>}
              label="Nominal (Rp)"
              placeholder="Contoh: 150000"
              type="number"
            />
            <FormInput
              form={form}
              name={"description" as Path<T>}
              label="Keterangan (Opsional)"
              placeholder="Keterangan tambahan"
              type="textarea"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {isLoading ? <Loader2 className="animate-spin" /> : type === "Create" ? "Simpan" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}