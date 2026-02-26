// src/app/(dashboard)/santri/riwayat/_components/riwayat-pembayaran.tsx
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

type MasterTagihan = {
  id_masterTagihan: number;
  periode: string;
  description: string;
  uang_makan: number;
  asrama: number;
  kas_pondok: number;
  sedekah_sukarela: number;
  aset_jariyah: number;
  uang_tahunan: number;
  iuran_kampung: number;
};

type TagihanData = {
  idTagihanSantri: string;
  jumlahTagihan: string;
  statusPembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA";
  createdAt: string;
  updatedAt: string;
  master_tagihan: MasterTagihan;
};

export default function RiwayatPembayaran() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);

  const { data: riwayatList, isLoading } = useQuery({
    queryKey: ["riwayat-pembayaran", profile.id],
    enabled: !!profile.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_santri")
        .select(
          `
          idTagihanSantri,
          jumlahTagihan,
          statusPembayaran,
          createdAt,
          updatedAt,
          master_tagihan:master_tagihan!idMasterTagihan(
            id_masterTagihan,
            periode,
            description,
            uang_makan,
            asrama,
            kas_pondok,
            sedekah_sukarela,
            aset_jariyah,
            uang_tahunan,
            iuran_kampung
          )
        `
        )
        .eq("idSantri", profile.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Riwayat query error:", error);
        toast.error("Gagal memuat riwayat pembayaran", {
          description: error.message,
        });
        return [];
      }

      return (data as unknown as TagihanData[]) || [];
    },
  });

  if (!profile.id || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-teal-500" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "BELUM BAYAR":
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      LUNAS:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      KADALUARSA:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };

    return (
      <span
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium inline-block",
          statusConfig[status] ?? statusConfig["BELUM BAYAR"]
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
        <p className="text-muted-foreground">
          Riwayat pembayaran SPP yang telah dilakukan
        </p>
      </div>

      {!riwayatList || riwayatList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Belum ada riwayat pembayaran</p>
            <p className="text-sm text-muted-foreground">
              Riwayat pembayaran akan muncul di sini setelah Anda melakukan
              pembayaran
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 whitespace-nowrap">No</th>
                    <th className="text-left p-3 whitespace-nowrap">
                      ID Tagihan
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">Periode</th>
                    <th className="text-right p-3 whitespace-nowrap">Jumlah</th>
                    <th className="text-center p-3 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">Tanggal</th>
                    <th className="text-center p-3 whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatList.map((item, index) => (
                    <tr
                      key={item.idTagihanSantri}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-3 whitespace-nowrap">{index + 1}</td>
                      <td className="p-3 font-mono text-sm whitespace-nowrap">
                        #{item.idTagihanSantri}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">
                            {item.master_tagihan?.periode ?? "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.master_tagihan?.description ?? "-"}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold whitespace-nowrap">
                        {convertIDR(parseFloat(item.jumlahTagihan))}
                      </td>
                      <td className="p-3 text-center">
                        {getStatusBadge(item.statusPembayaran)}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3 text-center">
                        {item.statusPembayaran === "LUNAS" ? (
                          <ReceiptButton tagihan={item} />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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

function ReceiptButton({ tagihan }: { tagihan: TagihanData }) {
  const profile = useAuthStore((state) => state.profile);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Kwitansi-${tagihan.idTagihanSantri}`,
  });

  const getRincianTagihan = () => {
    const master = tagihan.master_tagihan;
    if (!master) return [];

    return [
      { label: "Uang Makan", value: master.uang_makan },
      { label: "Asrama", value: master.asrama },
      { label: "Kas Pondok", value: master.kas_pondok },
      { label: "Shodaqoh Sukarela", value: master.sedekah_sukarela },
      { label: "Jariyah SB", value: master.aset_jariyah },
      { label: "Uang Tahunan", value: master.uang_tahunan },
      { label: "Iuran Kampung", value: master.iuran_kampung },
    ].filter((item) => item.value > 0);
  };

  return (
    <>
      <Button
        onClick={handlePrint}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Cetak
      </Button>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <div
          ref={contentRef}
          className="p-8 max-w-2xl mx-auto bg-white text-black"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <h1 className="text-2xl font-bold">PONDOK PESANTREN</h1>
            <h2 className="text-xl font-bold">BAITUL MAKMUR</h2>
            <p className="text-sm mt-2">
              Jl. Contoh Alamat No. 123, Surabaya, Jawa Timur
            </p>
            <p className="text-sm">Telp: (031) 1234567</p>
          </div>

          {/* Kwitansi Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold">KWITANSI PEMBAYARAN SPP</h3>
          </div>

          {/* Detail Transaksi */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="font-medium">No. Kwitansi:</span>
              <span>{tagihan.idTagihanSantri}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tanggal:</span>
              <span>
                {new Date(tagihan.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nama Santri:</span>
              <span>{profile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Periode:</span>
              <span>{tagihan.master_tagihan?.periode ?? "-"}</span>
            </div>
          </div>

          {/* Tabel Rincian */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left py-2">Keterangan</th>
                <th className="text-right py-2">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {getRincianTagihan().map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="py-2">{item.label}</td>
                  <td className="text-right py-2">{convertIDR(item.value)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-400 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="text-right py-2">
                  {convertIDR(parseFloat(tagihan.jumlahTagihan))}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-8 flex justify-between">
            <div className="text-center">
              <p className="mb-16">Penerima,</p>
              <p className="border-t border-black pt-1 inline-block px-8">
                {profile.name}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-16">Bendahara,</p>
              <p className="border-t border-black pt-1 inline-block px-8">
                (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-600">
            <p>Kwitansi ini sah dan diproses secara elektronik</p>
            <p>Simpan sebagai bukti pembayaran yang sah</p>
          </div>
        </div>
      </div>
    </>
  );
}