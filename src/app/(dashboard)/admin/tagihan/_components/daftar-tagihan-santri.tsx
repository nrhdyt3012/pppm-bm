// src/app/(dashboard)/admin/tagihan/_components/daftar-tagihan-santri.tsx
"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { convertIDR, cn } from "@/lib/utils";
import DialogCreateTagihan from "./dialog-create-tagihan";
import DialogEditTagihan from "./dialog-edit-tagihan";
import DialogDeleteTagihan from "./dialog-delete-tagihan";

export default function DaftarTagihanSantri() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  // Query untuk statistik
  const { data: stats } = useQuery({
    queryKey: ["tagihan-stats"],
    queryFn: async () => {
      const { count: totalTagihan } = await supabase
        .from("tagihan_santri")
        .select("*", { count: "exact", head: true });

      const { count: belumBayar } = await supabase
        .from("tagihan_santri")
        .select("*", { count: "exact", head: true })
        .eq("status_pembayaran", "BELUM BAYAR");

      const { count: lunas } = await supabase
        .from("tagihan_santri")
        .select("*", { count: "exact", head: true })
        .eq("status_pembayaran", "LUNAS");

      const { data: totalNominal } = await supabase
        .from("tagihan_santri")
        .select("jumlah_tagihan");

      const sumNominal =
        totalNominal?.reduce(
          (sum, item) => sum + parseFloat(item.jumlah_tagihan || "0"),
          0
        ) || 0;

      return {
        totalTagihan: totalTagihan || 0,
        belumBayar: belumBayar || 0,
        lunas: lunas || 0,
        totalNominal: sumNominal,
      };
    },
  });

  const {
    data: tagihanList,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tagihan-santri-list", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      let query = supabase
        .from("tagihan_santri")
        .select(
          `
          *,
          santri:profiles!id_santri(id, name, avatar_url),
          master_tagihan:master_tagihan!id_master_tagihan(id, periode, description)
        `,
          { count: "exact" }
        )
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at", { ascending: false });

      if (currentSearch) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .ilike("name", `%${currentSearch}%`);

        const { data: masterTagihan } = await supabase
          .from("master_tagihan")
          .select("id")
          .ilike("periode", `%${currentSearch}%`);

        const santriIds = profiles?.map((p) => p.id) || [];
        const masterIds = masterTagihan?.map((m) => m.id) || [];

        if (santriIds.length > 0 || masterIds.length > 0) {
          query = query.or(
            `id_santri.in.(${santriIds.join(
              ","
            )}),id_master_tagihan.in.(${masterIds.join(",")})`
          );
        } else {
          return { data: [], count: 0 };
        }
      }

      const result = await query;

      if (result.error) {
        toast.error("Gagal memuat data tagihan", {
          description: result.error.message,
        });
        return { data: [], count: 0 };
      }

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: any;
    type: "edit" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "BELUM BAYAR":
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      LUNAS:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      KADALUARSA:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    };

    return (
      <span
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          statusConfig[status as keyof typeof statusConfig] ||
            statusConfig["BELUM BAYAR"]
        )}
      >
        {status}
      </span>
    );
  };

  const filteredData = useMemo(() => {
    return (tagihanList?.data || []).map((item: any, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div key={`id-${item.id_tagihan_santri}`} className="font-mono text-sm">
          #{item.id_tagihan_santri}
        </div>,
        <div key={`santri-${item.id_tagihan_santri}`}>
          <p className="font-medium">{item.santri?.name || "-"}</p>
        </div>,
        <div key={`periode-${item.id_tagihan_santri}`}>
          <p className="font-semibold">{item.master_tagihan?.periode || "-"}</p>
          <p className="text-xs text-muted-foreground">
            {item.master_tagihan?.description || "-"}
          </p>
        </div>,
        <div
          key={`nominal-${item.id_tagihan_santri}`}
          className="font-semibold"
        >
          {convertIDR(parseFloat(item.jumlah_tagihan) || 0)}
        </div>,
        getStatusBadge(item.status_pembayaran),
        <div key={`date-${item.id_tagihan_santri}`} className="text-sm">
          {new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>,
        <DropdownAction
          key={`action-${item.id_tagihan_santri}`}
          menu={[
            {
              label: (
                <span className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  Edit
                </span>
              ),
              action: () => {
                setSelectedAction({
                  data: item,
                  type: "edit",
                });
              },
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Hapus
                </span>
              ),
              variant: "destructive",
              action: () => {
                setSelectedAction({
                  data: item,
                  type: "delete",
                });
              },
            },
          ]}
        />,
      ];
    });
  }, [tagihanList, currentLimit, currentPage]);

  const totalPages = useMemo(() => {
    return tagihanList && tagihanList.count !== null
      ? Math.ceil(tagihanList.count / currentLimit)
      : 0;
  }, [tagihanList, currentLimit]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Daftar Tagihan Santri</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Cari santri atau periode..."
            onChange={(e) => handleChangeSearch(e.target.value)}
            className="max-w-sm"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-teal-500 hover:bg-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tagihan
              </Button>
            </DialogTrigger>
            <DialogCreateTagihan refetch={refetch} />
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTagihan || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.belumBayar || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lunas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.lunas || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Nominal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-teal-600">
              {convertIDR(stats?.totalNominal || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        header={[
          "No",
          "ID Tagihan",
          "Nama Santri",
          "Periode",
          "Jumlah Tagihan",
          "Status",
          "Tanggal Dibuat",
          "Action",
        ]}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />

      <DialogEditTagihan
        open={selectedAction !== null && selectedAction.type === "edit"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />

      <DialogDeleteTagihan
        open={selectedAction !== null && selectedAction.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}
