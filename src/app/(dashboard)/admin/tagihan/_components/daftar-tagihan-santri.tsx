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
import { FileText, CheckCircle2, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DialogCreateTagihan from "./dialog-create-tagihan";
import DialogEditTagihanSiswa from "./dialog-edit-tagihan-siswa";
import DialogDeleteTagihanSiswa from "./dialog-delete-tagihan-siswa";

export default function DaftarTagihanSiswa() {
  const supabase = createClient();
  const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

  const { data: stats } = useQuery({
    queryKey: ["tagihan-admin-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("tagihan_siswa").select("*", { count: "exact", head: true });
      const { count: belumBayar } = await supabase.from("tagihan_siswa").select("*", { count: "exact", head: true }).eq("statusPembayaran", "BELUM BAYAR");
      const { count: lunas } = await supabase.from("tagihan_siswa").select("*", { count: "exact", head: true }).eq("statusPembayaran", "LUNAS");
      const { data: nominalData } = await supabase.from("tagihan_siswa").select("jumlahTagihan");
      const totalNominal = nominalData?.reduce((s: number, i: any) => s + parseFloat(i.jumlahTagihan || 0), 0) || 0;
      return { total: total || 0, belumBayar: belumBayar || 0, lunas: lunas || 0, totalNominal };
    },
  });

  const { data: tagihanList, isLoading, refetch } = useQuery({
    queryKey: ["tagihan-siswa-list", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from("tagihan_siswa")
        .select("*, siswa!idSiswa(id, namaSiswa, kelas), master_tagihan!idMasterTagihan(id_masterTagihan, namaTagihan, jenjang)", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("createdAt", { ascending: false });

      if (error) toast.error("Gagal memuat tagihan", { description: error.message });
      return { data: data || [], count: count || 0 };
    },
  });

  const [selectedAction, setSelectedAction] = useState<{ data: any; type: "edit" | "delete" } | null>(null);
  const handleChangeAction = (open: boolean) => { if (!open) setSelectedAction(null); };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      "BELUM BAYAR": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      "LUNAS": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "KADALUARSA": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config[status] || config["BELUM BAYAR"])}>
        {status}
      </span>
    );
  };

  const filteredData = useMemo(() => {
    return (tagihanList?.data || []).map((item: any, index: number) => [
      currentLimit * (currentPage - 1) + index + 1,
      <span key={`id-${item.idTagihanSiswa}`} className="font-mono text-sm">#{item.idTagihanSiswa}</span>,
      <div key={`siswa-${item.idTagihanSiswa}`}>
        <p className="font-medium">{item.siswa?.namaSiswa || "-"}</p>
        <p className="text-xs text-muted-foreground">{item.siswa?.kelas || ""}</p>
      </div>,
      <div key={`tagihan-${item.idTagihanSiswa}`}>
        <p className="font-semibold">{item.master_tagihan?.namaTagihan || "-"}</p>
        <p className="text-xs text-muted-foreground">{item.bulan}/{item.tahun} · {item.master_tagihan?.jenjang || ""}</p>
      </div>,
      <span key={`nominal-${item.idTagihanSiswa}`} className="font-semibold">
        {convertIDR(parseFloat(item.jumlahTagihan) || 0)}
      </span>,
      getStatusBadge(item.statusPembayaran),
      new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      <DropdownAction
        key={`act-${item.idTagihanSiswa}`}
        menu={[
          { label: <span className="flex items-center gap-2"><Pencil className="w-4 h-4" />Edit</span>, action: () => setSelectedAction({ data: item, type: "edit" }) },
          { label: <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-400" />Hapus</span>, variant: "destructive", action: () => setSelectedAction({ data: item, type: "delete" }) },
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
        header={["No", "ID", "Nama Siswa", "Tagihan", "Nominal", "Status", "Tanggal", "Aksi"]}
        data={filteredData}
        isLoading={isLoading}
        totalPages={tagihanList?.count ? Math.ceil(tagihanList.count / currentLimit) : 0}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
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