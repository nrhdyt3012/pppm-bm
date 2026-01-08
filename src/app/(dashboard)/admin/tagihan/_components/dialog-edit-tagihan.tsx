import { Dialog } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateTagihan } from "../actions";
import { toast } from "sonner";
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
import { MenuForm, menuFormSchema } from "@/validations/menu-validation";
import { INITIAL_STATE_MENU } from "@/constants/menu-constant";
import { Loader2 } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function DialogEditTagihan({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: any;
  open?: boolean;
  handleChangeAction?: (open: boolean) => void;
}) {
  const form = useForm<MenuForm>({
    resolver: zodResolver(menuFormSchema),
  });

  const [updateTagihanState, updateTagihanAction, isPendingUpdateTagihan] =
    useActionState(updateTagihan, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("id", currentData?.id ?? "");

    startTransition(() => {
      updateTagihanAction(formData);
    });
  });

  useEffect(() => {
    if (updateTagihanState?.status === "error") {
      toast.error("Gagal Mengubah Tagihan", {
        description: updateTagihanState.errors?._form?.[0],
      });
    }

    if (updateTagihanState?.status === "success") {
      toast.success("Tagihan Berhasil Diubah");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [updateTagihanState, handleChangeAction, refetch]);

  useEffect(() => {
    if (currentData) {
      form.setValue("periode", currentData.periode);
      form.setValue("description", currentData.description);
      form.setValue("uang_makan", currentData.uang_makan?.toString() || "");
      form.setValue("asrama", currentData.asrama?.toString() || "");
      form.setValue("kas_pondok", currentData.kas_pondok?.toString() || "");
      form.setValue(
        "shodaqoh_sukarela",
        currentData.shodaqoh_sukarela?.toString() || ""
      );
      form.setValue("jariyah_sb", currentData.jariyah_sb?.toString() || "");
      form.setValue("uang_tahunan", currentData.uang_tahunan?.toString() || "");
      form.setValue("iuran_kampung", currentData.iuran_kampung?.toString() || "");
    }
  }, [currentData, form]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Edit Tagihan</DialogTitle>
            <DialogDescription>
              Ubah data tagihan periode
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4 max-h-[60vh] px-1 overflow-y-auto">
              <FormInput
                form={form}
                name={"periode" as Path<MenuForm>}
                label="Periode"
                placeholder="Contoh: Januari 2024"
              />
              <FormInput
                form={form}
                name={"description" as Path<MenuForm>}
                label="Keterangan"
                placeholder="Keterangan periode tagihan"
                type="textarea"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  form={form}
                  name={"uang_makan" as Path<MenuForm>}
                  label="Uang Makan"
                  placeholder="0"
                  type="number"
                />
                <FormInput
                  form={form}
                  name={"asrama" as Path<MenuForm>}
                  label="Asrama"
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  form={form}
                  name={"kas_pondok" as Path<MenuForm>}
                  label="Kas Pondok"
                  placeholder="0"
                  type="number"
                />
                <FormInput
                  form={form}
                  name={"shodaqoh_sukarela" as Path<MenuForm>}
                  label="Shodaqoh Sukarela"
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  form={form}
                  name={"jariyah_sb" as Path<MenuForm>}
                  label="Jariyah SB"
                  placeholder="0"
                  type="number"
                />
                <FormInput
                  form={form}
                  name={"uang_tahunan" as Path<MenuForm>}
                  label="Uang Tahunan"
                  placeholder="0"
                  type="number"
                />
              </div>

              <FormInput
                form={form}
                name={"iuran_kampung" as Path<MenuForm>}
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
                {isPendingUpdateTagihan ? <Loader2 className="animate-spin" /> : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}