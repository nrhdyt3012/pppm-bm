"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Receipt,
  AlertCircle,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import Script from "next/script";
import { environment } from "@/configs/environtment";
import { useState } from "react";

declare global {
  interface Window {
    snap: any;
  }
}

export default function TagihanSantri() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);
  const [selectedTagihan, setSelectedTagihan] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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
          id_tagihan_santri,
          jumlah_tagihan,
          status_pembayaran,
          payment_token,
          created_at,
          updated_at,
          master_tagihan:master_tagihan!id_master_tagihan(
            id,
            periode,
            description,
            uang_makan,
            asrama,
            kas_pondok,
            shodaqoh_sukarela,
            jariyah_sb,
            uang_tahunan,
            iuran_kampung
          )
        `
        )
        .eq("id_santri", profile.id)
        .eq("status_pembayaran", "BELUM BAYAR")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tagihan:", error);
        toast.error("Gagal memuat data tagihan", {
          description: error.message,
        });
        return [];
      }

      return data || [];
    },
  });

  // Fetch data santri untuk dialog
  const { data: santriData } = useQuery({
    queryKey: ["santri-detail-payment", profile.id],
    queryFn: async () => {
      const result = await supabase.rpc("get_santri_with_details", {
        search_term: "",
        page_limit: 1,
        page_offset: 0,
      });

      if (result.error) {
        console.error("Error fetching santri data:", result.error);
        return null;
      }

      const currentUserData = result.data?.find(
        (item: any) => item.id === profile.id
      );

      return currentUserData || null;
    },
  });

  const handleOpenPaymentDialog = (tagihan: any) => {
    setSelectedTagihan(tagihan);
    setShowPaymentDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedTagihan) return;

    try {
      const jumlahTagihan = parseFloat(selectedTagihan.jumlah_tagihan || 0);

      if (selectedTagihan.payment_token) {
        // Jika sudah ada token, langsung buka snap
        window.snap.pay(selectedTagihan.payment_token);
        setShowPaymentDialog(false);
      } else {
        // Generate payment token
        const response = await fetch("/api/payment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: selectedTagihan.id_tagihan_santri,
            gross_amount: jumlahTagihan,
            customer_name: santriData?.name || profile.name,
          }),
        });

        const result = await response.json();

        if (result.token) {
          // Update payment token di database
          await supabase
            .from("tagihan_santri")
            .update({ payment_token: result.token })
            .eq("id_tagihan_santri", selectedTagihan.id_tagihan_santri);

          // Buka Snap payment
          window.snap.pay(result.token);
          setShowPaymentDialog(false);
        } else {
          toast.error("Gagal membuat pembayaran");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Terjadi kesalahan saat memproses pembayaran");
    }
  };

  const getJenisTagihan = (masterTagihan: any): string[] => {
    if (!masterTagihan) return [];

    const items = [];
    if (masterTagihan.uang_makan > 0)
      items.push(`Uang Makan: ${convertIDR(masterTagihan.uang_makan)}`);
    if (masterTagihan.asrama > 0)
      items.push(`Asrama: ${convertIDR(masterTagihan.asrama)}`);
    if (masterTagihan.kas_pondok > 0)
      items.push(`Kas Pondok: ${convertIDR(masterTagihan.kas_pondok)}`);
    if (masterTagihan.shodaqoh_sukarela > 0)
      items.push(`Shodaqoh: ${convertIDR(masterTagihan.shodaqoh_sukarela)}`);
    if (masterTagihan.jariyah_sb > 0)
      items.push(`Jariyah SB: ${convertIDR(masterTagihan.jariyah_sb)}`);
    if (masterTagihan.uang_tahunan > 0)
      items.push(`Uang Tahunan: ${convertIDR(masterTagihan.uang_tahunan)}`);
    if (masterTagihan.iuran_kampung > 0)
      items.push(`Iuran Kampung: ${convertIDR(masterTagihan.iuran_kampung)}`);

    return items;
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 whitespace-nowrap">No</th>
                  <th className="text-left p-3 whitespace-nowrap">Nama</th>
                  <th className="text-center p-3 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {tagihanList.map((tagihan: any, index: number) => (
                  <tr
                    key={tagihan.id_tagihan_santri}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-3 whitespace-nowrap">{index + 1}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">
                          {tagihan.master_tagihan?.periode || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tagihan.master_tagihan?.description || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <Button
                          onClick={() => handleOpenPaymentDialog(tagihan)}
                          className="bg-teal-500 hover:bg-teal-600"
                        >
                          Bayar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-teal-500" />
              Detail Pembayaran
            </DialogTitle>
            <DialogDescription>
              Periksa detail pembayaran sebelum melanjutkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Data Pribadi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-teal-500 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nama Lengkap
                    </p>
                    <p className="font-medium">
                      {santriData?.name || profile.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-500 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tempat Lahir
                    </p>
                    <p className="font-medium">
                      {santriData?.tempatLahir || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-teal-500 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tanggal Lahir
                    </p>
                    <p className="font-medium">
                      {santriData?.tanggalLahir
                        ? new Date(santriData.tanggalLahir).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detail Tagihan */}
            {selectedTagihan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detail Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Periode</p>
                    <p className="font-semibold">
                      {selectedTagihan.master_tagihan?.periode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTagihan.master_tagihan?.description}
                    </p>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Rincian:</p>
                    <div className="space-y-1">
                      {getJenisTagihan(selectedTagihan.master_tagihan).map(
                        (item, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            • {item}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-xl font-bold text-teal-600">
                      {convertIDR(parseFloat(selectedTagihan.jumlah_tagihan))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-teal-500 hover:bg-teal-600"
            >
              Bayar Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
