"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DialogCreateTagihan from "./dialog-create-tagihan";
import DialogEditTagihan from "./dialog-edit-tagihan";
import DialogDeleteTagihan from "./dialog-delete-tagihan";

export default function TagihanList() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: tagihan,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tagihan", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("master_tagihan")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at", { ascending: false });

      if (currentSearch) {
        query.or(
          `periode.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%`
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Gagal memuat data tagihan", {
          description: result.error.message,
        });

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

  const filteredData = useMemo(() => {
    return (tagihan?.data || []).map((item: any, index) => {
      const total =
        (item.uang_makan || 0) +
        (item.asrama || 0) +
        (item.kas_pondok || 0) +
        (item.shodaqoh_sukarela || 0) +
        (item.jariyah_sb || 0) +
        (item.uang_tahunan || 0) +
        (item.iuran_kampung || 0);

      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div key={`periode-${item.id}`}>
          <p className="font-bold">{item.periode}</p>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </div>,
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(total),
        <DropdownAction
          key={`action-${item.id}`}
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
  }, [tagihan, currentLimit, currentPage]);

  const totalPages = useMemo(() => {
    return tagihan && tagihan.count !== null
      ? Math.ceil(tagihan.count / currentLimit)
      : 0;
  }, [tagihan, currentLimit]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Daftar Tagihan</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Cari periode atau keterangan..."
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
            <DialogCreateTagihan refetch={() => refetch()} />
          </Dialog>
        </div>
      </div>

      <DataTable
        header={[
          "No",
          "Periode",
          "Total Nominal",
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