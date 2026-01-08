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

// Mock action - replace with actual import
const createTagihanBatch = async (prevState: any, formData: FormData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { status: "success" };
};

const INITIAL_STATE_TAGIHAN = {
  status: "idle",
  errors: { _form: [] }
};

export default function DialogCreateTagihan({ onClose, refetch }: { onClose: () => void; refetch: () => void }) {
  const supabase = createClient();
  const [selectedSantri, setSelectedSantri] = useState<string[]>([]);
  const [selectedMasterTagihan, setSelectedMasterTagihan] = useState<string>("");
  const [searchSantri, setSearchSantri] = useState("");

  // Fetch daftar santri
  const { data: santriList, isLoading: loadingSantri } = useQuery({
    queryKey: ["santri-list", searchSantri],
    queryFn: async () => {
      const query = supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("role", "santri")
        .order("name");

      if (searchSantri) {
        query.ilike("name", `%${searchSantri}%`);
      }

      const result = await query;
      return result.data || [];
    },
  });

  // Fetch daftar master tagihan
  const { data: masterTagihanList, isLoading: loadingMaster } = useQuery({
    queryKey: ["master-tagihan-list"],
    queryFn: async () => {
      const result = await supabase
        .from("master_tagihan")
        .select("*")
        .order("created_at", { ascending: false });
      return result.data || [];
    },
  });

  const [createState, createAction, isPending] = useActionState(
    createTagihanBatch,
    INITIAL_STATE_TAGIHAN
  );

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
      onClose();
      refetch();
    }
  }, [createState]);

  const selectedMaster = masterTagihanList?.find(
    (m: any) => m.id.toString() === selectedMasterTagihan
  );

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Berikan Tagihan kepada Santri</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Pilih Jenis Tagihan */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pilih Jenis Tagihan</h3>
            {loadingMaster ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {masterTagihanList?.map((master: any) => (
                  <div
                    key={master.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMasterTagihan === master.id.toString()
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedMasterTagihan(master.id.toString())}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{master.periode}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {master.description}
                        </p>
                      </div>
                      <Checkbox
                        checked={selectedMasterTagihan === master.id.toString()}
                        onCheckedChange={() =>
                          setSelectedMasterTagihan(master.id.toString())
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
                <CardTitle>Rincian Tagihan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Uang Makan", value: selectedMaster.uang_makan },
                  { label: "Asrama", value: selectedMaster.asrama },
                  { label: "Kas Pondok", value: selectedMaster.kas_pondok },
                  { label: "Shodaqoh Sukarela", value: selectedMaster.shodaqoh_sukarela },
                  { label: "Jariyah SB", value: selectedMaster.jariyah_sb },
                  { label: "Uang Tahunan", value: selectedMaster.uang_tahunan },
                  { label: "Iuran Kampung", value: selectedMaster.iuran_kampung },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
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
                  className="w-64"
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
                      <p className="font-medium">{santri.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || selectedSantri.length === 0 || !selectedMasterTagihan}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                `Buat Tagihan (${selectedSantri.length} Santri)`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}