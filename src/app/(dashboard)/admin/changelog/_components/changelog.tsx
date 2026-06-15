"use client";

// src/app/(dashboard)/admin/changelog/_components/changelog.tsx

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { History, PlusCircle, Pencil, Trash2 } from "lucide-react";
import useDataTable from "@/hooks/use-data-table";
import DataTable from "@/components/common/data-table";

// ─── Badge jenis aksi ─────────────────────────────────────────────────────────
function AksiBadge({ jenis }: { jenis: string }) {
  const config: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    TAMBAH: {
      label: "Tambah",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      icon: <PlusCircle className="w-3 h-3" />,
    },
    UBAH: {
      label: "Ubah",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      icon: <Pencil className="w-3 h-3" />,
    },
    HAPUS: {
      label: "Hapus",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      icon: <Trash2 className="w-3 h-3" />,
    },
  };

  const cfg = config[jenis] || config["UBAH"];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function ChangelogPage() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
  } = useDataTable();

  // Data changelog
  const { data: changelogData, isLoading } = useQuery({
    queryKey: ["changelog-list", currentPage, currentLimit],
    queryFn: async () => {
      const result = await supabase
        .from("changelog")
        .select("*", { count: "exact" })
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1
        )
        .order("createdat", { ascending: false });

      if (result.error) {
        toast.error("Gagal memuat changelog");
      }

      return result;
    },
  });

  const filteredData = useMemo(() => {
    return (changelogData?.data || []).map((item: any, index: number) => [
      // No
      currentLimit * (currentPage - 1) + index + 1,

      // Waktu
      <div key={`time-${item.idchangelog}`} className="min-w-[120px]">
        <p className="text-sm font-medium">
          {new Date(item.createdat).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(item.createdat).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>,

      // Pelaku
      <div key={`aktor-${item.idchangelog}`}>
        <p className="font-medium text-sm">{item.namaaktor || "-"}</p>
        <p className="text-xs text-muted-foreground">
          {item.idadmin
            ? "Bendahara"
            : item.idsuperadmin
            ? "Superadmin"
            : "-"}
        </p>
      </div>,

      // Menu
      <span
        key={`menu-${item.idchangelog}`}
        className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground font-medium"
      >
        {item.namamenu || "-"}
      </span>,

      // Jenis Aksi
      <AksiBadge key={`aksi-${item.idchangelog}`} jenis={item.jenisaksi} />,

      // Deskripsi
      <p
        key={`desc-${item.idchangelog}`}
        className="text-sm text-muted-foreground max-w-xs"
      >
        {item.deskripsi || "-"}
      </p>,
    ]);
  }, [changelogData, currentPage, currentLimit]);

  const totalPages = useMemo(
    () =>
      changelogData?.count
        ? Math.ceil(changelogData.count / currentLimit)
        : 0,
    [changelogData, currentLimit]
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Riwayat Aktivitas (Changelog)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rekam jejak seluruh perubahan data yang dilakukan oleh bendahara dan
          superadmin
        </p>
      </div>

      {/* Tabel langsung */}
      <DataTable
        header={["No", "Waktu", "Pelaku", "Menu", "Aksi", "Keterangan"]}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
    </div>
  );
}