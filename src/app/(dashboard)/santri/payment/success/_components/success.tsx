// src/app/(dashboard)/santri/payment/success/_components/success.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Success() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const [isUpdating, setIsUpdating] = useState(true);

  const { mutate } = useMutation({
    mutationKey: ["mutateUpdateStatusTagihan"],
    mutationFn: async () => {
      const { error } = await supabase
        .from("tagihan_santri")
        .update({
          status_pembayaran: "LUNAS",
          updated_at: new Date().toISOString(),
        })
        .eq("id_tagihan_santri", order_id);

      if (error) throw error;
    },
    onSuccess: () => {
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Update error:", error);
      setIsUpdating(false);
    },
  });

  useEffect(() => {
    if (order_id) {
      mutate();
    }
  }, [order_id]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 text-center">
            {isUpdating ? (
              <>
                <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Memproses Pembayaran
                  </h1>
                  <p className="text-muted-foreground">
                    Mohon tunggu sebentar...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Pembayaran Berhasil!
                  </h1>
                  <p className="text-muted-foreground">
                    Terima kasih, pembayaran SPP Anda telah berhasil diproses.
                  </p>
                </div>
                {order_id && (
                  <div className="w-full space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ID Tagihan:</span>
                      <span className="font-mono font-medium">{order_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Lunas
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link href="/santri/tagihan" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Lihat Tagihan Lain
                    </Button>
                  </Link>
                  <Link href="/santri/riwayat" className="flex-1">
                    <Button className="w-full bg-teal-500 hover:bg-teal-600">
                      Lihat Riwayat
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
