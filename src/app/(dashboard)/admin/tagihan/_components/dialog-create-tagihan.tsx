// src/app/(dashboard)/admin/tagihan/_components/dialog-create-tagihan.tsx
// VERSI YANG SUDAH DIPERBAIKI
import { useState, useEffect, startTransition, useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { convertIDR } from "@/lib/utils";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTagihanBatch } from "../actions";

type TagihanFormState = {
  status: "idle" | "error" | "success";
  errors: {
    _form: string[];
  };
  data?: any;
};

const INITIAL_STATE_TAGIHAN: TagihanFormState = {
  status: "idle",
  errors: { _form: [] },
};

export default function DialogCreateTagihan({ 
  refetch 
}: { 
  refetch: () => void;
}) {
  const supabase = createClient();
  const [selectedSantri, setSelectedSantri] = useState<string[]>([]);
  const [selectedMasterTagihan, setSelectedMasterTagihan] = useState<string>("");
  const [searchSantri, setSearchSantri] = useState("");

  // DIPERBAIKI: useActionState tanpa argument pada createTagihanBatch
  const [createState, createAction, isPending] = useActionState(
    createTagihanBatch,
    INITIAL_STATE_TAGIHAN
  );

  // DIPERBAIKI: Fetch daftar santri dari tabel santri
  const { data: santriList, isLoading: loadingSantri } = useQuery({
    queryKey: ["santri-list-create", searchSantri],
    queryFn: async () => {
      let query = supabase
        .from("santri")
        .select("id, nama")
        .order("nama");

      if (searchSantri) {
        query = query.ilike("nama", `%${searchSantri}%`);
      }

      const result = await query;
      
      if (result.error) {
        console.error("Error fetching santri:", result.error);
        toast.error("Gagal memuat daftar santri");
        return [];
      }
      
      return result.data || [];
    },
  });

  // DIPERBAIKI: Fetch daftar master tagihan dengan nama kolom yang benar
  const { data: masterTagihanList, isLoading: loadingMaster } = useQuery({
    queryKey: ["master-tagihan-list-create"],
    queryFn: async () => {
      const result = await supabase
        .from("master_tagihan")
        .select("*")
        .order("createdAt", { ascending: false });
      
      if (result.error) {
        console.error("Error fetching master tagihan:", result.error);
        toast.error("Gagal memuat daftar tagihan");
        return [];
      }
      
      return result.data || [];
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSantri(santriList?.map((s: any) => s.id) || []);
    } else {
      setSelectedSantri([]);
    }
  };

  const handleSelectSantri = (santriId: string, checked: boolean) => {
    if (checked) {
      setSelectedSantri([...selectedSantri, santriId]);
    } else {
      setSelectedSantri(selectedSantri.filter((id) => id !== santriId));
    }
  };

  const handleSubmit = () => {
    if (selectedSantri.length === 0) {
      toast.error("Pilih minimal 1 santri");
      return;
    }
    if (!selectedMasterTagihan) {
      toast.error("Pilih jenis tagihan");
      return;
    }

    const formData = new FormData();
    formData.append("santri_ids", JSON.stringify(selectedSantri));
    formData.append("master_tagihan_id", selectedMasterTagihan);

    startTransition(() => {
      createAction(formData);
    });
  };

  useEffect(() => {
    if (createState?.status === "error") {
      toast.error("Gagal membuat tagihan", {
        description: createState.errors?._form?.[0],
      });
    }

    if (createState?.status === "success") {
      toast.success(`Berhasil membuat ${selectedSantri.length} tagihan`);
      // Tutup dialog
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
      setSelectedSantri([]);
      setSelectedMasterTagihan("");
    }
  }, [createState, selectedSantri.length, refetch]);

  // DIPERBAIKI: Gunakan id_masterTagihan untuk mencari
  const selectedMaster = masterTagihanList?.find(
    (m: any) => m.id_masterTagihan?.toString() === selectedMasterTagihan
  );

  const totalNominal = selectedMaster
    ? (selectedMaster.uang_makan || 0) +
      (selectedMaster.asrama || 0) +
      (selectedMaster.kas_pondok || 0) +
      (selectedMaster.sedekah_sukarela || 0) +
      (selectedMaster.aset_jariyah || 0) +
      (selectedMaster.uang_tahunan || 0) +
      (selectedMaster.iuran_kampung || 0)
    : 0;

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Berikan Tagihan kepada Santri</DialogTitle>
        <DialogDescription>
          Pilih santri dan jenis tagihan yang akan diberikan
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Pilih Jenis Tagihan */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Pilih Jenis Tagihan</h3>
          {loadingMaster ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {masterTagihanList?.map((master: any) => (
                <div
                  key={master.id_masterTagihan}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMasterTagihan === master.id_masterTagihan?.toString()
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedMasterTagihan(master.id_masterTagihan?.toString() || "")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{master.periode}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {master.description}
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedMasterTagihan === master.id_masterTagihan?.toString()}
                      onCheckedChange={() =>
                        setSelectedMasterTagihan(master.id_masterTagihan?.toString() || "")
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Tagihan */}
        {selectedMaster && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rincian Tagihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: "Uang Makan", value: selectedMaster.uang_makan },
                { label: "Asrama", value: selectedMaster.asrama },
                { label: "Kas Pondok", value: selectedMaster.kas_pondok },
                { label: "Sedekah Sukarela", value: selectedMaster.sedekah_sukarela },
                { label: "Aset Jariyah", value: selectedMaster.aset_jariyah },
                { label: "Uang Tahunan", value: selectedMaster.uang_tahunan },
                { label: "Iuran Kampung", value: selectedMaster.iuran_kampung },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}:</span>
                  <span className="font-medium">{convertIDR(item.value || 0)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-teal-600">{convertIDR(totalNominal)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pilih Santri */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Pilih Santri ({selectedSantri.length} dipilih)
            </h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari santri..."
                className="w-48"
                onChange={(e) => setSearchSantri(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(selectedSantri.length === 0)}
              >
                {selectedSantri.length === santriList?.length
                  ? "Batal Semua"
                  : "Pilih Semua"}
              </Button>
            </div>
          </div>

          {loadingSantri ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
              {santriList?.map((santri: any) => (
                <div
                  key={santri.id}
                  className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Checkbox
                    checked={selectedSantri.includes(santri.id)}
                    onCheckedChange={(checked) =>
                      handleSelectSantri(santri.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{santri.nama}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2 mt-6">
        <DialogClose asChild>
          <Button variant="outline">Batal</Button>
        </DialogClose>
        <Button
          onClick={handleSubmit}
          disabled={isPending || selectedSantri.length === 0 || !selectedMasterTagihan}
          className="bg-teal-500 hover:bg-teal-600"
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            `Buat Tagihan (${selectedSantri.length} Santri)`
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}