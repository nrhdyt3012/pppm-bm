"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { confirmPayment } from "../../actions";
import { convertIDR } from "@/lib/utils";

function extractTagihanId(orderId: string): string {
  if (!orderId) return "";
  if (orderId.startsWith("PPPM-")) {
    return orderId.split("-")[1];
  }
  return orderId;
}

function extractPembayaranId(orderId: string): number | undefined {
  if (!orderId?.startsWith("PPPM-")) return undefined;
  const parts = orderId.split("-");
  if (parts.length >= 4) {
    const parsed = parseInt(parts[2]);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

type SuccessData = {
  jumlahBayar: number;
  sisaTagihan: number;
  statusBaru: string;
  tagihanId: string;
  pembayaranId?: number;
};

export default function Success() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("order_id") ?? "";
  const amountParam = searchParams.get("amount");
  const pembayaranIdParam = searchParams.get("pembayaran_id");

  const tagihanId = extractTagihanId(rawOrderId);
  // Midtrans selalu full payment, amount dari URL sebagai fallback saja
  const nominalBayar = amountParam ? parseFloat(amountParam) : undefined;
  const pembayaranId = pembayaranIdParam
    ? parseInt(pembayaranIdParam)
    : extractPembayaranId(rawOrderId);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!tagihanId || hasRun.current) return;
    hasRun.current = true;
    runConfirm();
  }, [tagihanId]);

  const runConfirm = async () => {
    try {
      const result = await confirmPayment(tagihanId, rawOrderId, nominalBayar, pembayaranId);
      if (result.status === "success") {
        setSuccessData(result.data as SuccessData);
        setStatus("success");
      } else {
        setErrorMsg(result.message ?? "Terjadi kesalahan");
        setStatus("error");
      }
    } catch (err: any) {
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
                <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                <div>
                  <h1 className="text-xl font-bold mb-2">Memverifikasi Pembayaran</h1>
                  <p className="text-muted-foreground text-sm">Mohon tunggu sebentar...</p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <div>
                  <h1 className="text-xl font-bold mb-2">Pembayaran Berhasil!</h1>
                  <p className="text-muted-foreground text-sm">
                    Tagihan #{tagihanId} telah lunas.
                  </p>
                </div>

                <div className="w-full p-4 bg-muted rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Tagihan:</span>
                    <span className="font-mono font-medium">#{tagihanId}</span>
                  </div>
                  {successData?.jumlahBayar != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Dibayar:</span>
                      <span className="font-semibold text-green-600">
                        {convertIDR(successData.jumlahBayar)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">Lunas ✓</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link href="/siswa/tagihan" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Lihat Tagihan Lain
                    </Button>
                  </Link>
                  <Link href="/siswa/riwayat" className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Lihat Riwayat & Kwitansi
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-2">Gagal Memperbarui Status</h1>
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
                  <Link href="/siswa/tagihan" className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
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