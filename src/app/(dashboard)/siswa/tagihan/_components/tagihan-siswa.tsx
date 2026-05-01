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
import { Loader2, Receipt, AlertCircle, User, DollarSign } from "lucide-react";
import Script from "next/script";
import { environment } from "@/configs/environtment";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

declare global {
  interface Window { snap: any; }
}

const BULAN_NAMA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

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
          jumlahterbayar,
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
    // Default: isi dengan sisa tagihan
    const sisa = getSisaTagihan(tagihan);
    setNominalBayar(sisa.toString());
    setShowDialog(true);
  };

  // Hitung sisa tagihan yang belum dibayar
  const getSisaTagihan = (tagihan: any): number => {
    const total = parseFloat(tagihan.jumlahtagihan || 0);
    const terbayar = parseFloat(tagihan.jumlahterbayar || 0);
    return Math.max(0, total - terbayar);
  };

  const handlePayment = async () => {
    if (!selectedTagihan || !nominalBayar) {
      toast.error("Input nominal pembayaran");
      return;
    }

    const jumlahInput = parseFloat(nominalBayar);
    const sisaTagihan = getSisaTagihan(selectedTagihan);

    if (isNaN(jumlahInput) || jumlahInput <= 0) {
      toast.error("Nominal tidak valid");
      return;
    }

    if (jumlahInput > sisaTagihan + 0.01) {
      toast.error(`Nominal melebihi sisa tagihan (${convertIDR(sisaTagihan)})`);
      return;
    }

    try {
      setIsPaymentLoading(true);

      // Buat token baru (partial atau full — selalu buat token baru agar amount tepat)
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedTagihan.idtagihansiswa,
          gross_amount: jumlahInput,
          nominal_total: parseFloat(selectedTagihan.jumlahtagihan || 0),
          customer_name: siswaData?.namasiswa || profile.name || "Siswa",
          customer_id: profile.id,
        }),
      });

      const result = await res.json();

      if (!result.token) {
        toast.error("Gagal membuat pembayaran", { description: result.error });
        setIsPaymentLoading(false);
        return;
      }

      // Simpan token hanya untuk full payment
      const isFull = Math.abs(jumlahInput - sisaTagihan) < 0.01;
      if (isFull) {
        await supabase
          .from("tagihan_siswa")
          .update({ paymenttoken: result.token })
          .eq("idtagihansiswa", selectedTagihan.idtagihansiswa);
      }

      // Buka Snap
      window.snap.pay(result.token, {
        onSuccess: () => {
          refetch();
          setShowDialog(false);
          setNominalBayar("");
          setIsPaymentLoading(false);
        },
        onError: () => {
          toast.error("Pembayaran gagal");
          setIsPaymentLoading(false);
        },
        onClose: () => {
          setIsPaymentLoading(false);
        },
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
            {tagihanList.map((tagihan: any) => {
              const totalTagihan = parseFloat(tagihan.jumlahtagihan || 0);
              const sudahBayar = parseFloat(tagihan.jumlahterbayar || 0);
              const sisa = Math.max(0, totalTagihan - sudahBayar);
              const hasPartialPayment = sudahBayar > 0;

              return (
                <Card key={tagihan.idtagihansiswa} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded text-xs font-medium">
                          Belum Lunas
                        </span>
                        {hasPartialPayment && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded text-xs font-medium">
                            Bayar Sebagian
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          #{tagihan.idtagihansiswa}
                        </span>
                      </div>

                      <p className="font-semibold text-base">{tagihan.master_tagihan?.namatagihan || "-"}</p>
                      <p className="text-sm text-muted-foreground">
                        {BULAN_NAMA[tagihan.bulan]} {tagihan.tahun} · {tagihan.master_tagihan?.jenjang}
                      </p>

                      {/* Info nominal */}
                      <div className="mt-2 space-y-0.5">
                        {hasPartialPayment ? (
                          <>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Total:</span>
                              <span className="font-medium">{convertIDR(totalTagihan)}</span>
                              <span className="text-muted-foreground">Terbayar:</span>
                              <span className="text-green-600 font-medium">{convertIDR(sudahBayar)}</span>
                            </div>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              Sisa: {convertIDR(sisa)}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-green-700 dark:text-green-400">
                            {convertIDR(totalTagihan)}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleOpenDialog(tagihan)}
                      className="bg-green-600 hover:bg-green-700 ml-4 shrink-0"
                    >
                      {hasPartialPayment ? "Bayar Sisa" : "Bayar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Pembayaran */}
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
              <CardContent className="space-y-1 text-sm">
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
            {selectedTagihan && (() => {
              const totalTagihan = parseFloat(selectedTagihan.jumlahtagihan || 0);
              const sudahBayar = parseFloat(selectedTagihan.jumlahterbayar || 0);
              const sisa = Math.max(0, totalTagihan - sudahBayar);
              const jumlahBayarInput = parseFloat(nominalBayar || "0");
              const sisaSetelahBayar = Math.max(0, sisa - jumlahBayarInput);
              const akanLunas = jumlahBayarInput >= sisa - 0.01;

              return (
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tagihan:</span>
                      <span className="font-semibold">{convertIDR(totalTagihan)}</span>
                    </div>
                    {sudahBayar > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Sudah Dibayar:</span>
                        <span className="font-semibold">{convertIDR(sudahBayar)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Sisa Tagihan:</span>
                      <span className="text-red-600 text-base">{convertIDR(sisa)}</span>
                    </div>

                    {/* Input Nominal */}
                    <div className="border-t pt-3 space-y-3">
                      <div>
                        <Label htmlFor="nominal-bayar" className="text-xs font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Nominal Pembayaran (Rp)
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">Rp</span>
                          <Input
                            id="nominal-bayar"
                            type="number"
                            value={nominalBayar}
                            onChange={(e) => setNominalBayar(e.target.value)}
                            min="1"
                            max={sisa}
                            className="font-semibold text-base"
                            disabled={isPaymentLoading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maksimal: {convertIDR(sisa)}
                        </p>
                      </div>

                      {/* Preview hasil bayar */}
                      {jumlahBayarInput > 0 && (
                        <div className={cn(
                          "p-3 rounded-lg border-2 space-y-1 text-sm",
                          akanLunas
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                        )}>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dibayar Sekarang:</span>
                            <span className="font-semibold">{convertIDR(jumlahBayarInput)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Sisa Setelah Bayar:</span>
                            <span className={cn(
                              "font-bold",
                              akanLunas
                                ? "text-green-700 dark:text-green-400"
                                : "text-amber-700 dark:text-amber-400"
                            )}>
                              {akanLunas ? "LUNAS ✓" : convertIDR(sisaSetelahBayar)}
                            </span>
                          </div>
                          {!akanLunas && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Pembayaran sebagian — Anda bisa melunasi sisanya kapan saja.
                            </p>
                          )}
                        </div>
                      )}

                      {jumlahBayarInput > sisa + 0.01 && (
                        <p className="text-xs text-red-500">
                          Jumlah melebihi sisa tagihan ({convertIDR(sisa)})
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowDialog(false); setNominalBayar(""); }}
              disabled={isPaymentLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-green-600 hover:bg-green-700"
              disabled={
                isPaymentLoading ||
                !nominalBayar ||
                parseFloat(nominalBayar) <= 0 ||
                parseFloat(nominalBayar) > getSisaTagihan(selectedTagihan) + 0.01
              }
            >
              {isPaymentLoading
                ? <><Loader2 className="animate-spin mr-2 h-4 w-4" />Memproses...</>
                : "Bayar via Midtrans"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}