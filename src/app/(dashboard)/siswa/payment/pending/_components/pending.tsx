"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function Pending() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id") ?? "";
  const pembayaran_id = searchParams.get("pembayaran_id") ?? "";
  const supabase = createClient();

  // Polling status tagihan setiap 5 detik
  // Jika webhook masuk dan tagihan jadi LUNAS, redirect otomatis
  const { data: tagihanStatus } = useQuery({
    queryKey: ["pending-status", order_id],
    enabled: !!order_id,
    refetchInterval: 5_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("tagihan_siswa")
        .select("statuspembayaran")
        .eq("idtagihansiswa", order_id)
        .single();
      return data;
    },
  });

  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (
      tagihanStatus?.statuspembayaran === "LUNAS" &&
      !redirected
    ) {
      setRedirected(true);
      // Tagihan sudah lunas (webhook berhasil) → redirect ke success
      window.location.href = `/siswa/payment/success?order_id=${order_id}&pembayaran_id=${pembayaran_id}`;
    }
  }, [tagihanStatus, redirected, order_id, pembayaran_id]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold mb-2">
                Pembayaran Menunggu Konfirmasi
              </h1>
              <p className="text-muted-foreground text-sm">
                Selesaikan pembayaran sesuai instruksi yang diberikan.
                Status akan diperbarui otomatis setelah pembayaran
                dikonfirmasi.
              </p>
            </div>

            {/* Info tagihan */}
            {order_id && (
              <div className="w-full p-4 bg-muted rounded-lg text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ID Tagihan:
                  </span>
                  <span className="font-mono font-medium">
                    #{order_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-yellow-600 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Menunggu Pembayaran
                  </span>
                </div>
              </div>
            )}

            {/* Info metode */}
            <div className="w-full p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 text-left">
              <p className="font-semibold mb-2">Yang perlu kamu lakukan:</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Transfer Bank / VA:</strong> Transfer ke nomor
                    virtual account yang diberikan Midtrans sebelum batas
                    waktu.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>GoPay / ShopeePay:</strong> Buka aplikasi dan
                    selesaikan pembayaran dari notifikasi.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Gerai (Indomaret/Alfamart):</strong> Tunjukkan
                    kode pembayaran ke kasir.
                  </span>
                </li>
              </ul>
            </div>

            {/* Polling indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>
                Memantau status pembayaran secara otomatis...
              </span>
            </div>

            {/* Tombol */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/siswa/tagihan" className="flex-1">
                <Button variant="outline" className="w-full">
                  Kembali ke Tagihan
                </Button>
              </Link>
              <Link href="/siswa/riwayat" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Lihat Riwayat
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              Jika sudah membayar tapi status belum berubah dalam 15
              menit, hubungi admin/bendahara PAUD.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}