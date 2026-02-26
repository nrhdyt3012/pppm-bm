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

export default function RekapanPembayaran() {
  const supabase = createClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const currentMonthStr = useMemo(() => {
    return selectedMonth.toISOString().slice(0, 7);
  }, [selectedMonth]);

  // ✅ FIXED: Query dari tagihan_santri dengan join ke santri dan master_tagihan
  const {
    data: pembayaranData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pembayaran-data", currentMonthStr],
    queryFn: async () => {
      const { data: tagihanLunas, error } = await supabase
        .from("tagihan_santri")
        .select(`
          idTagihanSantri,
          jumlahTagihan,
          statusPembayaran,
          updatedAt,
          createdAt,
          santri:santri!idSantri(id, nama),
          master_tagihan:master_tagihan!idMasterTagihan(
            id_masterTagihan,
            periode,
            description,
            uang_makan,
            asrama,
            kas_pondok,
            sedekah_sukarela,
            aset_jariyah,
            uang_tahunan,
            iuran_kampung
          )
        `)
        .eq("statusPembayaran", "LUNAS")
        .gte("updatedAt", `${currentMonthStr}-01`)
        .lt("updatedAt", getNextMonth(currentMonthStr))
        .order("updatedAt", { ascending: false });

      if (error) {
        console.error("Error fetching pembayaran:", error);
        toast.error("Gagal memuat data pembayaran", {
          description: error.message,
        });
        return [];
      }

      // Transform ke format yang diharapkan
      return tagihanLunas?.map((item: any) => ({
        id_rekapan_pembayaran: item.idTagihanSantri,
        nama_santri: item.santri?.nama || "-",
        periode: item.master_tagihan?.periode || "-",
        jenis_tagihan: item.master_tagihan?.description || "-",
        jumlah_dibayar: item.jumlahTagihan,
        tanggal_pembayaran: item.updatedAt,
        metode_pembayaran: "Online Payment", // Default untuk payment yang lunas
        // Detail rincian untuk export
        detail_tagihan: {
          uang_makan: item.master_tagihan?.uang_makan || 0,
          asrama: item.master_tagihan?.asrama || 0,
          kas_pondok: item.master_tagihan?.kas_pondok || 0,
          sedekah_sukarela: item.master_tagihan?.sedekah_sukarela || 0,
          aset_jariyah: item.master_tagihan?.aset_jariyah || 0,
          uang_tahunan: item.master_tagihan?.uang_tahunan || 0,
          iuran_kampung: item.master_tagihan?.iuran_kampung || 0,
        },
      })) || [];
    },
  });

  // Query untuk grafik 6 bulan terakhir
  const { data: chartData } = useQuery({
    queryKey: ["chart-pembayaran"],
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
            .select("idTagihanSantri", { count: "exact", head: true })
            .eq("statusPembayaran", "LUNAS")
            .gte("updatedAt", `${month}-01`)
            .lt("updatedAt", getNextMonth(month));

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
    if (!pembayaranData) return 0;
    return pembayaranData.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.jumlah_dibayar || 0);
    }, 0);
  }, [pembayaranData]);

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
    if (!pembayaranData || pembayaranData.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = pembayaranData.map((item: any, index: number) => {
      return {
        No: index + 1,
        "ID Pembayaran": item.id_rekapan_pembayaran,
        "Nama Santri": item.nama_santri || "-",
        Periode: item.periode || "-",
        "Jenis Tagihan": item.jenis_tagihan || "-",
        "Uang Makan": parseFloat(item.detail_tagihan?.uang_makan || 0),
        Asrama: parseFloat(item.detail_tagihan?.asrama || 0),
        "Kas Pondok": parseFloat(item.detail_tagihan?.kas_pondok || 0),
        "Sedekah Sukarela": parseFloat(item.detail_tagihan?.sedekah_sukarela || 0),
        "Aset Jariyah": parseFloat(item.detail_tagihan?.aset_jariyah || 0),
        "Uang Tahunan": parseFloat(item.detail_tagihan?.uang_tahunan || 0),
        "Iuran Kampung": parseFloat(item.detail_tagihan?.iuran_kampung || 0),
        "Jumlah Dibayar": parseFloat(item.jumlah_dibayar || 0),
        "Metode Pembayaran": item.metode_pembayaran || "-",
        "Tanggal Pembayaran": new Date(item.tanggal_pembayaran).toLocaleDateString("id-ID"),
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pembayaran");

    const fileName = `Pembayaran_${currentMonthStr}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success("Data berhasil diekspor ke Excel");
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Rekapan Pembayaran</h1>

      {/* Grafik */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Pembayaran SPP (6 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#14b8a6" name="Jumlah Pembayaran" />
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
          disabled={!pembayaranData || pembayaranData.length === 0}
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
              {pembayaranData?.length || 0} Transaksi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Nominal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">
              {convertIDR(totalNominal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Data */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran SPP</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : !pembayaranData || pembayaranData.length === 0 ? (
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
                    <th className="text-left p-3 whitespace-nowrap w-[100px]">
                      ID Pembayaran
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[200px]">
                      Nama Santri
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[150px]">
                      Periode
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[250px]">
                      Jenis Tagihan
                    </th>
                    <th className="text-right p-3 whitespace-nowrap w-[150px]">
                      Nominal
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[150px]">
                      Metode
                    </th>
                    <th className="text-left p-3 whitespace-nowrap w-[150px]">
                      Tanggal Pembayaran
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pembayaranData.map((item: any, index: number) => (
                    <tr
                      key={item.id_rekapan_pembayaran}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-3 whitespace-nowrap">{index + 1}</td>
                      <td className="p-3 font-mono text-sm whitespace-nowrap">
                        {item.id_rekapan_pembayaran}
                      </td>
                      <td className="p-3 font-medium whitespace-nowrap">
                        {item.nama_santri || "-"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {item.periode || "-"}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="max-w-[250px]">
                          {item.jenis_tagihan || "-"}
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold whitespace-nowrap">
                        {convertIDR(parseFloat(item.jumlah_dibayar || 0))}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {item.metode_pembayaran || "-"}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {new Date(item.tanggal_pembayaran).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/30">
                    <td colSpan={5} className="p-3 text-right">
                      Total:
                    </td>
                    <td className="p-3 text-right text-teal-600 whitespace-nowrap">
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