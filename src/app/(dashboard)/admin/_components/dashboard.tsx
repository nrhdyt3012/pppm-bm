"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useAngkatanFilterStore } from "@/stores/angkatan-filter-store";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function Dashboard() {
  const supabase = createClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { angkatan } = useAngkatanFilterStore();

  // ← state untuk buka/tutup popup tunggakan
  const [showTunggakanDialog, setShowTunggakanDialog] = useState(false);
  const [searchTunggakan, setSearchTunggakan] = useState("");

  // Daftar siswa sesuai filter angkatan
  const { data: siswaFiltered } = useQuery({
    queryKey: ["siswa-by-angkatan", angkatan],
    queryFn: async () => {
      let query = supabase.from("siswa").select("id, kelas, status, angkatan, jeniskelamin");
      if (angkatan !== "semua") query = query.eq("angkatan", angkatan);
      const { data } = await query;
      return data || [];
    },
  });

  const idList = (siswaFiltered || []).map((s: any) => s.id);

  const { data: siswaStats } = useQuery({
    queryKey: ["siswa-stats", angkatan, siswaFiltered],
    enabled: !!siswaFiltered,
    queryFn: async () => {
      const aktif = (siswaFiltered || []).filter((s: any) => s.status === "aktif");
      const lakiLaki = aktif.filter(
        (s: any) =>
          s.jeniskelamin === "Laki-laki" ||
          s.jeniskelamin === "laki-laki" ||
          s.jeniskelamin === "L"
      ).length;
      const perempuan = aktif.filter(
        (s: any) =>
          s.jeniskelamin === "Perempuan" ||
          s.jeniskelamin === "perempuan" ||
          s.jeniskelamin === "P"
      ).length;
      return {
        total: aktif.length,
        lakiLaki,
        perempuan,
      };
    },
  });

  const { data: tagihanStats } = useQuery({
    queryKey: ["tagihan-stats", currentMonth, currentYear, angkatan, idList],
    enabled: !!siswaFiltered,
    queryFn: async () => {
      if (angkatan !== "semua" && idList.length === 0) {
        return { total: 0, lunas: 0, belumBayar: 0 };
      }

      const base = () => {
        let q = supabase
          .from("tagihan_siswa")
          .select("*", { count: "exact", head: true })
          .eq("bulan", currentMonth)
          .eq("tahun", currentYear);
        if (angkatan !== "semua") q = q.in("idsiswa", idList);
        return q;
      };

      const { count: total } = await base();
      const { count: lunas } = await base().eq("statuspembayaran", "LUNAS");
      const { count: belumBayar } = await base().eq("statuspembayaran", "BELUM BAYAR");

      return { total: total || 0, lunas: lunas || 0, belumBayar: belumBayar || 0 };
    },
  });

  const { data: pemasukanStats } = useQuery({
    queryKey: ["pemasukan-stats", currentMonth, currentYear, angkatan, idList],
    enabled: !!siswaFiltered,
    queryFn: async () => {
      if (angkatan !== "semua" && idList.length === 0) {
        return { bulanIni: 0, tunggakanBulanIni: 0 };
      }

      let lunasQuery = supabase
        .from("tagihan_siswa")
        .select("jumlahtagihan")
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .eq("statuspembayaran", "LUNAS");
      if (angkatan !== "semua") lunasQuery = lunasQuery.in("idsiswa", idList);
      const { data: bulanIniData } = await lunasQuery;

      const bulanIni =
        bulanIniData?.reduce(
          (sum: number, item: any) => sum + parseFloat(item.jumlahtagihan || "0"),
          0
        ) || 0;

      let belumQuery = supabase
        .from("tagihan_siswa")
        .select("jumlahtagihan")
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .eq("statuspembayaran", "BELUM BAYAR");
      if (angkatan !== "semua") belumQuery = belumQuery.in("idsiswa", idList);
      const { data: tunggakanData } = await belumQuery;

      const tunggakanBulanIni =
        tunggakanData?.reduce(
          (sum: number, item: any) => sum + parseFloat(item.jumlahtagihan || "0"),
          0
        ) || 0;

      return { bulanIni, tunggakanBulanIni };
    },
  });

  // ─── Query daftar tunggakan untuk isi popup (sama persis seperti rekapan-tunggakan.tsx) ──
  const { data: daftarTunggakan, isLoading: isLoadingTunggakan } = useQuery({
    queryKey: ["dashboard-daftar-tunggakan", currentMonth, currentYear, angkatan, idList],
    enabled: showTunggakanDialog, // hanya fetch saat dialog dibuka, hemat request
    queryFn: async () => {
      if (angkatan !== "semua" && idList.length === 0) return [];

      let query = supabase
        .from("tagihan_siswa")
        .select(`
          idtagihansiswa,
          jumlahtagihan,
          statuspembayaran,
          bulan,
          tahun,
          siswa:siswa!idsiswa(id, namasiswa, kelas, nowa, nis),
          master_tagihan:master_tagihan!idmastertagihan(namatagihan, jenjang, jenistagihan)
        `)
        .eq("statuspembayaran", "BELUM BAYAR")
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .order("createdat", { ascending: false });

      if (angkatan !== "semua") query = query.in("idsiswa", idList);

      const { data, error } = await query;
      if (error) {
        console.error("[Dashboard] Gagal memuat tunggakan:", error);
        return [];
      }
      return data || [];
    },
  });

  const totalNominalTunggakan = (daftarTunggakan || []).reduce(
    (sum: number, item: any) => sum + parseFloat(item.jumlahtagihan || 0),
    0
  );

  // ← Filter daftar tunggakan berdasarkan pencarian nama/kelas di dalam popup
  const filteredTunggakan = useMemo(() => {
    if (!searchTunggakan.trim()) return daftarTunggakan || [];
    const q = searchTunggakan.toLowerCase();
    return (daftarTunggakan || []).filter((item: any) => {
      const nama = item.siswa?.namasiswa?.toLowerCase() || "";
      const kelas = item.siswa?.kelas?.toLowerCase() || "";
      return nama.includes(q) || kelas.includes(q);
    });
  }, [daftarTunggakan, searchTunggakan]);

  const bulanNama = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          KB/TK Aisyiyah Bustanul Athfal 1 Buduran
        </p>
      </div>

      {/* Sensus Siswa */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Sensus Siswa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Siswa Laki-laki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {siswaStats?.lakiLaki ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">siswa aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Siswa Perempuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {siswaStats?.perempuan ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">siswa aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {siswaStats?.total ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">siswa aktif</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tagihan Bulan Ini */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tagihan — {bulanNama}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tagihan Terbit Bulan Ini</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tagihanStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">tagihan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tagihan Sudah Terbayar</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {tagihanStats?.lunas || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">tagihan</p>
            </CardContent>
          </Card>

          {/* ← CARD INI YANG SEKARANG BISA DIKLIK */}
          <Card
            onClick={() => setShowTunggakanDialog(true)}
            className="cursor-pointer transition-shadow hover:shadow-md hover:border-red-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tagihan Belum Terbayar</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {tagihanStats?.belumBayar || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                tagihan 
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ringkasan Keuangan Bulan Ini */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Ringkasan Keuangan Bulan Ini</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {convertIDR(pemasukanStats?.bulanIni || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total tagihan yang sudah lunas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tunggakan Bulan Ini</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {convertIDR(pemasukanStats?.tunggakanBulanIni || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total tagihan yang belum dibayar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── POPUP: Daftar Tunggakan Bulan Ini ──────────────────────────────── */}
      <Dialog open={showTunggakanDialog} onOpenChange={setShowTunggakanDialog}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
            <DialogTitle>Daftar Tagihan Belum Terbayar — {bulanNama}</DialogTitle>
            <DialogDescription>
              {daftarTunggakan?.length || 0} siswa belum melunasi tagihan pada periode ini
            </DialogDescription>
          </DialogHeader>

          {/* ← Search box, sticky di atas, tidak ikut scroll */}
          {!isLoadingTunggakan && (daftarTunggakan?.length || 0) > 0 && (
            <div className="px-6 py-3 border-b shrink-0">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama siswa atau kelas..."
                  value={searchTunggakan}
                  onChange={(e) => setSearchTunggakan(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {/* ← Area scroll, hanya bagian tabel yang scroll, header & search tetap diam */}
          <div className="flex-1 overflow-y-auto px-6">
            {isLoadingTunggakan ? (
              <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
            ) : !daftarTunggakan?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada tunggakan untuk periode ini 🎉
              </div>
            ) : filteredTunggakan.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ditemukan siswa dengan kata kunci "{searchTunggakan}"
              </div>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b bg-muted/80 backdrop-blur-sm">
                    <th className="text-left p-3">No</th>
                    <th className="text-left p-3">Nama Siswa</th>
                    <th className="text-left p-3">Kelas</th>
                    <th className="text-left p-3">No. WA Wali</th>
                    <th className="text-left p-3">Tagihan</th>
                    <th className="text-right p-3">Nominal</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTunggakan.map((item: any, i: number) => (
                    <tr key={item.idtagihansiswa} className="border-b hover:bg-muted/50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-medium">{item.siswa?.namasiswa || "-"}</td>
                      <td className="p-3">{item.siswa?.kelas || "-"}</td>
                      <td className="p-3">{item.siswa?.nowa || "-"}</td>
                      <td className="p-3">{item.master_tagihan?.namatagihan || "-"}</td>
                      <td className="p-3 text-right font-semibold">
                        {convertIDR(parseFloat(item.jumlahtagihan || 0))}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                          Belum Bayar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ← Footer total, sticky di bawah, tidak ikut scroll */}
          {!isLoadingTunggakan && (daftarTunggakan?.length || 0) > 0 && (
            <div className="px-6 py-3 border-t shrink-0 flex items-center justify-between bg-muted/30">
              <span className="text-sm text-muted-foreground">
                Menampilkan {filteredTunggakan.length} dari {daftarTunggakan?.length} tagihan
              </span>
              <span className="font-bold text-red-600">
                Total: {convertIDR(totalNominalTunggakan)}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}