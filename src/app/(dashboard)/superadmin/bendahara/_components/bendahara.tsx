"use client";

// src/app/(dashboard)/superadmin/bendahara/_components/bendahara.tsx

import { useState, useMemo, startTransition, useActionState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { createBendahara, updateBendahara, deleteBendahara } from "../actions";
import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import useDataTable from "@/hooks/use-data-table";

const INITIAL = { status: "idle", errors: { _form: [] as string[] } };

const JENIS_KELAMIN_OPTIONS = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

// ─── Form Create ──────────────────────────────────────────────────────────────
function DialogCreateBendahara({ refetch }: { refetch: () => void }) {
  const [state, action, isPending] = useActionState(createBendahara, INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [jenisKelamin, setJenisKelamin] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Tambahkan jeniskelamin dari state karena Select tidak otomatis masuk FormData
    if (jenisKelamin) fd.set("jeniskelamin", jenisKelamin);
    startTransition(() => action(fd));
  };

  useEffect(() => {
    if (state.status === "error") {
      toast.error("Gagal Menyimpan", {
        description: state.errors?._form?.[0],
      });
    }
    if (state.status === "success") {
      toast.success("Bendahara berhasil ditambahkan");
      setJenisKelamin("");
      refetch();
      document
        .querySelector<HTMLButtonElement>('[data-dialog-close="create"]')
        ?.click();
    }
  }, [state]);

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          Tambah Bendahara
        </DialogTitle>
        <DialogDescription>
          Buat akun bendahara baru. Bendahara dapat mengelola semua data
          siswa dan tagihan.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <Label htmlFor="nama-create">Nama Lengkap</Label>
          <Input
            id="nama-create"
            name="nama"
            placeholder="Nama bendahara"
            required
          />
        </div>

        {/* Jenis Kelamin */}
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <Select value={jenisKelamin} onValueChange={setJenisKelamin}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              {JENIS_KELAMIN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* No. HP */}
        <div className="space-y-2">
          <Label htmlFor="nohp-create">No. Telepon</Label>
          <Input
            id="nohp-create"
            name="nohp"
            placeholder="08xx xxxx xxxx"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email-create">Email</Label>
          <Input
            id="email-create"
            name="email"
            type="email"
            placeholder="email@sekolah.id"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password-create">Password</Label>
          <div className="relative">
            <Input
              id="password-create"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 karakter"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              data-dialog-close="create"
            >
              Batal
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ─── Form Update ──────────────────────────────────────────────────────────────
function DialogUpdateBendahara({
  open,
  onOpenChange,
  currentData,
  refetch,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentData: any;
  refetch: () => void;
}) {
  const [state, action, isPending] = useActionState(updateBendahara, INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [jenisKelamin, setJenisKelamin] = useState("");

  // Isi nilai awal saat data berubah
  useEffect(() => {
    if (currentData && open) {
      setJenisKelamin(currentData.jeniskelamin || "");
    }
  }, [currentData, open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("id", currentData?.id ?? "");
    if (jenisKelamin) fd.set("jeniskelamin", jenisKelamin);
    startTransition(() => action(fd));
  };

  useEffect(() => {
    if (state.status === "error") {
      toast.error("Gagal Mengubah", {
        description: state.errors?._form?.[0],
      });
    }
    if (state.status === "success") {
      toast.success("Data bendahara berhasil diubah");
      onOpenChange(false);
      refetch();
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            Edit Bendahara
          </DialogTitle>
          <DialogDescription>
            Ubah data bendahara. Kosongkan field password jika tidak ingin
            mengubah password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input
              name="nama"
              defaultValue={currentData?.nama ?? ""}
              placeholder="Nama bendahara"
              required
            />
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-2">
            <Label>Jenis Kelamin</Label>
            <Select value={jenisKelamin} onValueChange={setJenisKelamin}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_KELAMIN_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* No. HP */}
          <div className="space-y-2">
            <Label>No. Telepon (Opsional)</Label>
            <Input
              name="nohp"
              defaultValue={currentData?.nohp ?? ""}
              placeholder="08xx xxxx xxxx"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={currentData?.email ?? ""}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
          </div>

          {/* Password Baru */}
          <div className="space-y-2">
            <Label>Password Baru (Opsional)</Label>
            <div className="relative">
              <Input
                name="new_password"
                type={showPass ? "text" : "password"}
                placeholder="Kosongkan jika tidak diubah"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog Delete ────────────────────────────────────────────────────────────
function DialogDeleteBendahara({
  open,
  onOpenChange,
  currentData,
  refetch,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentData: any;
  refetch: () => void;
}) {
  const [state, action, isPending] = useActionState(deleteBendahara, INITIAL);

  const handleDelete = () => {
    const fd = new FormData();
    fd.append("id", currentData?.id ?? "");
    fd.append("nama", currentData?.nama ?? "");
    startTransition(() => action(fd));
  };

  useEffect(() => {
    if (state.status === "error") {
      toast.error("Gagal Menghapus", {
        description: state.errors?._form?.[0],
      });
    }
    if (state.status === "success") {
      toast.success("Bendahara berhasil dihapus");
      onOpenChange(false);
      refetch();
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Hapus Bendahara
          </DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Akun bendahara{" "}
            <strong>{currentData?.nama}</strong> akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          Bendahara yang dihapus tidak akan bisa login ke sistem.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Hapus Permanen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function BendaharaManagement() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const { data: bendaharaList, isLoading, refetch } = useQuery({
    queryKey: ["bendahara-list", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      let query = supabase
        .from("admin")
        .select("*", { count: "exact" })
        .range(
          (currentPage - 1) * currentLimit,
          currentPage * currentLimit - 1
        )
        .order("createdat", { ascending: false });

      if (currentSearch) {
        query = query.or(
          `nama.ilike.%${currentSearch}%,email.ilike.%${currentSearch}%`
        );
      }

      const result = await query;
      if (result.error) {
        toast.error("Gagal memuat data", {
          description: result.error.message,
        });
      }
      return result;
    },
  });

  const [selectedAction, setSelectedAction] = useState<{
    data: any;
    type: "update" | "delete";
  } | null>(null);

  const filteredData = useMemo(() => {
    return (bendaharaList?.data || []).map((item: any, index: number) => [
      // No
      currentLimit * (currentPage - 1) + index + 1,

      // Nama Bendahara
      <div key={`nama-${item.id}`}>
        <p className="font-semibold">{item.nama || "-"}</p>
      </div>,

      // Jenis Kelamin
      item.jeniskelamin ? (
        <span
          key={`jk-${item.id}`}
          className={`px-2 py-1 rounded-full text-xs font-medium`}
        >
          {item.jeniskelamin}
        </span>
      ) : (
        <span key={`jk-${item.id}`} className="text-sm text-muted-foreground">-</span>
      ),

      // Email
      <span key={`email-${item.id}`} className="text-sm">
        {item.email || "-"}
      </span>,

      // No. Telepon
      <span key={`hp-${item.id}`} className="text-sm">
        {item.nohp || "-"}
      </span>,

      // Aksi
      <DropdownAction
        key={`act-${item.id}`}
        menu={[
          {
            label: (
              <span className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit
              </span>
            ),
            action: () => setSelectedAction({ data: item, type: "update" }),
          },
          {
            label: (
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Hapus
              </span>
            ),
            variant: "destructive" as const,
            action: () => setSelectedAction({ data: item, type: "delete" }),
          },
        ]}
      />,
    ]);
  }, [bendaharaList, currentPage, currentLimit]);

  const totalPages = useMemo(
    () =>
      bendaharaList?.count
        ? Math.ceil(bendaharaList.count / currentLimit)
        : 0,
    [bendaharaList, currentLimit]
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row mb-6 gap-2 justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold">Kelola Bendahara</h1>
          <p className="text-sm text-muted-foreground">
            Manajemen akun bendahara 
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Cari nama atau email..."
            onChange={(e) => handleChangeSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bendahara
              </Button>
            </DialogTrigger>
            <DialogCreateBendahara refetch={refetch} />
          </Dialog>
        </div>
      </div>

      {/* Tabel */}
      <DataTable
        header={["No", "Nama Bendahara", "Jenis Kelamin", "Email", "No. Telepon", "Aksi"]}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />

      {/* Dialog Update */}
      <DialogUpdateBendahara
        open={selectedAction?.type === "update"}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null);
        }}
        currentData={selectedAction?.data}
        refetch={refetch}
      />

      {/* Dialog Delete */}
      <DialogDeleteBendahara
        open={selectedAction?.type === "delete"}
        onOpenChange={(open) => {
          if (!open) setSelectedAction(null);
        }}
        currentData={selectedAction?.data}
        refetch={refetch}
      />
    </div>
  );
}