// src/app/(dashboard)/admin/tagihan/_components/dialog-edit-tagihan.tsx
import { Dialog } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateTagihanSantri } from "../actions";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";
import z from "zod";

const editTagihanSchema = z.object({
  jumlah_tagihan: z.string().min(1, "Jumlah tagihan wajib diisi"),
  status_pembayaran: z.string().min(1, "Status pembayaran wajib diisi"),
});

type EditTagihanForm = z.infer<typeof editTagihanSchema>;

const INITIAL_STATE = {
  status: "idle",
  errors: {
    jumlah_tagihan: [],
    status_pembayaran: [],
    _form: [],
  },
};

const STATUS_OPTIONS = [
  { value: "BELUM BAYAR", label: "Belum Bayar" },
  { value: "LUNAS", label: "Lunas" },
  { value: "KADALUARSA", label: "Kadaluarsa" },
];

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
  const form = useForm<EditTagihanForm>({
    resolver: zodResolver(editTagihanSchema),
  });

  const [updateState, updateAction, isPending] = useActionState(
    updateTagihanSantri,
    INITIAL_STATE
  );

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    formData.append("id_tagihan_santri", currentData?.id_tagihan_santri ?? "");
    formData.append("jumlah_tagihan", data.jumlah_tagihan);
    formData.append("status_pembayaran", data.status_pembayaran);

    startTransition(() => {
      updateAction(formData);
    });
  });

  useEffect(() => {
    if (updateState?.status === "error") {
      toast.error("Gagal Mengubah Tagihan", {
        description: updateState.errors?._form?.[0],
      });
    }

    if (updateState?.status === "success") {
      toast.success("Tagihan Berhasil Diubah");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [updateState, handleChangeAction, refetch]);

  useEffect(() => {
    if (currentData) {
      form.setValue(
        "jumlah_tagihan",
        currentData.jumlah_tagihan?.toString() || ""
      );
      form.setValue(
        "status_pembayaran",
        currentData.status_pembayaran || "BELUM BAYAR"
      );
    }
  }, [currentData, form]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Edit Tagihan Santri</DialogTitle>
            <DialogDescription>
              Ubah data tagihan untuk {currentData?.santri?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4 px-1">
              {/* Info Santri */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Tagihan:</span>
                  <span className="font-mono font-medium">
                    #{currentData?.id_tagihan_santri}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nama Santri:</span>
                  <span className="font-medium">
                    {currentData?.santri?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Periode:</span>
                  <span className="font-medium">
                    {currentData?.master_tagihan?.periode}
                  </span>
                </div>
              </div>

              <FormInput
                form={form}
                name="jumlah_tagihan"
                label="Jumlah Tagihan (Rp)"
                placeholder="0"
                type="number"
              />

              <FormSelect
                form={form}
                name="status_pembayaran"
                label="Status Pembayaran"
                selectItem={STATUS_OPTIONS}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                {isPending ? <Loader2 className="animate-spin" /> : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
