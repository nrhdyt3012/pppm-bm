"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useAngkatanFilterStore } from "@/stores/angkatan-filter-store";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const supabase = createClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { angkatan } = useAngkatanFilterStore();

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tagihan Belum Terbayar</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {tagihanStats?.belumBayar || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">tagihan</p>
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
    </div>
  );
}