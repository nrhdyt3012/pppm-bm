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
  Clock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Script from "next/script";
import { environment } from "@/configs/environtment";
import { useState } from "react";

declare global {
  interface Window {
    snap: any;
  }
}

const BULAN_NAMA = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function TagihanSiswaPage() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);
  const [selectedTagihan, setSelectedTagihan] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const { data: siswaData } = useQuery({
    queryKey: ["siswa-self", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("siswa")
        .select("*")
        .eq("id", profile.id)
        .single();
      return data;
    },
  });

  // Query utama: tampilkan BELUM BAYAR + KADALUARSA
  const {
    data: tagihanList,
    isLoading,
    refetch,
  } = useQuery({
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
        // Tampilkan BELUM BAYAR dan KADALUARSA — keduanya masih perlu dibayar
        .in("statuspembayaran", ["BELUM BAYAR", "KADALUARSA"])
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false });

      if (error) {
        toast.error("Gagal memuat tagihan", { description: error.message });
        throw error;
      }
      return data || [];
    },
  });

  // Query polling: cek pembayaran PENDING milik siswa ini
  // Berguna untuk menampilkan indikator "menunggu konfirmasi"
  const { data: pendingPembayaran } = useQuery({
    queryKey: ["pending-pembayaran", profile.id],
    enabled: !!profile.id,
    // Polling setiap 10 detik — otomatis refresh jika webhook tiba
    refetchInterval: 10_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("pembayaran")
        .select("idpembayaran, idtagihansiswa")
        .eq("idsiswa", profile.id)
        .eq("statuspembayaran", "PENDING");
      return data || [];
    },
  });

  const getSisaTagihan = (tagihan: any): number => {
    const total = parseFloat(tagihan.jumlahtagihan || 0);
    const terbayar = parseFloat(tagihan.jumlahterbayar || 0);
    return Math.max(0, total - terbayar);
  };

  const handleOpenDialog = (tagihan: any) => {
    setSelectedTagihan(tagihan);
    setShowDialog(true);
  };

  // Midtrans selalu bayar penuh (sisa tagihan)
  const handlePayment = async () => {
    if (!selectedTagihan) return;

    const sisaTagihan = getSisaTagihan(selectedTagihan);

    if (sisaTagihan <= 0) {
      toast.error("Tagihan sudah lunas");
      return;
    }

    try {
      setIsPaymentLoading(true);

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedTagihan.idtagihansiswa,
          gross_amount: sisaTagihan,
          nominal_total: parseFloat(selectedTagihan.jumlahtagihan || 0),
          customer_name:
            siswaData?.namasiswa || profile.name || "Siswa",
          customer_id: profile.id,
        }),
      });

      const result = await res.json();

      if (!result.token) {
        toast.error("Gagal membuat pembayaran", {
          description: result.error,
        });
        setIsPaymentLoading(false);
        return;
      }

      // Simpan token ke tagihan
      await supabase
        .from("tagihan_siswa")
        .update({ paymenttoken: result.token })
        .eq("idtagihansiswa", selectedTagihan.idtagihansiswa);

      // Buka Snap
      window.snap.pay(result.token, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil! Tagihan sedang diverifikasi.");
          refetch();
          setShowDialog(false);
          setIsPaymentLoading(false);
        },
        onPending: () => {
          // Terjadi saat metode pembayaran butuh aksi lanjutan
          // (misal: transfer bank, bayar di minimarket)
          toast.info("Pembayaran sedang diproses", {
            description:
              "Selesaikan pembayaran sesuai instruksi yang diberikan Midtrans. Status akan diperbarui otomatis.",
            duration: 8000,
          });
          refetch();
          setShowDialog(false);
          setIsPaymentLoading(false);
        },
        onError: (result: any) => {
          console.error("[Snap] onError:", result);
          toast.error("Pembayaran gagal", {
            description:
              "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.",
          });
          setIsPaymentLoading(false);
        },
        onClose: () => {
          // User menutup popup tanpa menyelesaikan pembayaran
          toast.info("Pembayaran belum diselesaikan", {
            description:
              "Tagihan masih tersimpan. Kamu bisa melanjutkan pembayaran kapan saja.",
          });
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
          <p className="text-sm text-muted-foreground">
            Daftar tagihan yang belum dibayar
          </p>
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
              <p className="text-sm text-muted-foreground">
                Semua tagihan sudah lunas 🎉
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tagihanList.map((tagihan: any) => {
              const totalTagihan = parseFloat(tagihan.jumlahtagihan || 0);
              const sudahBayar = parseFloat(tagihan.jumlahterbayar || 0);
              const sisa = Math.max(0, totalTagihan - sudahBayar);
              const hasPartialPayment = sudahBayar > 0;
              const isKadaluarsa =
                tagihan.statuspembayaran === "KADALUARSA";

              // Cek apakah tagihan ini punya pembayaran PENDING
              const hasPending = pendingPembayaran?.some(
                (p: any) =>
                  p.idtagihansiswa === tagihan.idtagihansiswa
              );

              return (
                <Card
                  key={tagihan.idtagihansiswa}
                  className={`transition-shadow hover:shadow-md ${
                    isKadaluarsa
                      ? "border-gray-300 dark:border-gray-700 opacity-90"
                      : ""
                  }`}
                >
                  <CardContent className="flex items-start justify-between p-5 gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badge baris */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {isKadaluarsa ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Sesi Bayar Kedaluwarsa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded text-xs font-medium">
                            Belum Lunas
                          </span>
                        )}

                        {hasPartialPayment && !isKadaluarsa && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded text-xs font-medium">
                            Bayar Sebagian (Cash)
                          </span>
                        )}

                        {/* Badge PENDING: ada transaksi yang menunggu konfirmasi */}
                        {hasPending && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs font-medium flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Menunggu konfirmasi pembayaran
                          </span>
                        )}

                        <span className="text-xs text-muted-foreground">
                          #{tagihan.idtagihansiswa}
                        </span>
                      </div>

                      <p className="font-semibold text-base">
                        {tagihan.master_tagihan?.namatagihan || "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {BULAN_NAMA[tagihan.bulan]} {tagihan.tahun} ·{" "}
                        {tagihan.master_tagihan?.jenjang}
                      </p>

                      <div className="mt-2 space-y-0.5">
                        {hasPartialPayment ? (
                          <>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Total:
                              </span>
                              <span className="font-medium">
                                {convertIDR(totalTagihan)}
                              </span>
                              <span className="text-muted-foreground">
                                Terbayar (Cash):
                              </span>
                              <span className="text-green-600 font-medium">
                                {convertIDR(sudahBayar)}
                              </span>
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

                      {/* Info tambahan untuk tagihan kadaluarsa */}
                      {isKadaluarsa && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Sesi pembayaran sebelumnya telah berakhir. Klik
                          "Bayar Ulang" untuk membuat sesi baru.
                        </p>
                      )}

                      {/* Info pending */}
                      {hasPending && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          Jika kamu sudah menyelesaikan pembayaran (transfer
                          bank / dompet digital), status akan diperbarui
                          otomatis dalam beberapa menit.
                        </p>
                      )}
                    </div>

                    {/* Tombol aksi */}
                    <div className="shrink-0">
                      {isKadaluarsa ? (
                        <Button
                          onClick={() => handleOpenDialog(tagihan)}
                          variant="outline"
                          className="border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-950 flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Bayar Ulang
                        </Button>
                      ) : hasPending ? (
                        // Saat pending: tombol tetap ada tapi dengan label berbeda
                        <Button
                          onClick={() => handleOpenDialog(tagihan)}
                          variant="outline"
                          className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950 flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Bayar Sekarang
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleOpenDialog(tagihan)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Bayar Online
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Konfirmasi Pembayaran */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Konfirmasi Pembayaran Online
            </DialogTitle>
            <DialogDescription>
              Pembayaran via Midtrans akan melunasi tagihan secara penuh.
              Kamu bisa memilih metode pembayaran di halaman Midtrans.
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
                  <span className="font-medium">
                    {siswaData?.namasiswa || profile.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Kelas:</span>
                  <span>{siswaData?.kelas || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Detail Tagihan */}
            {selectedTagihan &&
              (() => {
                const totalTagihan = parseFloat(
                  selectedTagihan.jumlahtagihan || 0
                );
                const sudahBayar = parseFloat(
                  selectedTagihan.jumlahterbayar || 0
                );
                const sisa = Math.max(0, totalTagihan - sudahBayar);
                const isKadaluarsa =
                  selectedTagihan.statuspembayaran === "KADALUARSA";

                return (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Detail Tagihan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Jenis Tagihan:
                        </span>
                        <span className="font-medium">
                          {selectedTagihan.master_tagihan?.namatagihan}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Periode:
                        </span>
                        <span>
                          {BULAN_NAMA[selectedTagihan.bulan]}{" "}
                          {selectedTagihan.tahun}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Tagihan:
                        </span>
                        <span className="font-semibold">
                          {convertIDR(totalTagihan)}
                        </span>
                      </div>
                      {sudahBayar > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Sudah Dibayar (Cash):</span>
                          <span className="font-semibold">
                            {convertIDR(sudahBayar)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-3">
                        <span className="font-bold">
                          Total Dibayar Sekarang:
                        </span>
                        <span className="font-bold text-green-700 dark:text-green-400 text-lg">
                          {convertIDR(sisa)}
                        </span>
                      </div>

                      {/* Info untuk tagihan kadaluarsa */}
                      {isKadaluarsa && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <RefreshCw className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>
                            Sesi pembayaran sebelumnya telah berakhir.
                            Sistem akan membuat sesi pembayaran baru
                            untukmu.
                          </span>
                        </div>
                      )}

                      {/* Info metode pembayaran */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">
                          Metode pembayaran yang tersedia:
                        </p>
                        <ul className="space-y-0.5 text-blue-600 dark:text-blue-400">
                          <li>• Transfer Bank (BCA, BNI, BRI, Mandiri, Permata)</li>
                          <li>• Dompet Digital (GoPay, ShopeePay)</li>
                          <li>• QRIS</li>
                          <li>• Kartu Kredit / Debit</li>
                          <li>• Gerai (Indomaret, Alfamart)</li>
                        </ul>
                        <p className="mt-2 text-blue-500 dark:text-blue-500">
                          Pilih metode setelah klik "Lanjut ke Pembayaran".
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isPaymentLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-green-600 hover:bg-green-700"
              disabled={isPaymentLoading}
            >
              {isPaymentLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Memproses...
                </>
              ) : (
                "Lanjut ke Pembayaran"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}