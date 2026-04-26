"use client";

import { useState, useEffect, startTransition, useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const INITIAL_STATE = { status: "idle", errors: { _form: [] } };

const BULAN_LIST = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function DialogCreateTagihan({ refetch }: { refetch: () => void }) {
  const supabase = createClient();
  const [selectedSiswa, setSelectedSiswa] = useState<string[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<string>("");
  const [selectedBulan, setSelectedBulan] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedTahun, setSelectedTahun] = useState<string>(new Date().getFullYear().toString());
  const [searchSiswa, setSearchSiswa] = useState("");

  const [state, action, isPending] = useActionState(createTagihanBatch, INITIAL_STATE);

  const { data: siswaList, isLoading: loadingSiswa } = useQuery({
    queryKey: ["siswa-for-tagihan", searchSiswa],
    queryFn: async () => {
      let query = supabase.from("siswa").select("id, namaSiswa, kelas, NIS").eq("status", "aktif").order("kelas").order("namaSiswa");
      if (searchSiswa) query = query.ilike("namaSiswa", `%${searchSiswa}%`);
      const { data, error } = await query;
      if (error) toast.error("Gagal memuat siswa");
      return data || [];
    },
  });

  const { data: masterList, isLoading: loadingMaster } = useQuery({
    queryKey: ["master-tagihan-for-create"],
    queryFn: async () => {
      const { data, error } = await supabase.from("master_tagihan").select("*").order("jenjang").order("namaTagihan");
      if (error) toast.error("Gagal memuat master tagihan");
      return data || [];
    },
  });

  const masterSelected = masterList?.find((m: any) => m.id_masterTagihan?.toString() === selectedMaster);

  const handleSelectAll = (checked: boolean) => {
    setSelectedSiswa(checked ? (siswaList?.map((s: any) => s.id) || []) : []);
  };

  const handleSelectSiswa = (id: string, checked: boolean) => {
    setSelectedSiswa(checked ? [...selectedSiswa, id] : selectedSiswa.filter((s) => s !== id));
  };

  const handleSubmit = () => {
    if (!selectedSiswa.length) { toast.error("Pilih minimal 1 siswa"); return; }
    if (!selectedMaster) { toast.error("Pilih jenis tagihan"); return; }
    if (!selectedBulan || !selectedTahun) { toast.error("Pilih bulan dan tahun tagihan"); return; }

    const formData = new FormData();
    formData.append("siswa_ids", JSON.stringify(selectedSiswa));
    formData.append("master_tagihan_id", selectedMaster);
    formData.append("bulan", selectedBulan);
    formData.append("tahun", selectedTahun);
    startTransition(() => { action(formData); });
  };

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Gagal membuat tagihan", { description: state.errors?._form?.[0] });
    }
    if (state?.status === "success") {
      toast.success(`Berhasil membuat ${selectedSiswa.length} tagihan`);
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
      setSelectedSiswa([]);
      setSelectedMaster("");
    }
  }, [state]);

  // Group siswa by kelas
  const siswaByKelas = useMemo(() => {
    const groups: Record<string, any[]> = {};
    siswaList?.forEach((s: any) => {
      const k = s.kelas || "Lainnya";
      if (!groups[k]) groups[k] = [];
      groups[k].push(s);
    });
    return groups;
  }, [siswaList]);

  function useMemo(fn: () => Record<string, any[]>, deps: any[]) {
    const [val, setVal] = useState<Record<string, any[]>>({});
    useEffect(() => { setVal(fn()); }, deps);
    return val;
  }

  const tahunOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - 1 + i;
    return { value: y.toString(), label: y.toString() };
  });

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Buat Tagihan Siswa</DialogTitle>
        <DialogDescription>Pilih jenis tagihan, periode, dan siswa yang akan ditagih</DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        {/* Periode */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Periode Tagihan</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Bulan</Label>
              <Select value={selectedBulan} onValueChange={setSelectedBulan}>
                <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
                <SelectContent>
                  {BULAN_LIST.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tahun</Label>
              <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun" /></SelectTrigger>
                <SelectContent>
                  {tahunOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Pilih Master Tagihan */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Jenis Tagihan</h3>
          {loadingMaster ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {masterList?.map((master: any) => (
                <div
                  key={master.id_masterTagihan}
                  onClick={() => setSelectedMaster(master.id_masterTagihan?.toString())}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMaster === master.id_masterTagihan?.toString()
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "hover:border-gray-400"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{master.namaTagihan}</p>
                    <p className="text-xs text-muted-foreground">{master.jenjang} · {master.jenisTagihan}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-green-700 dark:text-green-400">
                      {convertIDR(parseFloat(master.nominal || 0))}
                    </span>
                    <Checkbox checked={selectedMaster === master.id_masterTagihan?.toString()} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        {masterSelected && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-4 pb-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nominal per siswa:</span>
                <span className="font-bold text-green-700 dark:text-green-400">
                  {convertIDR(parseFloat(masterSelected.nominal || 0))}
                </span>
              </div>
              {selectedSiswa.length > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Total ({selectedSiswa.length} siswa):</span>
                  <span className="font-bold text-green-700 dark:text-green-400">
                    {convertIDR(parseFloat(masterSelected.nominal || 0) * selectedSiswa.length)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pilih Siswa */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">
              Pilih Siswa <span className="text-muted-foreground font-normal">({selectedSiswa.length} dipilih)</span>
            </h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari siswa..."
                className="w-40 h-8 text-sm"
                onChange={(e) => setSearchSiswa(e.target.value)}
              />
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleSelectAll(selectedSiswa.length === 0)}>
                {selectedSiswa.length === siswaList?.length ? "Batal Semua" : "Pilih Semua"}
              </Button>
            </div>
          </div>

          {loadingSiswa ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="max-h-56 overflow-y-auto border rounded-lg p-2 space-y-3">
              {Object.entries(siswaByKelas).map(([kelas, siswaKelas]) => (
                <div key={kelas}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">{kelas}</p>
                  <div className="space-y-1">
                    {siswaKelas.map((s: any) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleSelectSiswa(s.id, !selectedSiswa.includes(s.id))}
                      >
                        <Checkbox
                          checked={selectedSiswa.includes(s.id)}
                          onCheckedChange={(c) => handleSelectSiswa(s.id, c as boolean)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.namaSiswa}</p>
                          {s.NIS && <p className="text-xs text-muted-foreground">NIS: {s.NIS}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(siswaByKelas).length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">Tidak ada siswa ditemukan</p>
              )}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2 mt-4">
        <DialogClose asChild>
          <Button variant="outline">Batal</Button>
        </DialogClose>
        <Button
          onClick={handleSubmit}
          disabled={isPending || selectedSiswa.length === 0 || !selectedMaster}
          className="bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <><Loader2 className="animate-spin mr-2 h-4 w-4" />Membuat...</>
          ) : (
            `Buat Tagihan (${selectedSiswa.length} Siswa)`
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}