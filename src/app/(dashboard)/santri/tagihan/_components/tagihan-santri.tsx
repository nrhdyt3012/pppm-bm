// File: src/app/(dashboard)/santri/tagihan/_components/tagihan-santri.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Receipt, AlertCircle } from "lucide-react";
import Script from "next/script";
import { environment } from "@/configs/environtment";

declare global {
  interface Window {
    snap: any;
  }
}

export default function TagihanSantri() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);

  // Fetch tagihan santri yang belum lunas
  const {
    data: tagihanList,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tagihan-santri", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_santri")
        .select(
          `
          id,
          order_id,
          customer_name,
          status,
          payment_token,
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
        .neq("status", "settled")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat data tagihan", {
          description: error.message,
        });
        return [];
      }

      return data || [];
    },
  });

  const handlePayment = async (order: any) => {
    try {
      // Hitung total dengan pajak dan biaya admin
      const subtotal = order.orders_menus.reduce(
        (sum: number, item: any) => sum + item.nominal,
        0
      );
      const tax = Math.round(subtotal * 0.12);
      const service = Math.round(subtotal * 0.05);
      const grandTotal = subtotal + tax + service;

      if (order.payment_token) {
        // Jika sudah ada token, langsung buka snap
        window.snap.pay(order.payment_token);
      } else {
        // Generate payment token
        const response = await fetch("/api/payment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: order.order_id,
            gross_amount: grandTotal,
            customer_name: order.customer_name,
          }),
        });

        const result = await response.json();

        if (result.token) {
          // Update payment token di database
          await supabase
            .from("orders")
            .update({ payment_token: result.token })
            .eq("order_id", order.order_id);

          // Buka Snap payment
          window.snap.pay(result.token);
        } else {
          toast.error("Gagal membuat pembayaran");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Terjadi kesalahan saat memproses pembayaran");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
      </div>
    );
  }

  return (
    <>
      <Script
        src={`${environment.MIDTRANS_API_URL}/snap/snap.js`}
        data-client-key={environment.MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tagihan SPP</h1>
          <p className="text-muted-foreground">
            Daftar tagihan SPP yang harus dibayar
          </p>
        </div>

        {!tagihanList || tagihanList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Tidak ada tagihan</p>
              <p className="text-sm text-muted-foreground">
                Anda tidak memiliki tagihan yang belum dibayar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tagihanList.map((tagihan: any) => {
              const subtotal = tagihan.orders_menus.reduce(
                (sum: number, item: any) => sum + item.nominal,
                0
              );
              const tax = Math.round(subtotal * 0.12);
              const service = Math.round(subtotal * 0.05);
              const grandTotal = subtotal + tax + service;

              return (
                <Card
                  key={tagihan.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-teal-500" />
                          {tagihan.orders_menus[0]?.menus?.periode ||
                            "Tagihan SPP"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Order ID: {tagihan.order_id}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full text-sm font-medium">
                        Belum Dibayar
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Detail Tagihan */}
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
                        <span>Total</span>
                        <span className="text-teal-600">
                          {convertIDR(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Rincian Item */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Rincian:</p>
                      {tagihan.orders_menus.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-sm text-muted-foreground pl-4"
                        >
                          • {item.notes || item.menus?.name}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePayment(tagihan)}
                      className="w-full bg-teal-500 hover:bg-teal-600"
                    >
                      Bayar Sekarang
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
