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
import { Loader2, Receipt, AlertCircle, User, Phone, DollarSign } from "lucide-react";
import Script from "next/script";
import { environment } from "@/configs/environtment";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

declare global {
  interface Window { snap: any; }
}

const BULAN_NAMA = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function TagihanSiswaPage() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);
  const [selectedTagihan, setSelectedTagihan] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [nominalBayar, setNominalBayar] = useState<string>("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const { data: siswaData } = useQuery({
    queryKey: ["siswa-self", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data } = await supabase.from("siswa").select("*").eq("id", profile.id).single();
      return data;
    },
  });

  const { data: tagihanList, isLoading, refetch } = useQuery({
    queryKey: ["tagihan-siswa-wali", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_siswa")
        .select(`
          idtagihansiswa,
          jumlahtagihan,
          statuspembayaran,
          paymenttoken,
          bulan,
          tahun,
          createdat,
master_tagihan (
  id_mastertagihan, namatagihan, jenjang, jenistagihan, nominal
)
        `)
        .eq("idsiswa", profile.id)
        .eq("statuspembayaran", "BELUM BAYAR")
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false });

      if (error) {
        toast.error("Gagal memuat tagihan", { description: error.message });
        throw error;
      }
      return data || [];
    },
  });

  const handleOpenDialog = (tagihan: any) => {
    setSelectedTagihan(tagihan);
    setNominalBayar(tagihan.jumlahtagihan.toString());
    setShowDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedTagihan || !nominalBayar) {
      toast.error("Input nominal pembayaran");
      return;
    }

    const jumlahInput = parseFloat(nominalBayar);
    const jumlahTotal = parseFloat(selectedTagihan.jumlahtagihan || 0);

    if (isNaN(jumlahInput) || jumlahInput <= 0) {
      toast.error("Nominal tidak valid");
      return;
    }

    if (jumlahInput > jumlahTotal) {
      toast.error("Nominal melebihi total tagihan");
      return;
    }

    try {
      setIsPaymentLoading(true);

      // Jika nominal = total dan sudah ada token, langsung buka snap
      if (jumlahInput === jumlahTotal && selectedTagihan.paymenttoken) {
        window.snap.pay(selectedTagihan.paymenttoken, {
          onSuccess: () => { refetch(); setShowDialog(false); setNominalBayar(""); },
          onError: () => toast.error("Pembayaran gagal"),
          onClose: () => { setIsPaymentLoading(false); },
        });
        setShowDialog(false);
        return;
      }

      // Buat token baru dengan nominal custom
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedTagihan.idtagihansiswa,
          gross_amount: jumlahInput,
          nominal_total: jumlahTotal,
          customer_name: siswaData?.namasiswa || profile.name || "Siswa",
          customer_id: profile.id,
        }),
      });

      const result = await res.json();

      if (!result.token) {
        toast.error("Gagal membuat pembayaran", { description: result.error });
        return;
      }

      // Jika partial payment, jangan simpan token (buat token baru setiap kali)
      // Tapi jika full payment, simpan tokennya
      if (jumlahInput === jumlahTotal) {
        await supabase
          .from("tagihan_siswa")
          .update({ paymenttoken: result.token })
          .eq("idtagihansiswa", selectedTagihan.idtagihansiswa);
      }

      // Buka Snap
      window.snap.pay(result.token, {
        onSuccess: () => { refetch(); setShowDialog(false); setNominalBayar(""); },
        onError: () => toast.error("Pembayaran gagal"),
        onClose: () => { setIsPaymentLoading(false); },
      });
      setShowDialog(false);
    } catch (err: any) {
      toast.error("Terjadi kesalahan", { description: err.message });
      setIsPaymentLoading(false);
    }
  };

  if (!profile.id) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
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
          <h1 className="text-2xl font-bold">Tagihan Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Daftar tagihan yang belum dibayar</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-green-600" />
          </div>
        ) : !tagihanList?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">Tidak ada tagihan</p>
              <p className="text-sm text-muted-foreground">Semua tagihan sudah lunas 🎉</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tagihanList.map((tagihan: any) => (
              <Card key={tagihan.idtagihansiswa} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded text-xs font-medium">
                        Belum Bayar
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{tagihan.idtagihansiswa}
                      </span>
                    </div>
                    <p className="font-semibold text-base">{tagihan.master_tagihan?.namatagihan || "-"}</p>
                    <p className="text-sm text-muted-foreground">
                      {BULAN_NAMA[tagihan.bulan]} {tagihan.tahun} · {tagihan.master_tagihan?.jenjang} · {tagihan.master_tagihan?.jenisTagihan}
                    </p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400 mt-1">
                      {convertIDR(parseFloat(tagihan.jumlahtagihan || 0))}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenDialog(tagihan)}
                    className="bg-green-600 hover:bg-green-700 ml-4"
                  >
                    Bayar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Detail Pembayaran */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Pembayaran Tagihan
            </DialogTitle>
            <DialogDescription>
              Input nominal pembayaran untuk melanjutkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Data Siswa */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Data Siswa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Nama:</span>
                  <span className="font-medium">{siswaData?.namasiswa || profile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Kelas:</span>
                  <span>{siswaData?.kelas || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Detail Tagihan */}
            {selectedTagihan && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detail Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jenis Tagihan:</span>
                    <span className="font-medium">{selectedTagihan.master_tagihan?.namatagihan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periode:</span>
                    <span>{BULAN_NAMA[selectedTagihan.bulan]} {selectedTagihan.tahun}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total Tagihan:</span>
                    <span className="text-green-700 dark:text-green-400 text-base">
                      {convertIDR(parseFloat(selectedTagihan.jumlahtagihan || 0))}
                    </span>
                  </div>

                  {/* Input Nominal Pembayaran */}
                  <div className="border-t pt-3 space-y-3">
                    <div>
                      <Label htmlFor="nominal-bayar" className="text-xs font-medium">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Nominal Pembayaran
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">Rp</span>
                        <Input
                          id="nominal-bayar"
                          type="number"
                          value={nominalBayar}
                          onChange={(e) => setNominalBayar(e.target.value)}
                          min="1"
                          max={parseFloat(selectedTagihan.jumlahtagihan || 0)}
                          className="font-semibold text-base"
                          disabled={isPaymentLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maksimal: {convertIDR(parseFloat(selectedTagihan.jumlahtagihan || 0))}
                      </p>
                    </div>

                    {/* Sisa Tagihan Preview */}
                    {nominalBayar && parseFloat(nominalBayar) > 0 && (
                      <div className={cn(
                        "p-3 rounded-lg border-2",
                        parseFloat(nominalBayar) === parseFloat(selectedTagihan.jumlahtagihan || 0)
                          ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                          : "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                      )}>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bayar:</span>
                            <span className="font-semibold">{convertIDR(parseFloat(nominalBayar) || 0)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Sisa Tagihan:</span>
                            <span className={cn(
                              "font-bold",
                              parseFloat(nominalBayar) === parseFloat(selectedTagihan.jumlahtagihan || 0)
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            )}>
                              {convertIDR(Math.max(0, parseFloat(selectedTagihan.jumlahtagihan || 0) - parseFloat(nominalBayar || 0)))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); setNominalBayar(""); }} disabled={isPaymentLoading}>
              Batal
            </Button>
            <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700" disabled={isPaymentLoading}>
              {isPaymentLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Bayar Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}