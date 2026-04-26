"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Menu } from "@/validations/menu-validation";
import { HEADER_TABLE_MENU } from "@/constants/menu-constant";
import DialogCreateMenu from "./dialog-create-menu";
import DialogUpdateMenu from "./dialog-update-menu";
import DialogDeleteMenu from "./dialog-delete-menu";

export default function MenuManagement() {
  const supabase = createClient();
  const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

  const { data: menus, isLoading, refetch } = useQuery({
    queryKey: ["master-tagihan", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("master_tagihan")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at", { ascending: false });

      if (currentSearch) {
        query.or(`namaTagihan.ilike.%${currentSearch}%,jenjang.ilike.%${currentSearch}%`);
      }

      const result = await query;
      if (result.error) toast.error("Gagal memuat data", { description: result.error.message });
      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{ data: Menu; type: "update" | "delete" } | null>(null);
  const handleChangeAction = (open: boolean) => { if (!open) setSelectedAction(null); };

  const filteredData = useMemo(() => {
    return (menus?.data || []).map((item: any, index: number) => [
      currentLimit * (currentPage - 1) + index + 1,
      <div key={`nama-${item.id_masterTagihan}`}>
        <p className="font-semibold">{item.namaTagihan}</p>
        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
      </div>,
      <span key={`jenjang-${item.id_masterTagihan}`} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        {item.jenjang}
      </span>,
      <span key={`jenis-${item.id_masterTagihan}`} className={`px-2 py-1 rounded-full text-xs ${item.jenisTagihan === "Reguler" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
        {item.jenisTagihan}
      </span>,
      <span key={`nominal-${item.id_masterTagihan}`} className="font-semibold">
        {convertIDR(parseFloat(item.nominal || 0))}
      </span>,
      <DropdownAction
        key={`action-${item.id_masterTagihan}`}
        menu={[
          {
            label: <span className="flex items-center gap-2"><Pencil className="w-4 h-4" />Edit</span>,
            action: () => setSelectedAction({ data: item, type: "update" }),
          },
          {
            label: <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-400" />Hapus</span>,
            variant: "destructive",
            action: () => setSelectedAction({ data: item, type: "delete" }),
          },
        ]}
      />,
    ]);
  }, [menus, currentLimit, currentPage]);

  const totalPages = useMemo(() => {
    return menus?.count ? Math.ceil(menus.count / currentLimit) : 0;
  }, [menus, currentLimit]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold">Master Tagihan</h1>
          <p className="text-sm text-muted-foreground">Kelola jenis tagihan PAUD</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Cari nama tagihan..." onChange={(e) => handleChangeSearch(e.target.value)} />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />Tambah
              </Button>
            </DialogTrigger>
            <DialogCreateMenu refetch={refetch} />
          </Dialog>
        </div>
      </div>
      <DataTable
        header={HEADER_TABLE_MENU}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
      <DialogUpdateMenu
        open={selectedAction?.type === "update"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteMenu
        open={selectedAction?.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}