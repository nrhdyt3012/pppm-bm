// src/app/(dashboard)/admin/tagihan/_components/dialog-edit-tagihan-santri.tsx
import { Dialog } from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateTagihanSantri } from "../actions";
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
import z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { convertIDR } from "@/lib/utils";

const editTagihanSchema = z.object({
  id_master_tagihan: z.string().min(1, "Periode tagihan wajib diisi"),
  status_pembayaran: z.string().min(1, "Status pembayaran wajib diisi"),
});

type EditTagihanForm = z.infer<typeof editTagihanSchema>;

const INITIAL_STATE = {
  status: "idle",
  errors: {
    id_master_tagihan: [],
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
  const supabase = createClient();
  const form = useForm<EditTagihanForm>({
    resolver: zodResolver(editTagihanSchema),
  });

  const [updateState, updateAction, isPending] = useActionState(
    updateTagihanSantri,
    INITIAL_STATE
  );

  // Fetch master tagihan list
  const { data: masterTagihanList } = useQuery({
    queryKey: ["master-tagihan-list"],
    queryFn: async () => {
      const result = await supabase
        .from("master_tagihan")
        .select("*")
        .order("created_at", { ascending: false });
      return result.data || [];
    },
  });

  const [selectedMaster, setSelectedMaster] = useState<any>(null);

  // Update nominal otomatis saat periode berubah
  useEffect(() => {
    const masterId = form.watch("id_master_tagihan");
    if (masterId && masterTagihanList) {
      const master = masterTagihanList.find(
        (m: any) => m.id.toString() === masterId
      );
      if (master) {
        setSelectedMaster(master);
      }
    }
  }, [form.watch("id_master_tagihan"), masterTagihanList]);

  const onSubmit = form.handleSubmit((data) => {
    // Hitung jumlah tagihan otomatis dari master
    const master = masterTagihanList?.find(
      (m: any) => m.id.toString() === data.id_master_tagihan
    );

    const jumlahTagihan = master
      ? (master.uang_makan || 0) +
        (master.asrama || 0) +
        (master.kas_pondok || 0) +
        (master.shodaqoh_sukarela || 0) +
        (master.jariyah_sb || 0) +
        (master.uang_tahunan || 0) +
        (master.iuran_kampung || 0)
      : 0;

    const formData = new FormData();
    formData.append("id_tagihan_santri", currentData?.id_tagihan_santri ?? "");
    formData.append("id_master_tagihan", data.id_master_tagihan);
    formData.append("jumlah_tagihan", jumlahTagihan.toString());
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
    if (currentData && masterTagihanList) {
      form.setValue(
        "id_master_tagihan",
        currentData.id_master_tagihan?.toString() || ""
      );
      form.setValue(
        "status_pembayaran",
        currentData.status_pembayaran || "BELUM BAYAR"
      );

      const master = masterTagihanList.find(
        (m: any) => m.id === currentData.id_master_tagihan
      );
      if (master) {
        setSelectedMaster(master);
      }
    }
  }, [currentData, masterTagihanList, form]);

  // Hitung total nominal dari master yang dipilih
  const totalNominal = selectedMaster
    ? (selectedMaster.uang_makan || 0) +
      (selectedMaster.asrama || 0) +
      (selectedMaster.kas_pondok || 0) +
      (selectedMaster.shodaqoh_sukarela || 0) +
      (selectedMaster.jariyah_sb || 0) +
      (selectedMaster.uang_tahunan || 0) +
      (selectedMaster.iuran_kampung || 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle>Edit Tagihan Santri</DialogTitle>
            <DialogDescription>
              Ubah data tagihan untuk {currentData?.santri?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4 px-1">
              {/* Info Tagihan - READ ONLY */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Tagihan:</span>
                  <span className="font-mono font-medium">
                    {currentData?.id_tagihan_santri}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nama Santri:</span>
                  <span className="font-medium">
                    {currentData?.santri?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Jumlah Tagihan Saat Ini:
                  </span>
                  <span className="font-semibold text-teal-600">
                    {convertIDR(parseFloat(currentData?.jumlah_tagihan) || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tanggal Dibuat:</span>
                  <span>
                    {new Date(currentData?.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* Pilih Periode - EDITABLE */}
              <div className="space-y-2">
                <FormSelect
                  form={form}
                  name="id_master_tagihan"
                  label="Periode Tagihan"
                  selectItem={
                    masterTagihanList?.map((m: any) => ({
                      value: m.id.toString(),
                      label: `${m.periode} - ${m.description}`,
                    })) || []
                  }
                />
              </div>

              {/* Preview Rincian Periode Baru */}
              {selectedMaster && (
                <div className="p-4 border rounded-lg space-y-2 bg-blue-50 dark:bg-blue-950">
                  <p className="text-sm font-semibold">Rincian Tagihan Baru:</p>
                  <div className="text-xs space-y-1">
                    {[
                      { label: "Uang Makan", value: selectedMaster.uang_makan },
                      { label: "Asrama", value: selectedMaster.asrama },
                      { label: "Kas Pondok", value: selectedMaster.kas_pondok },
                      {
                        label: "Shodaqoh Sukarela",
                        value: selectedMaster.shodaqoh_sukarela,
                      },
                      { label: "Jariyah SB", value: selectedMaster.jariyah_sb },
                      {
                        label: "Uang Tahunan",
                        value: selectedMaster.uang_tahunan,
                      },
                      {
                        label: "Iuran Kampung",
                        value: selectedMaster.iuran_kampung,
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span>{item.label}:</span>
                        <span className="font-medium">
                          {convertIDR(item.value || 0)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-1 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-teal-600">
                        {convertIDR(totalNominal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Pembayaran - EDITABLE */}
              <FormSelect
                form={form}
                name="status_pembayaran"
                label="Status Pembayaran"
                selectItem={STATUS_OPTIONS}
              />

              {/* Warning untuk pembayaran offline */}
              {form.watch("status_pembayaran") === "LUNAS" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      Perhatian!
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Status &ldquo;LUNAS&rdquo; hanya untuk pembayaran offline.
                      Pastikan pembayaran sudah diterima.
                    </p>
                  </div>
                </div>
              )}
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
