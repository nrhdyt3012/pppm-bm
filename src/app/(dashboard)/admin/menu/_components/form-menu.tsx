// src/app/(dashboard)/admin/menu/_components/form-menu.tsx
import FormInput from "@/components/common/form-input";
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
    <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>{type} Tagihan</DialogTitle>
          <DialogDescription>
            {type === "Create"
              ? "Tambah tagihan periode baru"
              : "Ubah data tagihan periode"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4 max-h-[60vh] px-1 overflow-y-auto">
            <FormInput
              form={form}
              name={"periode" as Path<T>}
              label="Periode"
              placeholder="Contoh: Januari 2024"
            />
            <FormInput
              form={form}
              name={"description" as Path<T>}
              label="Keterangan"
              placeholder="Keterangan periode tagihan"
              type="textarea"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name={"uang_makan" as Path<T>}
                label="Uang Makan"
                placeholder="0"
                type="number"
              />
              <FormInput
                form={form}
                name={"asrama" as Path<T>}
                label="Asrama"
                placeholder="0"
                type="number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name={"kas_pondok" as Path<T>}
                label="Kas Pondok"
                placeholder="0"
                type="number"
              />
              <FormInput
                form={form}
                name={"sedekah_sukarela" as Path<T>}
                label="Sedekah Sukarela"
                placeholder="0"
                type="number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name={"aset_jariyah" as Path<T>}
                label="Aset Jariyah"
                placeholder="0"
                type="number"
              />
              <FormInput
                form={form}
                name={"uang_tahunan" as Path<T>}
                label="Uang Tahunan"
                placeholder="0"
                type="number"
              />
            </div>

            <FormInput
              form={form}
              name={"iuran_kampung" as Path<T>}
              label="Iuran Kampung"
              placeholder="0"
              type="number"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              {isLoading ? <Loader2 className="animate-spin" /> : type}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
