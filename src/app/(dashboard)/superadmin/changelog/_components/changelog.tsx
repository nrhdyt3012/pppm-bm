"use client";

// src/app/(dashboard)/superadmin/changelog/_components/changelog.tsx

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import useDataTable from "@/hooks/use-data-table";
import DataTable from "@/components/common/data-table";

type JenisAksi = "SEMUA" | "TAMBAH" | "UBAH" | "HAPUS";

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

  const [search, setSearch] = useState("");
  const [filterAksi, setFilterAksi] = useState<JenisAksi>("SEMUA");

  // Stats per jenis aksi
  const { data: statsData } = useQuery({
    queryKey: ["changelog-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("changelog")
        .select("jenisaksi");
      const counts = { TAMBAH: 0, UBAH: 0, HAPUS: 0, total: 0 };
      (data || []).forEach((row: any) => {
        counts.total++;
        if (row.jenisaksi in counts) {
          counts[row.jenisaksi as keyof typeof counts] =
            (counts[row.jenisaksi as keyof typeof counts] as number) + 1;
        }
      });
      return counts;
    },
  });

  // Data changelog dengan filter
  const { data: changelogData, isLoading } = useQuery({
    queryKey: [
      "changelog-list",
      currentPage,
      currentLimit,
      search,
      filterAksi,
    ],
    queryFn: async () => {
      let query = supabase
        .from("changelog")
        .select("*", { count: "exact" })
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1
        )
        .order("createdat", { ascending: false });

      if (filterAksi !== "SEMUA") {
        query = query.eq("jenisaksi", filterAksi);
      }

      if (search) {
        query = query.or(
          `namaaktor.ilike.%${search}%,namamenu.ilike.%${search}%,deskripsi.ilike.%${search}%`
        );
      }

      const result = await query;
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
          {item.idadmin ? "Bendahara" : item.idsuperadmin ? "Superadmin" : "-"}
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
          <History className="w-6 h-6 text-purple-600" />
          Riwayat Aktivitas (Changelog)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rekam jejak seluruh perubahan data yang dilakukan oleh bendahara dan
          superadmin
        </p>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Aktivitas",
            value: statsData?.total || 0,
            color: "text-gray-700 dark:text-gray-200",
            bg: "bg-muted",
          },
          {
            label: "Penambahan",
            value: statsData?.TAMBAH || 0,
            color: "text-green-700 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Perubahan",
            value: statsData?.UBAH || 0,
            color: "text-blue-700 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Penghapusan",
            value: statsData?.HAPUS || 0,
            color: "text-red-700 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-950",
          },
        ].map((stat) => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelaku, menu, atau deskripsi..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={filterAksi}
              onValueChange={(v) => setFilterAksi(v as JenisAksi)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Semua Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMUA">Semua Aksi</SelectItem>
                <SelectItem value="TAMBAH">Penambahan</SelectItem>
                <SelectItem value="UBAH">Perubahan</SelectItem>
                <SelectItem value="HAPUS">Penghapusan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabel */}
      <DataTable
        header={[
          "No",
          "Waktu",
          "Pelaku",
          "Menu",
          "Aksi",
          "Keterangan",
        ]}
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