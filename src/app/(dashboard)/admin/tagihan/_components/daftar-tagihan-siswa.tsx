"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { convertIDR, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FileText, CheckCircle2, AlertCircle, Plus, Pencil, Trash2, Banknote } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import DialogCreateTagihan from "./dialog-create-tagihan";
import DialogEditTagihanSiswa from "./dialog-edit-tagihan-siswa";
import DialogDeleteTagihanSiswa from "./dialog-delete-tagihan-siswa";
import DialogBayarManual from "./dialog-bayar-manual";

export default function DaftarTagihanSiswa() {
  const supabase = createClient();
  const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["tagihan-admin-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("tagihan_siswa").select("*", { count: "exact", head: true });
      const { count: belumBayar } = await supabase.from("tagihan_siswa").select("*", { count: "exact", head: true }).eq("statuspembayaran", "BELUM BAYAR");
      const { count: lunas } = await supabase.from("tagihan_siswa").select("*", { count: "exact", head: true }).eq("statuspembayaran", "LUNAS");
      const { data: nominalData } = await supabase.from("tagihan_siswa").select("jumlahtagihan");
      const totalNominal = nominalData?.reduce((s: number, i: any) => s + parseFloat(i.jumlahtagihan || 0), 0) || 0;
      return { total: total || 0, belumBayar: belumBayar || 0, lunas: lunas || 0, totalNominal };
    },
  });

  const { data: tagihanList, isLoading, refetch } = useQuery({
    queryKey: ["tagihan-siswa-list", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from("tagihan_siswa")
        .select(
          "*, siswa!idsiswa(id, namasiswa, kelas), master_tagihan!idmastertagihan(id_mastertagihan, namatagihan, jenjang)",
          { count: "exact" }
        )
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("createdat", { ascending: false });

      if (error) toast.error("Gagal memuat tagihan", { description: error.message });
      return { data: data || [], count: count || 0 };
    },
  });

  const [selectedAction, setSelectedAction] = useState<{ data: any; type: "edit" | "delete" | "bayar" } | null>(null);
  const handleChangeAction = (open: boolean) => { if (!open) setSelectedAction(null); };

  // Setup realtime subscription untuk auto-refresh
  useEffect(() => {
    const channel = supabase
      .channel("tagihan_siswa-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tagihan_siswa" },
        () => {
          // Refetch data ketika ada perubahan
          refetch();
          refetchStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refetch, refetchStats]);

  const filteredData = useMemo(() => {
    return (tagihanList?.data || []).map((item: any, index: number) => [
      currentLimit * (currentPage - 1) + index + 1,
      <span key={`id-${item.idtagihansiswa}`} className="font-mono text-sm">#{item.idtagihansiswa}</span>,
      <div key={`siswa-${item.idtagihansiswa}`}>
        <p className="font-medium">{item.siswa?.namasiswa || "-"}</p>
        <p className="text-xs text-muted-foreground">{item.siswa?.kelas || ""}</p>
      </div>,
      <div key={`tagihan-${item.idtagihansiswa}`}>
        <p className="font-semibold">{item.master_tagihan?.namatagihan || "-"}</p>
        <p className="text-xs text-muted-foreground">{item.bulan}/{item.tahun} · {item.master_tagihan?.jenjang || ""}</p>
      </div>,
      <span key={`nominal-${item.idtagihansiswa}`} className="font-semibold">
        {convertIDR(parseFloat(item.jumlahtagihan) || 0)}
      </span>,
      <span key={`sisa-${item.idtagihansiswa}`} className={cn("font-semibold", parseFloat(item.sisa || 0) === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
        {convertIDR(parseFloat(item.sisa) || 0)}
      </span>,
      new Date(item.createdat).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      <DropdownAction
        key={`act-${item.idtagihansiswa}`}
        menu={[
          {
            label: <span className="flex items-center gap-2"><Banknote className="w-4 h-4 text-green-600" />Bayar Manual</span>,
            action: () => setSelectedAction({ data: item, type: "bayar" })
          },
          {
            label: <span className="flex items-center gap-2"><Pencil className="w-4 h-4" />Edit Status</span>,
            action: () => setSelectedAction({ data: item, type: "edit" })
          },
          {
            label: <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-400" />Hapus</span>,
            variant: "destructive",
            action: () => setSelectedAction({ data: item, type: "delete" })
          },
        ]}
      />,
    ]);
  }, [tagihanList, currentLimit, currentPage]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold">Tagihan Siswa</h1>
          <p className="text-sm text-muted-foreground">Kelola tagihan pembayaran siswa</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Cari siswa atau periode..." onChange={(e) => handleChangeSearch(e.target.value)} className="max-w-sm" />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />Buat Tagihan
              </Button>
            </DialogTrigger>
            <DialogCreateTagihan refetch={refetch} />
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Tagihan</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Belum Bayar</CardTitle><AlertCircle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats?.belumBayar || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Lunas</CardTitle><CheckCircle2 className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats?.lunas || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Nominal</CardTitle></CardHeader><CardContent><div className="text-lg font-bold text-teal-600">{convertIDR(stats?.totalNominal || 0)}</div></CardContent></Card>
      </div>

      <DataTable
        header={["No", "ID", "Nama Siswa", "Tagihan", "Nominal", "Sisa Tagihan", "Tanggal", "Aksi"]}
        data={filteredData}
        isLoading={isLoading}
        totalPages={tagihanList?.count ? Math.ceil(tagihanList.count / currentLimit) : 0}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />

      <DialogBayarManual
        open={selectedAction?.type === "bayar"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogEditTagihanSiswa
        open={selectedAction?.type === "edit"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteTagihanSiswa
        open={selectedAction?.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}