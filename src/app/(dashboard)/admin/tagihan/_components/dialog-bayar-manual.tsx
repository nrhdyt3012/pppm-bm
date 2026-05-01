"use client";

import { Dialog } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { bayarTagihanManual } from "../actions";
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
import { Loader2, Banknote, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { convertIDR } from "@/lib/utils";

const schema = z.object({
  jumlahbayar: z.string().min(1, "Jumlah bayar wajib diisi"),
});

type FormType = z.infer<typeof schema>;

export default function DialogBayarManual({
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
  const [isPending, setIsPending] = useState(false);

  const onSubmit = form.handleSubmit(async (data) => {
    const jumlahBayar = parseFloat(data.jumlahbayar);
    const sisaTagihan = parseFloat(currentData?.sisa || currentData?.jumlahtagihan || "0");

    if (jumlahBayar > sisaTagihan) {
      toast.error("Jumlah bayar melebihi sisa tagihan");
      return;
    }

    try {
      setIsPending(true);
      const formData = new FormData();
      formData.append("idtagihansiswa", currentData?.idtagihansiswa?.toString() ?? "");
      formData.append("jumlahbayar", data.jumlahbayar);
      
      const state = await bayarTagihanManual({}, formData);
      
      if (state?.status === "error") {
        toast.error("Gagal Menyimpan Pembayaran", { description: state.errors?._form?.[0] });
      } else if (state?.status === "success") {
        const statusBaru = state.data?.statusbaru;
        const sisaBaru = state.data?.sisatagihan ?? 0;
        
        if (statusBaru === "LUNAS") {
          toast.success("Pembayaran berhasil! Tagihan sudah LUNAS.");
        } else {
          toast.success(`Pembayaran berhasil! Sisa tagihan: ${convertIDR(sisaBaru)}`);
        }
        
        form.reset();
        handleChangeAction?.(false);
        refetch();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan", { description: String(error) });
    } finally {
      setIsPending(false);
    }
  });

  useEffect(() => {
    if (currentData && open) {
      form.reset({ jumlahbayar: "" });
    }
  }, [currentData, open]);

  const sisaTagihan = parseFloat(currentData?.sisa || currentData?.jumlahtagihan || "0");
  const jumlahBayarVal = form.watch("jumlahbayar");
  const jumlahBayarNum = parseFloat(jumlahBayarVal || "0");
  const sisaSetelahBayar = sisaTagihan - jumlahBayarNum;

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              Bayar Tagihan (Cash/Manual)
            </DialogTitle>
            <DialogDescription>
              Input jumlah pembayaran yang diterima secara tunai
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
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total Tagihan:</span>
                <span className="text-blue-700 dark:text-blue-400">
                  {convertIDR(parseFloat(currentData?.jumlahtagihan) || 0)}
                </span>
              </div>
              {currentData?.jumlahterbayar > 0 && (
                <div className="flex justify-between text-green-700 dark:text-green-400">
                  <span>Sudah Dibayar:</span>
                  <span className="font-semibold">
                    {convertIDR(parseFloat(currentData?.jumlahterbayar) || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold text-red-700 dark:text-red-400">
                <span>Sisa Tagihan:</span>
                <span className="text-lg">
                  {convertIDR(sisaTagihan)}
                </span>
              </div>
            </div>

            <FormInput
              form={form}
              name="jumlahbayar"
              label="Jumlah Dibayarkan (Rp)"
              placeholder="Contoh: 50000"
              type="number"
            />

            {/* Preview sisa setelah bayar */}
            {jumlahBayarNum > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sisa Setelah Bayar:</span>
                  <span className="font-bold text-green-700 dark:text-green-400">
                    {sisaSetelahBayar <= 0 ? "LUNAS ✓" : convertIDR(sisaSetelahBayar)}
                  </span>
                </div>
              </div>
            )}

            {jumlahBayarNum > sisaTagihan && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Jumlah pembayaran <strong>melebihi sisa tagihan</strong>. Maksimal yang bisa dibayar: {convertIDR(sisaTagihan)}
                </p>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>Batal</Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={isPending || jumlahBayarNum <= 0 || jumlahBayarNum > sisaTagihan}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Banknote className="w-4 h-4 mr-2" />
                    Simpan Pembayaran
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}