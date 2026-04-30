"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

const BULAN_NAMA = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function RekapanTunggakan() {
  const supabase = createClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: tunggakanData, isLoading } = useQuery({
    queryKey: ["rekapan-tunggakan", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_siswa")
        .select(`
          idtagihansiswa,
          jumlahtagihan,
          statuspembayaran,
          bulan,
          tahun,
          createdat,
          siswa:siswa!idsiswa(id, namasiswa, kelas, nowa),
          master_tagihan:master_tagihan!idmastertagihan(namatagihan, jenjang, jenistagihan)
        `)
        .eq("statuspembayaran", "BELUM BAYAR")
        .eq("bulan", selectedMonth)
        .eq("tahun", selectedYear)
        .order("createdat", { ascending: false });

      if (error) {
        toast.error("Gagal memuat data", { description: error.message });
        return [];
      }
      return data || [];
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["chart-tunggakan"],
    queryFn: async () => {
      const results = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const { count } = await supabase
          .from("tagihan_siswa")
          .select("*", { count: "exact", head: true })
          .eq("statuspembayaran", "BELUM BAYAR")
          .eq("bulan", m)
          .eq("tahun", y);
        results.push({ name: `${BULAN_NAMA[m].slice(0, 3)} ${y.toString().slice(2)}`, total: count || 0 });
      }
      return results;
    },
  });

  const totalNominal = useMemo(() =>
    tunggakanData?.reduce((s: number, i: any) => s + parseFloat(i.jumlahtagihan || 0), 0) || 0,
    [tunggakanData]
  );

  const handlePrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const handleExport = () => {
    if (!tunggakanData?.length) { toast.error("Tidak ada data"); return; }
    const rows = tunggakanData.map((item: any, i: number) => ({
      No: i + 1,
      "ID Tagihan": item.idtagihansiswa,
      "Nama Siswa": item.siswa?.namasiswa || "-",
      "Kelas": item.siswa?.kelas || "-",
      "No. WA Wali": item.siswa?.nowa || "-",
      "Nama Tagihan": item.master_tagihan?.namatagihan || "-",
      "Jenjang": item.master_tagihan?.jenjang || "-",
      "Bulan": BULAN_NAMA[item.bulan],
      "Tahun": item.tahun,
      "Jumlah Tunggakan": parseFloat(item.jumlahtagihan || 0),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tunggakan");
    XLSX.writeFile(wb, `Tunggakan_${BULAN_NAMA[selectedMonth]}_${selectedYear}.xlsx`);
    toast.success("Data berhasil diekspor");
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Rekapan Tunggakan</h1>

      <Card>
        <CardHeader><CardTitle>Grafik Tunggakan (6 Bulan Terakhir)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#dc2626" name="Jumlah Tunggakan" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg font-semibold">{BULAN_NAMA[selectedMonth]} {selectedYear}</h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button onClick={handleExport} disabled={!tunggakanData?.length} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />Export Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Jumlah Tunggakan</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{tunggakanData?.length || 0} Siswa</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Nominal Tunggakan</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{convertIDR(totalNominal)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Siswa Belum Bayar</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : !tunggakanData?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada tunggakan untuk periode ini 🎉
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
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
                  {tunggakanData.map((item: any, i: number) => (
                    <tr key={item.idtagihansiswa} className="border-b hover:bg-muted/50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-medium">{item.siswa?.namasiswa || "-"}</td>
                      <td className="p-3">{item.siswa?.kelas || "-"}</td>
                      <td className="p-3">{item.siswa?.nowa || "-"}</td>
                      <td className="p-3">{item.master_tagihan?.namatagihan || "-"}</td>
                      <td className="p-3 text-right font-semibold">{convertIDR(parseFloat(item.jumlahtagihan || 0))}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                          Belum Bayar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/30">
                    <td colSpan={5} className="p-3 text-right">Total:</td>
                    <td className="p-3 text-right text-red-600">{convertIDR(totalNominal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}