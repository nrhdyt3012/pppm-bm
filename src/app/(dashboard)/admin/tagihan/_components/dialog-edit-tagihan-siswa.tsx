"use client";

import { Dialog } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateTagihanSiswa } from "../actions";
import { toast } from "sonner";
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
import { Loader2, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { convertIDR } from "@/lib/utils";

const schema = z.object({
  statuspembayaran: z.string().min(1, "Status wajib diisi"),
});

type FormType = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "BELUM BAYAR", label: "Belum Bayar" },
  { value: "LUNAS", label: "Lunas (Pembayaran Offline)" },
  { value: "KADALUARSA", label: "Kadaluarsa" },
];

const INITIAL_STATE = { status: "idle", errors: { _form: [] } };

export default function DialogEditTagihanSiswa({
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
  const form = useForm<FormType>({ resolver: zodResolver(schema) });
  const [state, action, isPending] = useActionState(updateTagihanSiswa, INITIAL_STATE);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    formData.append("idtagihansiswa", currentData?.idtagihansiswa?.toString() ?? "");
    formData.append("statuspembayaran", data.statuspembayaran);
    startTransition(() => { action(formData); });
  });

  useEffect(() => {
    if (state?.status === "error") toast.error("Gagal Mengubah", { description: state.errors?._form?.[0] });
    if (state?.status === "success") {
      toast.success("Tagihan berhasil diubah");
      handleChangeAction?.(false);
      refetch();
    }
  }, [state]);

  useEffect(() => {
    if (currentData) {
      form.setValue("statuspembayaran", currentData.statuspembayaran || "BELUM BAYAR");
    }
  }, [currentData]);

  const statusVal = form.watch("statuspembayaran");

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Edit Tagihan Siswa</DialogTitle>
            <DialogDescription>
              Ubah status tagihan untuk {currentData?.siswa?.namasiswa || "siswa"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Info tagihan */}
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Tagihan:</span>
                <span className="font-mono">#{currentData?.idtagihansiswa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Siswa:</span>
                <span className="font-medium">{currentData?.siswa?.namasiswa || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tagihan:</span>
                <span>{currentData?.master_tagihan?.namatagihan || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Periode:</span>
                <span>{currentData?.bulan}/{currentData?.tahun}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nominal:</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {convertIDR(parseFloat(currentData?.jumlahtagihan) || 0)}
                </span>
              </div>
            </div>

            <FormSelect
              form={form}
              name="statuspembayaran"
              label="Status Pembayaran"
              selectItem={STATUS_OPTIONS}
            />

            {statusVal === "LUNAS" && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Status <strong>LUNAS</strong> digunakan untuk pembayaran offline. Pastikan pembayaran sudah diterima secara fisik.
                </p>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {isPending ? <Loader2 className="animate-spin" /> : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}