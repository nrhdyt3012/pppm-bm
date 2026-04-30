"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HEADER_TABLE_USER } from "@/constants/user-constant";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DialogCreateUser from "./dialog-create-user";
import { Profile } from "@/types/auth";
import DialogUpdateUser from "./dialog-update-user";
import DialogDeleteUser from "./dialog-delete-user";

export default function UserManagement() {
  const supabase = createClient();
  const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["siswa-list", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      let query = supabase
        .from("siswa")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("namasiswa");

      if (currentSearch) {
        // Gunakan nama kolom lowercase sesuai database PostgreSQL
        query = query.or(
          `namasiswa.ilike.%${currentSearch}%,nis.ilike.%${currentSearch}%,namawali.ilike.%${currentSearch}%`
        );
      }

      const result = await query;
      if (result.error) {
        toast.error("Gagal memuat data siswa", { description: result.error.message });
      }
      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{ data: Profile; type: "update" | "delete" } | null>(null);
  const handleChangeAction = (open: boolean) => { if (!open) setSelectedAction(null); };

  const filteredData = useMemo(() => {
    if (!users?.data) return [];
    return users.data.map((user: any, index: number) => [
      currentLimit * (currentPage - 1) + index + 1,
      <Avatar key={`foto-${user.id}`} className="h-9 w-9">
        <AvatarImage
          src={user.avatarUrl || user.avatarurl}
          alt={user.namaSiswa || user.namasiswa}
          className="object-cover"
        />
        <AvatarFallback className="text-xs bg-green-100 text-green-700">
          {((user.namaSiswa || user.namasiswa) || "?").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>,
      <div key={`nama-${user.id}`}>
        <p className="font-medium">{user.namaSiswa || user.namasiswa || "-"}</p>
      </div>,
      <span key={`nis-${user.id}`} className="text-sm text-muted-foreground font-mono">
        {user.NIS || user.nis || "-"}
      </span>,
      <span key={`kelas-${user.id}`} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
        {user.kelas || "-"}
      </span>,
      <span key={`angkatan-${user.id}`} className="text-sm">
        {user.angkatan || "-"}
      </span>,
      <span key={`wali-${user.id}`} className="text-sm">
        {user.namaWali || user.namawali || "-"}
      </span>,
      <span key={`nowa-${user.id}`} className="text-sm">
        {user.noWa || user.nowa || "-"}
      </span>,
      <span key={`tl-${user.id}`} className="text-sm">
        {user.tempatLahir || user.tempatlahir || "-"}
      </span>,
      <span key={`ttl-${user.id}`} className="text-sm">
        {(user.tanggalLahir || user.tanggallahir)
          ? new Date(user.tanggalLahir || user.tanggallahir).toLocaleDateString("id-ID", {
              day: "numeric", month: "short", year: "numeric",
            })
          : "-"}
      </span>,
      <span
        key={`status-${user.id}`}
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.status === "aktif"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }`}
      >
        {user.status || "aktif"}
      </span>,
      <DropdownAction
        key={`action-${user.id}`}
        menu={[
          {
            label: <span className="flex items-center gap-2"><Pencil className="w-4 h-4" />Edit</span>,
            action: () => setSelectedAction({
              data: {
                ...user,
                name: user.namaSiswa || user.namasiswa,
                namaSiswa: user.namaSiswa || user.namasiswa,
                NIS: user.NIS || user.nis,
                namaWali: user.namaWali || user.namawali,
                noWa: user.noWa || user.nowa,
                tempatLahir: user.tempatLahir || user.tempatlahir,
                tanggalLahir: user.tanggalLahir || user.tanggallahir,
                avatar_url: user.avatarUrl || user.avatarurl,
              },
              type: "update"
            }),
          },
          {
            label: <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-400" />Hapus</span>,
            variant: "destructive",
            action: () => setSelectedAction({
              data: {
                ...user,
                name: user.namaSiswa || user.namasiswa,
                avatar_url: user.avatarUrl || user.avatarurl,
              },
              type: "delete"
            }),
          },
        ]}
      />,
    ]);
  }, [users, currentLimit, currentPage]);

  const totalPages = useMemo(() => {
    return users?.count ? Math.ceil(users.count / currentLimit) : 0;
  }, [users, currentLimit]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold">Data Siswa</h1>
          <p className="text-sm text-muted-foreground">Kelola data siswa PAUD</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Cari nama, NIS, atau wali..."
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogCreateUser refetch={refetch} />
          </Dialog>
        </div>
      </div>
      <DataTable
        header={HEADER_TABLE_USER}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
      <DialogUpdateUser
        open={selectedAction?.type === "update"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
      <DialogDeleteUser
        open={selectedAction?.type === "delete"}
        refetch={refetch}
        currentData={selectedAction?.data}
        handleChangeAction={handleChangeAction}
      />
    </div>
  );
}