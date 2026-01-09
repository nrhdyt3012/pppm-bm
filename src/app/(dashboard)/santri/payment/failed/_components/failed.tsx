"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Failed() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-red-50 to-white dark:from-gray-900 dark:via-red-950 dark:to-gray-900 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
              <p className="text-muted-foreground">
                Maaf, pembayaran SPP Anda tidak dapat diproses. Silakan coba
                lagi.
              </p>
            </div>
            {order_id && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Tagihan:</span>
                  <span className="font-mono font-medium">{order_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Gagal
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/santri/tagihan" className="flex-1">
                <Button className="w-full bg-teal-500 hover:bg-teal-600">
                  Kembali ke Tagihan
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Jika masalah berlanjut, silakan hubungi bagian administrasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
