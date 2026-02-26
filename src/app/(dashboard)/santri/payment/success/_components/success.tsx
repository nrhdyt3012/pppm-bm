// src/app/(dashboard)/santri/payment/success/_components/success.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { confirmPayment } from "../../actions";

function extractTagihanId(orderId: string): string {
  if (!orderId) return "";
  if (orderId.startsWith("PPPM-")) {
    const parts = orderId.split("-");
    return parts[1];
  }
  return orderId;
}

export default function Success() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("order_id") ?? "";
  const tagihanId = extractTagihanId(rawOrderId);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!tagihanId || hasRun.current) return;
    hasRun.current = true;
    runConfirm();
  }, [tagihanId]);

  const runConfirm = async () => {
    try {
      console.log("🔍 rawOrderId:", rawOrderId);
      console.log("🔍 tagihanId:", tagihanId);

      const result = await confirmPayment(tagihanId, rawOrderId);

      console.log("📊 confirmPayment result:", result);

      if (result.status === "success") {
        setStatus("success");
      } else {
        setErrorMsg(result.message ?? "Terjadi kesalahan");
        setStatus("error");
      }
    } catch (err: any) {
      console.error("💥 Unexpected error:", err);
      setErrorMsg(err.message ?? "Terjadi kesalahan tidak terduga");
      setStatus("error");
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center">

            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
                <div>
                  <h1 className="text-2xl font-bold mb-2">Memverifikasi Pembayaran</h1>
                  <p className="text-muted-foreground">Mohon tunggu sebentar...</p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
                  <p className="text-muted-foreground">
                    Terima kasih, pembayaran SPP Anda telah berhasil diproses.
                  </p>
                </div>
                <div className="w-full space-y-2 p-4 bg-muted rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Tagihan:</span>
                    <span className="font-mono font-medium">#{tagihanId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Lunas ✓</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link href="/santri/tagihan" className="flex-1">
                    <Button variant="outline" className="w-full">Lihat Tagihan Lain</Button>
                  </Link>
                  <Link href="/santri/riwayat" className="flex-1">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600">Lihat Riwayat</Button>
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Gagal Memperbarui Status</h1>
                  <p className="text-muted-foreground text-sm break-words">{errorMsg}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStatus("loading");
                      hasRun.current = false;
                      runConfirm();
                    }}
                  >
                    Coba Lagi
                  </Button>
                  <Link href="/santri/tagihan" className="flex-1">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600">
                      Kembali ke Tagihan
                    </Button>
                  </Link>
                </div>
              </>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}