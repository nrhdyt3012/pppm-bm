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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

export default function RekapanTunggakan() {
  const supabase = createClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const currentMonthStr = useMemo(() => {
    return selectedMonth.toISOString().slice(0, 7);
  }, [selectedMonth]);

  const { data: tunggakanData, isLoading } = useQuery({
    queryKey: ["tunggakan-data", currentMonthStr],
    queryFn: async () => {
      const { data: tagihan, error } = await supabase
        .from("tagihan_santri")
        .select(
          `
          id_tagihan_santri,
          jumlah_tagihan,
          status_pembayaran,
          created_at,
          updated_at,
          santri:profiles!id_santri(id, name),
          master_tagihan:master_tagihan!id_master_tagihan(
            id,
            periode,
            description,
            uang_makan,
            asrama,
            kas_pondok,
            shodaqoh_sukarela,
            jariyah_sb,
            uang_tahunan,
            iuran_kampung
          )
        `
        )
        .eq("status_pembayaran", "BELUM BAYAR")
        .gte("created_at", `${currentMonthStr}-01`)
        .lt("created_at", getNextMonth(currentMonthStr))
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat data tunggakan", {
          description: error.message,
        });
        return [];
      }

      return tagihan || [];
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["chart-tunggakan"],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        months.push(monthStr);
      }

      const result = await Promise.all(
        months.map(async (month) => {
          const { count } = await supabase
            .from("tagihan_santri")
            .select("id_tagihan_santri", { count: "exact", head: true })
            .eq("status_pembayaran", "BELUM BAYAR")
            .gte("created_at", `${month}-01`)
            .lt("created_at", getNextMonth(month));

          return {
            name: formatMonthName(month),
            total: count || 0,
          };
        })
      );

      return result;
    },
  });

  const totalNominal = useMemo(() => {
    if (!tunggakanData) return 0;
    return tunggakanData.reduce((sum, item: any) => {
      return sum + parseFloat(item.jumlah_tagihan || 0);
    }, 0);
  }, [tunggakanData]);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleExportExcel = () => {
    if (!tunggakanData || tunggakanData.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = tunggakanData.map((item: any, index: number) => {
      return {
        No: index + 1,
        "ID Tagihan": item.id_tagihan_santri,
        "Nama Santri": item.santri?.name || "-",
        Periode: item.master_tagihan?.periode || "-",
        "Jenis Tagihan": getJenisTagihan(item.master_tagihan),
        "Jumlah Tagihan": parseFloat(item.jumlah_tagihan || 0),
        Status: "Belum Bayar",
        "Tanggal Tagihan": new Date(item.created_at).toLocaleDateString(
          "id-ID"
        ),
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tunggakan");

    const fileName = `Tunggakan_${currentMonthStr}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success("Data berhasil diekspor ke Excel");
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Rekapan Tunggakan</h1>

      {/* Grafik */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Tunggakan SPP (6 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#ef4444" name="Jumlah Tunggakan" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Navigasi Bulan & Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {selectedMonth.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={!tunggakanData || tunggakanData.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {tunggakanData?.length || 0} Santri
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Nominal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {convertIDR(totalNominal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri yang Belum Membayar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : !tunggakanData || tunggakanData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data untuk bulan ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 whitespace-nowrap w-[50px]">
                      No
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[180px]">
                      ID Tagihan
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[200px]">
                      Nama Santri
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[180px]">
                      Periode
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[250px]">
                      Jenis Tagihan
                    </th>
                    <th className="text-right p-3 whitespace-nowrap w-[150px]">
                      Nominal
                    </th>
                    <th className="text-center p-3 whitespace-nowrap w-[130px]">
                      Status
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[150px]">
                      Tanggal Tagihan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tunggakanData.map((item: any, index: number) => (
                    <tr
                      key={item.id_tagihan_santri}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-3 whitespace-nowrap">{index + 1}</td>
                      <td className="p-3 font-mono text-sm whitespace-nowrap">
                        {item.id_tagihan_santri}
                      </td>
                      <td className="p-3 font-medium whitespace-nowrap">
                        {item.santri?.name || "-"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div>
                          <p className="font-semibold">
                            {item.master_tagihan?.periode || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.master_tagihan?.description || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="max-w-[250px]">
                          {getJenisTagihan(item.master_tagihan)}
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold whitespace-nowrap">
                        {convertIDR(parseFloat(item.jumlah_tagihan || 0))}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 whitespace-nowrap inline-block">
                            Belum Bayar
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/30">
                    <td colSpan={5} className="p-3 text-right">
                      Total:
                    </td>
                    <td className="p-3 text-right text-red-600 whitespace-nowrap">
                      {convertIDR(totalNominal)}
                    </td>
                    <td colSpan={2}></td>
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

// Helper functions
function getNextMonth(monthStr: string): string {
  const date = new Date(monthStr + "-01");
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 7) + "-01";
}

function formatMonthName(monthStr: string): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const [year, month] = monthStr.split("-");
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

function getJenisTagihan(masterTagihan: any): string {
  if (!masterTagihan) return "-";

  const items = [];
  if (masterTagihan.uang_makan > 0) items.push("Uang Makan");
  if (masterTagihan.asrama > 0) items.push("Asrama");
  if (masterTagihan.kas_pondok > 0) items.push("Kas Pondok");
  if (masterTagihan.shodaqoh_sukarela > 0) items.push("Shodaqoh");
  if (masterTagihan.jariyah_sb > 0) items.push("Jariyah SB");
  if (masterTagihan.uang_tahunan > 0) items.push("Uang Tahunan");
  if (masterTagihan.iuran_kampung > 0) items.push("Iuran Kampung");

  return items.length > 0 ? items.join(", ") : "-";
}
