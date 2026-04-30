"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { convertIDR, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Receipt, Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const BULAN_NAMA = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

type TagihanItem = {
  idTagihanSiswa: number;
  jumlahTagihan: string;
  statusPembayaran: string;
  bulan: number;
  tahun: number;
  createdAt: string;
  updatedAt: string;
  master_tagihan: {
    namaTagihan: string;
    jenjang: string;
    jenisTagihan: string;
    nominal: number;
  };
};

export default function RiwayatPembayaran() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);

  const { data: siswaData } = useQuery({
    queryKey: ["siswa-self-riwayat", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data } = await supabase.from("siswa").select("*").eq("id", profile.id).single();
      return data;
    },
  });

  const { data: riwayatList, isLoading } = useQuery({
    queryKey: ["riwayat-siswa", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_siswa")
        .select(`
          idTagihanSiswa,
          jumlahTagihan,
          statusPembayaran,
          bulan,
          tahun,
          createdAt,
          updatedAt,
          master_tagihan:master_tagihan!idMasterTagihan(
            namaTagihan, jenjang, jenisTagihan, nominal
          )
        `)
        .eq("idSiswa", profile.id)
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false });

      if (error) {
        toast.error("Gagal memuat riwayat", { description: error.message });
        return [];
      }
      return (data as unknown as TagihanItem[]) || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      "BELUM BAYAR": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      "LUNAS": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "KADALUARSA": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config[status] || config["BELUM BAYAR"])}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-green-600" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
        <p className="text-sm text-muted-foreground">Semua tagihan dan status pembayaran</p>
      </div>

      {!riwayatList?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Belum ada riwayat tagihan</p>
            <p className="text-sm text-muted-foreground">Tagihan akan muncul di sini setelah admin membuat tagihan</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Riwayat Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">No</th>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Tagihan</th>
                    <th className="text-left p-3">Periode</th>
                    <th className="text-right p-3">Nominal</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatList.map((item, index) => (
                    <tr key={item.idTagihanSiswa} className="border-b hover:bg-muted/50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-mono">#{item.idTagihanSiswa}</td>
                      <td className="p-3">
                        <p className="font-medium">{item.master_tagihan?.namaTagihan || "-"}</p>
                        <p className="text-xs text-muted-foreground">{item.master_tagihan?.jenjang} · {item.master_tagihan?.jenisTagihan}</p>
                      </td>
                      <td className="p-3">{BULAN_NAMA[item.bulan]} {item.tahun}</td>
                      <td className="p-3 text-right font-semibold">
                        {convertIDR(parseFloat(item.jumlahTagihan))}
                      </td>
                      <td className="p-3 text-center">{getStatusBadge(item.statusPembayaran)}</td>
                      <td className="p-3 text-center">
                        {item.statusPembayaran === "LUNAS" ? (
                          <PrintButton item={item} siswaData={siswaData} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PrintButton({ item, siswaData }: { item: TagihanItem; siswaData: any }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Kwitansi-${item.idTagihanSiswa}`,
  });

  return (
    <>
      <Button onClick={handlePrint} size="sm" variant="outline" className="gap-1 text-xs">
        <Printer className="h-3 w-3" />Cetak
      </Button>

      {/* Hidden receipt for printing */}
      <div className="hidden">
        <div ref={contentRef} className="p-8 max-w-2xl mx-auto bg-white text-black font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase">PAUD Aisyiyah Bustanul Athfal 1 Buduran</h1>
            <p className="text-sm text-gray-600 mt-1">Jl. Raya Buduran, Sidoarjo</p>
            <p className="text-sm text-gray-600">Terakreditasi — Yayasan Aisyiyah</p>
          </div>

          <h2 className="text-center text-lg font-bold mb-6">KWITANSI PEMBAYARAN</h2>

          {/* Info transaksi */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">No. Kwitansi:</span>
              <span>#{item.idTagihanSiswa}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tanggal:</span>
              <span>{new Date(item.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nama Siswa:</span>
              <span>{siswaData?.namaSiswa || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Kelas:</span>
              <span>{siswaData?.kelas || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Wali Siswa:</span>
              <span>{siswaData?.namaWali || "-"}</span>
            </div>
          </div>

          {/* Tabel rincian */}
          <table className="w-full mb-6 border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left py-2">Keterangan</th>
                <th className="text-center py-2">Periode</th>
                <th className="text-right py-2">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2">{item.master_tagihan?.namaTagihan || "-"}</td>
                <td className="py-2 text-center">
                  {BULAN_NAMA[item.bulan]} {item.tahun}
                </td>
                <td className="py-2 text-right">{convertIDR(parseFloat(item.jumlahTagihan))}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 font-bold">
                <td colSpan={2} className="py-2">TOTAL</td>
                <td className="py-2 text-right">{convertIDR(parseFloat(item.jumlahTagihan))}</td>
              </tr>
            </tfoot>
          </table>

          {/* Tanda tangan */}
          <div className="flex justify-between mt-10">
            <div className="text-center text-sm">
              <p className="mb-14">Wali Siswa,</p>
              <div className="border-t border-black pt-1 px-6">({siswaData?.namaWali || "................................"})</div>
            </div>
            <div className="text-center text-sm">
              <p className="mb-14">Bendahara,</p>
              <div className="border-t border-black pt-1 px-8">(........................................)</div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Kwitansi ini dicetak secara digital dan sah sebagai bukti pembayaran</p>
          </div>
        </div>
      </div>
    </>
  );
}