// src/app/(dashboard)/admin/user/_components/user.tsx
"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_USER } from "@/constants/user-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DialogCreateUser from "./dialog-create-user";
import { Profile } from "@/types/auth";
import DialogUpdateUser from "./dialog-update-user";
import DialogDeleteUser from "./dialog-delete-user";

export default function UserManagement() {
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
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      // Gunakan RPC function untuk fetch data yang sudah flat
      const result = await supabase.rpc('get_santri_with_details', {
        search_term: currentSearch,
        page_limit: currentLimit,
        page_offset: (currentPage - 1) * currentLimit
      });

      if (result.error) {
        console.error("Supabase error:", result.error);
        toast.error("Get User data failed", {
          description: result.error.message,
        });
        return { data: [], count: 0 };
      }

      console.log("Fetched users data:", result.data); // Debug log
      
      // Hitung total count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'santri')
        .ilike('name', `%${currentSearch}%`);

      return { data: result.data || [], count: count || 0 };
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: Profile;
    type: "update" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const filteredData = useMemo(() => {
    if (!users?.data) return [];

    return users.data.map((user: any, index) => {
      // Data sudah flat dari RPC function, langsung akses dari user object
      console.log("User data:", user); // Debug log

      return [
        currentLimit * (currentPage - 1) + index + 1,
        user.name || "-",
        user.jenisKelamin || "-",
        user.tempatLahir || "-",
        user.tanggalLahir
          ? new Date(user.tanggalLahir).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
        user.namaAyah || "-",
        user.pekerjaanAyah || "-",
        user.namaIbu || "-",
        user.pekerjaanIbu || "-",
        <DropdownAction
          key={`action-${user.id}`}
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
                  data: {
                    ...user,
                    // Map camelCase ke snake_case untuk form
                    jenis_kelamin: user.jenisKelamin,
                    tempat_lahir: user.tempatLahir,
                    tanggal_lahir: user.tanggalLahir,
                    nama_ayah: user.namaAyah,
                    nama_ibu: user.namaIbu,
                    pekerjaan_ayah: user.pekerjaanAyah,
                    pekerjaan_ibu: user.pekerjaanIbu,
                  },
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
                  data: user,
                  type: "delete",
                });
              },
            },
          ]}
        />,
      ];
    });
  }, [users, currentLimit, currentPage]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Data Santri</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Cari nama santri..."
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Tambah Santri</Button>
            </DialogTrigger>
            <DialogCreateUser refetch={refetch} />
          </Dialog>
        </div>
      </div>
      <DataTable
        header={HEADER_TABLE_USER}
        data={filteredData}
        isLoading={isLoading}
        totalPages={
          users && users.count !== null
            ? Math.ceil(users.count / currentLimit)
            : 0
        }
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
      <DialogUpdateUser
        open={selectedAction !== null && selectedAction.type === "update"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteUser
        open={selectedAction !== null && selectedAction.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}