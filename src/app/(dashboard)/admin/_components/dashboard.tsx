"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const supabase = createClient();

  // Get current month
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Query untuk Sensus Santri
  const { data: santriStats } = useQuery({
    queryKey: ["santri-stats"],
    queryFn: async () => {
      // Total santri
      const { count: totalSantri } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .neq("role", "admin");

      // Santri laki-laki
      const { count: santriLaki } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("jenis_kelamin", "Laki-laki")
        .neq("role", "admin");

      // Santri perempuan
      const { count: santriPerempuan } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("jenis_kelamin", "Perempuan")
        .neq("role", "admin");

      return {
        total: totalSantri || 0,
        lakiLaki: santriLaki || 0,
        perempuan: santriPerempuan || 0,
      };
    },
  });

  // Query untuk Tagihan
  const { data: tagihanStats } = useQuery({
    queryKey: ["tagihan-stats", currentMonth],
    queryFn: async () => {
      // Tagihan bulan ini
      const { count: tagihanBulanIni } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${currentMonth}-01`)
        .lt("created_at", getNextMonth(currentMonth));

      // Tagihan yang sudah terbayar
      const { count: tagihanTerbayar } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "settled")
        .gte("created_at", `${currentMonth}-01`)
        .lt("created_at", getNextMonth(currentMonth));

      // Tagihan yang belum terbayar
      const { count: tagihanBelumTerbayar } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .neq("status", "settled")
        .gte("created_at", `${currentMonth}-01`)
        .lt("created_at", getNextMonth(currentMonth));

      return {
        bulanIni: tagihanBulanIni || 0,
        sudahTerbayar: tagihanTerbayar || 0,
        belumTerbayar: tagihanBelumTerbayar || 0,
      };
    },
  });

  // Query untuk Pemasukan
  const { data: pemasukanStats } = useQuery({
    queryKey: ["pemasukan-stats", currentMonth],
    queryFn: async () => {
      // Pemasukan bulan ini
      const { data: ordersBulanIni } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          orders_menus(nominal)
        `
        )
        .eq("status", "settled")
        .gte("created_at", `${currentMonth}-01`)
        .lt("created_at", getNextMonth(currentMonth));

      const pemasukanBulanIni =
        ordersBulanIni?.reduce((sum, order) => {
          const orderTotal = order.orders_menus.reduce(
            (s: number, om: any) => s + om.nominal,
            0
          );
          // Hitung dengan pajak dan admin
          const subtotal = orderTotal;
          const tax = Math.round(subtotal * 0.12);
          const service = Math.round(subtotal * 0.05);
          return sum + subtotal + tax + service;
        }, 0) || 0;

      // Pemasukan minggu ini
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: ordersMingguIni } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          orders_menus(nominal)
        `
        )
        .eq("status", "settled")
        .gte("created_at", weekAgo.toISOString())
        .lte("created_at", today.toISOString());

      const pemasukanMingguIni =
        ordersMingguIni?.reduce((sum, order) => {
          const orderTotal = order.orders_menus.reduce(
            (s: number, om: any) => s + om.nominal,
            0
          );
          const subtotal = orderTotal;
          const tax = Math.round(subtotal * 0.12);
          const service = Math.round(subtotal * 0.05);
          return sum + subtotal + tax + service;
        }, 0) || 0;

      return {
        bulanIni: pemasukanBulanIni,
        mingguIni: pemasukanMingguIni,
      };
    },
  });

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Sensus Santri */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sensus Santri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Santri Laki - laki
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {santriStats?.lakiLaki || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Santri Perempuan
              </CardTitle>
              <Users className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {santriStats?.perempuan || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Santri
              </CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {santriStats?.total || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tagihan */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tagihan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tagihan Terbit Bulan Ini
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {tagihanStats?.bulanIni || 0} Tagihan
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tagihan Sudah Terbayar
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {tagihanStats?.sudahTerbayar || 0} Tagihan
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tagihan Belum Terbayar
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {tagihanStats?.belumTerbayar || 0} Tagihan
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pemasukan */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pemasukan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pemasukan Bulan Ini
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {convertIDR(pemasukanStats?.bulanIni || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pemasukan Minggu Ini
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600">
                {convertIDR(pemasukanStats?.mingguIni || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getNextMonth(monthStr: string): string {
  const date = new Date(monthStr + "-01");
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 7) + "-01";
}
