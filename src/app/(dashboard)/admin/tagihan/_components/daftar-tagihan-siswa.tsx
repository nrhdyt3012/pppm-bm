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
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Banknote,
  Lock,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import DialogCreateTagihan from "./dialog-create-tagihan";
import DialogDeleteTagihanSiswa from "./dialog-delete-tagihan-siswa";
import DialogBayarManual from "./dialog-bayar-manual";

// Helper: cek permission berdasarkan riwayat pembayaran
function getTagihanPermissions(item: any) {
  const pembayaran: any[] = item.pembayaran ?? [];

  const hasMidtrans = pembayaran.some(
    (p) => p.statuspembayaran === "SUCCESS" && p.metodepembayaran !== "cash"
  );
  const hasAnySuccess = pembayaran.some((p) => p.statuspembayaran === "SUCCESS");

  return {
    // Boleh bayar manual jika belum ada pembayaran Midtrans dan belum LUNAS
    canBayarManual: !hasMidtrans && item.statuspembayaran !== "LUNAS",
    // Boleh delete hanya jika belum ada pembayaran sama sekali
    canDelete: !hasAnySuccess,
    hasMidtrans,
  };
}

export default function DaftarTagihanSiswa() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  // Stats ringkasan
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["tagihan-admin-stats"],
    queryFn: async () => {
      const { count: total } = await supabase
        .from("tagihan_siswa")
        .select("*", { count: "exact", head: true });

      const { count: belumBayar } = await supabase
        .from("tagihan_siswa")
        .select("*", { count: "exact", head: true })
        .eq("statuspembayaran", "BELUM BAYAR");

      const { count: lunas } = await supabase
        .from("tagihan_siswa")
        .select("*", { count: "exact", head: true })
        .eq("statuspembayaran", "LUNAS");

      return {
        total: total || 0,
        belumBayar: belumBayar || 0,
        lunas: lunas || 0,
      };
    },
  });

  // List tagihan dengan info pembayaran untuk permission check
  const { data: tagihanList, isLoading, refetch } = useQuery({
    queryKey: ["tagihan-siswa-list", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from("tagihan_siswa")
        .select(
          `*,
          siswa!idsiswa(id, namasiswa, kelas),
          master_tagihan!idmastertagihan(id_mastertagihan, namatagihan, jenjang),
          pembayaran(idpembayaran, statuspembayaran, metodepembayaran)`,
          { count: "exact" }
        )
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1
        )
        .order("createdat", { ascending: false });

      if (error) {
        toast.error("Gagal memuat tagihan", { description: error.message });
      }
      return { data: data || [], count: count || 0 };
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: any;
    type: "bayar" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  // Realtime subscription untuk auto-refresh
  useEffect(() => {
    const channel = supabase
      .channel("tagihan_siswa-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tagihan_siswa" },
        () => {
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
    return (tagihanList?.data || []).map((item: any, index: number) => {
      const perms = getTagihanPermissions(item);

      return [
        currentLimit * (currentPage - 1) + index + 1,

        // ID
        <span key={`id-${item.idtagihansiswa}`} className="font-mono text-sm">
          #{item.idtagihansiswa}
        </span>,

        // Nama Siswa
        <div key={`siswa-${item.idtagihansiswa}`}>
          <p className="font-medium">{item.siswa?.namasiswa || "-"}</p>
          <p className="text-xs text-muted-foreground">
            {item.siswa?.kelas || ""}
          </p>
        </div>,

        // Tagihan
        <div key={`tagihan-${item.idtagihansiswa}`}>
          <p className="font-semibold">
            {item.master_tagihan?.namatagihan || "-"}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.bulan}/{item.tahun} · {item.master_tagihan?.jenjang || ""}
          </p>
        </div>,

        // Nominal
        <span key={`nominal-${item.idtagihansiswa}`} className="font-semibold">
          {convertIDR(parseFloat(item.jumlahtagihan) || 0)}
        </span>,

        // Sisa Tagihan
        <span
          key={`sisa-${item.idtagihansiswa}`}
          className={cn(
            "font-semibold",
            parseFloat(item.sisa || 0) === 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {convertIDR(parseFloat(item.sisa) || 0)}
        </span>,

        // Status + Lock indicator
        <div key={`status-${item.idtagihansiswa}`} className="flex flex-col gap-1">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium w-fit",
              item.statuspembayaran === "LUNAS"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : item.statuspembayaran === "KADALUARSA"
                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            )}
          >
            {item.statuspembayaran}
          </span>
          {/* Badge sumber pembayaran */}
          {!perms.canDelete && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              {perms.hasMidtrans ? "via Midtrans" : "via Cash"}
            </span>
          )}
        </div>,

        // Tanggal
        new Date(item.createdat).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),

        // Aksi
        <DropdownAction
          key={`act-${item.idtagihansiswa}`}
          menu={[
            {
              label: (
                <span className="flex items-center gap-2">
                  <Banknote
                    className={cn(
                      "w-4 h-4",
                      perms.canBayarManual ? "text-green-600" : "text-gray-400"
                    )}
                  />
                  {perms.canBayarManual
                    ? "Bayar Manual (Cash)"
                    : "Bayar Manual (Terkunci)"}
                </span>
              ),
              action: () => {
                if (!perms.canBayarManual) {
                  toast.error(
                    perms.hasMidtrans
                      ? "Tagihan sudah lunas via Midtrans"
                      : "Tagihan sudah lunas"
                  );
                  return;
                }
                setSelectedAction({ data: item, type: "bayar" });
              },
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Trash2
                    className={cn(
                      "w-4 h-4",
                      perms.canDelete ? "text-red-400" : "text-gray-400"
                    )}
                  />
                  {perms.canDelete ? "Hapus" : "Hapus (Terkunci)"}
                </span>
              ),
              variant: perms.canDelete ? "destructive" : "default",
              action: () => {
                if (!perms.canDelete) {
                  toast.error(
                    "Tidak dapat menghapus tagihan yang sudah memiliki riwayat pembayaran"
                  );
                  return;
                }
                setSelectedAction({ data: item, type: "delete" });
              },
            },
          ]}
        />,
      ];
    });
  }, [tagihanList, currentLimit, currentPage]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold">Tagihan Siswa</h1>
          <p className="text-sm text-muted-foreground">
            Kelola tagihan pembayaran siswa
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Cari siswa atau periode..."
            onChange={(e) => handleChangeSearch(e.target.value)}
            className="max-w-sm"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Buat Tagihan
              </Button>
            </DialogTrigger>
            <DialogCreateTagihan refetch={refetch} />
          </Dialog>
        </div>
      </div>

      {/* Stats */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm">Total Tagihan</CardTitle>
      <FileText className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats?.total || 0}</div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm">Belum Bayar</CardTitle>
      <AlertCircle className="h-4 w-4 text-red-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-red-600">{stats?.belumBayar || 0}</div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm">Lunas</CardTitle>
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-green-600">{stats?.lunas || 0}</div>
    </CardContent>
  </Card>
</div>

      {/* Tabel */}
      <DataTable
        header={[
          "No",
          "ID",
          "Nama Siswa",
          "Tagihan",
          "Nominal",
          "Sisa Tagihan",
          "Status",
          "Tanggal",
          "Aksi",
        ]}
        data={filteredData}
        isLoading={isLoading}
        totalPages={
          tagihanList?.count
            ? Math.ceil(tagihanList.count / currentLimit)
            : 0
        }
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />

      {/* Dialog Bayar Manual */}
      <DialogBayarManual
        open={selectedAction?.type === "bayar"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />

      {/* Dialog Delete */}
      <DialogDeleteTagihanSiswa
        open={selectedAction?.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}