"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const supabase = createClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: siswaStats } = useQuery({
    queryKey: ["siswa-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("siswa").select("id, kelas, status");
      const aktif = data?.filter((s: any) => s.status === "aktif") || [];
      return {
        total: data?.length || 0,
        aktif: aktif.length,
        kb: aktif.filter((s: any) => s.kelas === "KB").length,
        tka: aktif.filter((s: any) => s.kelas === "TK A").length,
        tkb: aktif.filter((s: any) => s.kelas === "TK B").length,
      };
    },
  });

  const { data: tagihanStats } = useQuery({
    queryKey: ["tagihan-stats", currentMonth, currentYear],
    queryFn: async () => {
      const { count: total } = await supabase
        .from("tagihan_siswa")
        .select("*", { count: "exact", head: true })
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear);

      const { count: lunas } = await supabase
        .from("tagihan_siswa")
        .select("*", { count: "exact", head: true })
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .eq("statuspembayaran", "LUNAS");

      const { count: belumBayar } = await supabase
        .from("tagihan_siswa")
        .select("*", { count: "exact", head: true })
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .eq("statuspembayaran", "BELUM BAYAR");

      return { total: total || 0, lunas: lunas || 0, belumBayar: belumBayar || 0 };
    },
  });

  const { data: pemasukanStats } = useQuery({
    queryKey: ["pemasukan-stats", currentMonth, currentYear],
    queryFn: async () => {
      // Pemasukan bulan ini (tagihan LUNAS)
      const { data: bulanIniData } = await supabase
        .from("tagihan_siswa")
        .select("jumlahtagihan")
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .eq("statuspembayaran", "LUNAS");

      const bulanIni =
        bulanIniData?.reduce(
          (sum: number, item: any) => sum + parseFloat(item.jumlahtagihan || "0"),
          0
        ) || 0;

      // Tunggakan bulan ini (tagihan BELUM BAYAR)
      const { data: tunggakanData } = await supabase
        .from("tagihan_siswa")
        .select("jumlahtagihan")
        .eq("bulan", currentMonth)
        .eq("tahun", currentYear)
        .eq("statuspembayaran", "BELUM BAYAR");

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
          PAUD Aisyiyah Bustanul Athfal 1 Buduran
        </p>
      </div>

      {/* Sensus Siswa */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Data Siswa Aktif</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Aktif", value: siswaStats?.aktif || 0, color: "green" },
            { label: "Kelompok Bermain", value: siswaStats?.kb || 0, color: "blue" },
            { label: "TK A", value: siswaStats?.tka || 0, color: "purple" },
            { label: "TK B", value: siswaStats?.tkb || 0, color: "orange" },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground mt-1">siswa</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tagihan Bulan Ini */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tagihan — {bulanNama}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tagihanStats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sudah Lunas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {tagihanStats?.lunas || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {tagihanStats?.belumBayar || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pemasukan & Tunggakan Bulan Ini */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Keuangan — {bulanNama}</h2>
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