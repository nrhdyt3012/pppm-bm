// src/app/(dashboard)/admin/menu/_components/menu.tsx
"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Menu } from "@/validations/menu-validation";
import { convertIDR } from "@/lib/utils";
import { HEADER_TABLE_MENU } from "@/constants/menu-constant";
import DialogCreateMenu from "./dialog-create-menu";
import DialogUpdateMenu from "./dialog-update-menu";
import DialogDeleteMenu from "./dialog-delete-menu";

export default function MenuManagement() {
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
    data: menus,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["menus", currentPage, currentLimit, currentSearch],
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
        toast.error("Get Menu data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: Menu;
    type: "update" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const filteredData = useMemo(() => {
    return (menus?.data || []).map((menu: Menu, index) => {
      const total =
        (menu.uang_makan || 0) +
        (menu.asrama || 0) +
        (menu.kas_pondok || 0) +
        (menu.sedekah_sukarela || 0) +
        (menu.aset_jariyah || 0) +
        (menu.uang_tahunan || 0) +
        (menu.iuran_kampung || 0);

      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div key={`periode-${menu.id_masterTagihan}`}>
          <p className="font-bold">{menu.periode}</p>
          <p className="text-xs text-muted-foreground">{menu.description}</p>
        </div>,
        convertIDR(menu.uang_makan || 0),
        convertIDR(menu.asrama || 0),
        convertIDR(menu.kas_pondok || 0),
        convertIDR(menu.sedekah_sukarela || 0),
        convertIDR(menu.aset_jariyah || 0),
        convertIDR(menu.uang_tahunan || 0),
        convertIDR(menu.iuran_kampung || 0),
        <DropdownAction
          key={`action-${menu.id_masterTagihan}`}
          menu={[
            {
              label: (
                <span className="flex item-center gap-2">
                  <Pencil />
                  Edit
                </span>
              ),
              action: () => {
                setSelectedAction({
                  data: menu,
                  type: "update",
                });
              },
            },
            {
              label: (
                <span className="flex item-center gap-2">
                  <Trash2 className="text-red-400" />
                  Delete
                </span>
              ),
              variant: "destructive",
              action: () => {
                setSelectedAction({
                  data: menu,
                  type: "delete",
                });
              },
            },
          ]}
        />,
      ];
    });
  }, [menus]);

  const totalPages = useMemo(() => {
    return menus && menus.count !== null
      ? Math.ceil(menus.count / currentLimit)
      : 0;
  }, [menus]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Kelola Tagihan</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Cari periode atau keterangan..."
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Buat Tagihan</Button>
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
        open={selectedAction !== null && selectedAction.type === "update"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteMenu
        open={selectedAction !== null && selectedAction.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}
