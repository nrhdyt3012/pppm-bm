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
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-2">Pembayaran Gagal</h1>
              <p className="text-muted-foreground text-sm">
                Maaf, pembayaran tidak dapat diproses. Silakan coba lagi.
              </p>
            </div>
            {order_id && (
              <div className="w-full p-4 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Tagihan:</span>
                  <span className="font-mono">#{order_id}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-red-600 font-medium">Gagal</span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/siswa/tagihan" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Kembali ke Tagihan
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Jika masalah berlanjut, hubungi admin/bendahara PAUD.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}