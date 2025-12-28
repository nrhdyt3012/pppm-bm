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
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_id,
          customer_name,
          status,
          created_at,
          orders_menus(
            nominal,
            menus(name)
          )
        `
        )
        .neq("status", "settled")
        .gte("created_at", `${currentMonthStr}-01`)
        .lt("created_at", getNextMonth(currentMonthStr))
        .order("created_at");

      if (error) {
        toast.error("Gagal memuat data tunggakan", {
          description: error.message,
        });
        return [];
      }

      return orders || [];
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
            .from("orders")
            .select("id", { count: "exact", head: true })
            .neq("status", "settled")
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
    return tunggakanData.reduce((sum, order: any) => {
      const orderTotal = order.orders_menus.reduce(
        (s: number, om: any) => s + om.nominal,
        0
      );
      return sum + orderTotal;
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

    const exportData = tunggakanData.map((order: any, index: number) => {
      const nominal = order.orders_menus.reduce(
        (sum: number, om: any) => sum + om.nominal,
        0
      );
      const items = order.orders_menus
        .map((om: any) => om.menus.name)
        .join(", ");

      return {
        No: index + 1,
        "Order ID": order.order_id,
        "Nama Santri": order.customer_name,
        "Jenis Tagihan": items,
        Nominal: nominal,
        Status: "Belum Bayar",
        Tanggal: new Date(order.created_at).toLocaleDateString("id-ID"),
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
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">No</th>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">Nama Santri</th>
                    <th className="text-left p-3">Jenis Tagihan</th>
                    <th className="text-right p-3">Nominal</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-left p-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {tunggakanData.map((order: any, index: number) => {
                    const nominal = order.orders_menus.reduce(
                      (sum: number, om: any) => sum + om.nominal,
                      0
                    );
                    return (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-mono text-sm">
                          {order.order_id}
                        </td>
                        <td className="p-3 font-medium">
                          {order.customer_name}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {order.orders_menus
                            .map((om: any) => om.menus.name)
                            .join(", ")}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {convertIDR(nominal)}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Belum Bayar
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          {new Date(order.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={4} className="p-3 text-right">
                      Total:
                    </td>
                    <td className="p-3 text-right text-red-600">
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
