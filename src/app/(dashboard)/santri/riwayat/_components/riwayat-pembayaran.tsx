// File: src/app/(dashboard)/santri/riwayat/_components/riwayat-pembayaran.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Receipt,
  Download,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function RiwayatPembayaran() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);

  const { data: riwayatList, isLoading } = useQuery({
    queryKey: ["riwayat-pembayaran", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_id,
          customer_name,
          status,
          created_at,
          orders_menus(
            id,
            nominal,
            notes,
            menus(name, periode, description)
          )
        `
        )
        .eq("customer_name", profile.name)
        .eq("status", "settled")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat riwayat pembayaran", {
          description: error.message,
        });
        return [];
      }

      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
        <p className="text-muted-foreground">
          Riwayat pembayaran SPP yang telah dilakukan
        </p>
      </div>

      {!riwayatList || riwayatList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Belum ada riwayat pembayaran</p>
            <p className="text-sm text-muted-foreground">
              Riwayat pembayaran akan muncul di sini setelah Anda melakukan
              pembayaran
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {riwayatList.map((pembayaran: any) => {
            const subtotal = pembayaran.orders_menus.reduce(
              (sum: number, item: any) => sum + item.nominal,
              0
            );
            const tax = Math.round(subtotal * 0.12);
            const service = Math.round(subtotal * 0.05);
            const grandTotal = subtotal + tax + service;

            return (
              <ReceiptCard
                key={pembayaran.id}
                pembayaran={pembayaran}
                subtotal={subtotal}
                tax={tax}
                service={service}
                grandTotal={grandTotal}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReceiptCard({
  pembayaran,
  subtotal,
  tax,
  service,
  grandTotal,
}: {
  pembayaran: any;
  subtotal: number;
  tax: number;
  service: number;
  grandTotal: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Kwitansi-${pembayaran.order_id}`,
  });

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-500" />
                {pembayaran.orders_menus[0]?.menus?.periode || "Pembayaran SPP"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Order ID: {pembayaran.order_id}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Lunas
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(pembayaran.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{convertIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pajak (12%)</span>
              <span>{convertIDR(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Biaya Admin (5%)</span>
              <span>{convertIDR(service)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Dibayar</span>
              <span className="text-teal-600">{convertIDR(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Rincian:</p>
            {pembayaran.orders_menus.map((item: any, idx: number) => (
              <div key={idx} className="text-sm text-muted-foreground pl-4">
                • {item.notes || item.menus?.name}
              </div>
            ))}
          </div>

          <Button onClick={handlePrint} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Cetak Kwitansi
          </Button>
        </CardContent>
      </Card>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <div
          ref={contentRef}
          className="p-8 max-w-2xl mx-auto bg-white text-black"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <h1 className="text-2xl font-bold">PONDOK PESANTREN</h1>
            <h2 className="text-xl font-bold">BAITUL MAKMUR</h2>
            <p className="text-sm mt-2">
              Jl. Contoh Alamat No. 123, Surabaya, Jawa Timur
            </p>
            <p className="text-sm">Telp: (031) 1234567</p>
          </div>

          {/* Kwitansi Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold">KWITANSI PEMBAYARAN SPP</h3>
          </div>

          {/* Detail Transaksi */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="font-medium">No. Kwitansi:</span>
              <span>{pembayaran.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tanggal:</span>
              <span>
                {new Date(pembayaran.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nama Santri:</span>
              <span>{pembayaran.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Periode:</span>
              <span>{pembayaran.orders_menus[0]?.menus?.periode}</span>
            </div>
          </div>

          {/* Tabel Rincian */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left py-2">Keterangan</th>
                <th className="text-right py-2">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {pembayaran.orders_menus.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="py-2">{item.notes || item.menus?.name}</td>
                  <td className="text-right py-2">
                    {convertIDR(item.nominal)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-300">
                <td className="py-2">Pajak (12%)</td>
                <td className="text-right py-2">{convertIDR(tax)}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2">Biaya Admin (5%)</td>
                <td className="text-right py-2">{convertIDR(service)}</td>
              </tr>
              <tr className="border-t-2 border-gray-400 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="text-right py-2">{convertIDR(grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-8 flex justify-between">
            <div className="text-center">
              <p className="mb-16">Penerima,</p>
              <p className="border-t border-black pt-1 inline-block px-8">
                {pembayaran.customer_name}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-16">Bendahara,</p>
              <p className="border-t border-black pt-1 inline-block px-8">
                (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-600">
            <p>Kwitansi ini sah dan diproses secara elektronik</p>
            <p>Simpan sebagai bukti pembayaran yang sah</p>
          </div>
        </div>
      </div>
    </>
  );
}
