"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { convertIDR, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Receipt, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const BULAN_NAMA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type PembayaranItem = {
  idpembayaran: number;
  jumlahdibayar: string;
  tanggalpembayaran: string;
  metodepembayaran: string;
  statuspembayaran: string;
};

type TagihanItem = {
  idtagihansiswa: number;
  jumlahtagihan: string;
  jumlahterbayar: string;
  statuspembayaran: string;
  bulan: number;
  tahun: number;
  createdat: string;
  updatedat: string;
  master_tagihan: {
    namatagihan: string;
    jenjang: string;
    jenistagihan: string;
    nominal: number;
  };
  pembayaran?: PembayaranItem[];
};

export default function RiwayatPembayaran() {
  const supabase = createClient();
  const profile = useAuthStore((state) => state.profile);
  const [expandedTagihan, setExpandedTagihan] = useState<Set<number>>(new Set());

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
          idtagihansiswa,
          jumlahtagihan,
          jumlahterbayar,
          statuspembayaran,
          bulan,
          tahun,
          createdat,
          updatedat,
          master_tagihan:master_tagihan!idmastertagihan(
            namatagihan, jenjang, jenistagihan, nominal
          ),
          pembayaran(
            idpembayaran,
            jumlahdibayar,
            tanggalpembayaran,
            metodepembayaran,
            statuspembayaran
          )
        `)
        .eq("idsiswa", profile.id)
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

  const toggleExpand = (id: number) => {
    setExpandedTagihan((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Pisahkan pembayaran sukses (untuk ditampilkan)
  const getSuccessPembayaran = (item: TagihanItem) =>
    (item.pembayaran ?? []).filter(
      (p) => p.statuspembayaran === "SUCCESS" || p.statuspembayaran === "PARTIAL"
    );

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
            <p className="text-sm text-muted-foreground">
              Tagihan akan muncul di sini setelah admin membuat tagihan
            </p>
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
                    <th className="text-left p-3">Tagihan</th>
                    <th className="text-left p-3">Periode</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-right p-3">Terbayar</th>
                    <th className="text-right p-3">Sisa</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatList.map((item, index) => {
                    const totalTagihan = parseFloat(item.jumlahtagihan);
                    const sudahBayar = parseFloat(item.jumlahterbayar || "0");
                    const sisa = Math.max(0, totalTagihan - sudahBayar);
                    const isExpanded = expandedTagihan.has(item.idtagihansiswa);
                    const successPembayaran = getSuccessPembayaran(item);

                    return (
                      <>
                        <tr
                          key={`tagihan-${item.idtagihansiswa}`}
                          className={cn(
                            "border-b hover:bg-muted/50 cursor-pointer",
                            isExpanded && "bg-muted/30"
                          )}
                          onClick={() => successPembayaran.length > 0 && toggleExpand(item.idtagihansiswa)}
                        >
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <p className="font-medium">{item.master_tagihan?.namatagihan || "-"}</p>
                            <p className="text-xs text-muted-foreground">
                              #{item.idtagihansiswa} · {item.master_tagihan?.jenjang}
                            </p>
                          </td>
                          <td className="p-3">{BULAN_NAMA[item.bulan]} {item.tahun}</td>
                          <td className="p-3 text-right font-semibold">
                            {convertIDR(totalTagihan)}
                          </td>
                          <td className="p-3 text-right text-green-600 font-semibold">
                            {convertIDR(sudahBayar)}
                          </td>
                          <td className="p-3 text-right">
                            <span className={cn(
                              "font-semibold",
                              sisa > 0 ? "text-red-600" : "text-green-600"
                            )}>
                              {sisa > 0 ? convertIDR(sisa) : "Lunas"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {getStatusBadge(item.statuspembayaran)}
                          </td>
                          <td className="p-3 text-center">
                            {successPembayaran.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(item.idtagihansiswa);
                                }}
                                className="text-xs text-muted-foreground flex items-center gap-1 mx-auto hover:text-foreground"
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {successPembayaran.length} transaksi
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>

                        {/* Expandable: daftar transaksi per pembayaran */}
                        {isExpanded && successPembayaran.length > 0 && (
                          <tr key={`expanded-${item.idtagihansiswa}`}>
                            <td colSpan={8} className="p-0 bg-muted/20">
                              <div className="px-6 py-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Riwayat Transaksi
                                </p>
                                <div className="space-y-2">
                                  {successPembayaran
                                    .sort((a, b) => new Date(a.tanggalpembayaran).getTime() - new Date(b.tanggalpembayaran).getTime())
                                    .map((p, pIdx) => (
                                      <div
                                        key={p.idpembayaran}
                                        className="flex items-center justify-between bg-white dark:bg-card border rounded-lg px-4 py-2"
                                      >
                                        <div className="flex items-center gap-4">
                                          <span className="text-xs text-muted-foreground">
                                            #{pIdx + 1}
                                          </span>
                                          <div>
                                            <p className="text-sm font-semibold text-green-600">
                                              {convertIDR(parseFloat(p.jumlahdibayar || "0"))}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(p.tanggalpembayaran).toLocaleDateString("id-ID", {
                                                day: "numeric", month: "long", year: "numeric",
                                                hour: "2-digit", minute: "2-digit",
                                              })}
                                              {" · "}
                                              {p.metodepembayaran === "cash" ? "Cash/Manual" : "Transfer/Online"}
                                            </p>
                                          </div>
                                        </div>
                                        <PrintButtonSingle
                                          pembayaran={p}
                                          tagihan={item}
                                          siswaData={siswaData}
                                          indexTransaksi={pIdx + 1}
                                          totalTagihan={totalTagihan}
                                        />
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Komponen print per transaksi ─────────────────────────────────────────────
function PrintButtonSingle({
  pembayaran,
  tagihan,
  siswaData,
  indexTransaksi,
  totalTagihan,
}: {
  pembayaran: PembayaranItem;
  tagihan: TagihanItem;
  siswaData: any;
  indexTransaksi: number;
  totalTagihan: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Kwitansi-${tagihan.idtagihansiswa}-Transaksi-${pembayaran.idpembayaran}`,
  });

  const jumlahBayar = parseFloat(pembayaran.jumlahdibayar || "0");
  const sudahBayarSetelahIni = parseFloat(tagihan.jumlahterbayar || "0");
  const sisaSetelahIni = Math.max(0, totalTagihan - sudahBayarSetelahIni);
  const isLunas = tagihan.statuspembayaran === "LUNAS" && pembayaran.statuspembayaran === "SUCCESS";
  const metode = pembayaran.metodepembayaran === "cash" ? "Tunai/Cash" : "Transfer/Online (Midtrans)";

  return (
    <>
      <Button
        onClick={handlePrint}
        size="sm"
        variant="outline"
        className="gap-1 text-xs h-8"
      >
        <Printer className="h-3 w-3" />
        Cetak Kwitansi
      </Button>

      {/* Hidden receipt */}
      <div className="hidden">
        <div
          ref={contentRef}
          className="p-8 max-w-2xl mx-auto bg-white text-black font-sans text-sm"
          style={{ fontFamily: "serif" }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
            <h1 className="text-2xl font-bold uppercase tracking-widest">
              PAUD Aisyiyah Bustanul Athfal 1 Buduran
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Jl. Kavling Persada Asri C-37, Damarsi, Buduran, Sidoarjo
            </p>
            <p className="text-sm text-gray-600">Terakreditasi — Yayasan Aisyiyah</p>
          </div>

          <h2 className="text-center text-lg font-bold mb-1 uppercase tracking-wider">
            Kwitansi Pembayaran
          </h2>
          <p className="text-center text-xs text-gray-500 mb-6">
            No. {tagihan.idtagihansiswa}/{pembayaran.idpembayaran}/{new Date(pembayaran.tanggalpembayaran).getFullYear()}
          </p>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <p className="font-bold text-xs uppercase text-gray-500 border-b pb-1 mb-2">Data Siswa</p>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">Nama Siswa</span>
                <span>: <strong>{siswaData?.namasiswa || siswaData?.namaSiswa || "-"}</strong></span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">Kelas</span>
                <span>: {siswaData?.kelas || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">Wali</span>
                <span>: {siswaData?.namawali || siswaData?.namaWali || "-"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-xs uppercase text-gray-500 border-b pb-1 mb-2">Detail Transaksi</p>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">ID Tagihan</span>
                <span>: #{tagihan.idtagihansiswa}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">Periode</span>
                <span>: {BULAN_NAMA[tagihan.bulan]} {tagihan.tahun}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">Tanggal</span>
                <span>: {new Date(pembayaran.tanggalpembayaran).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-600 w-24 shrink-0">Metode</span>
                <span>: {metode}</span>
              </div>
            </div>
          </div>

          {/* Tabel rincian */}
          <table className="w-full mb-4 border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-400">
                <th className="text-left py-2 px-3">Keterangan</th>
                <th className="text-center py-2 px-3">Periode</th>
                <th className="text-right py-2 px-3">Total Tagihan</th>
                <th className="text-right py-2 px-3">Dibayar</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2 px-3">{tagihan.master_tagihan?.namatagihan || "-"}</td>
                <td className="py-2 px-3 text-center">
                  {BULAN_NAMA[tagihan.bulan]} {tagihan.tahun}
                </td>
                <td className="py-2 px-3 text-right">{convertIDR(totalTagihan)}</td>
                <td className="py-2 px-3 text-right font-bold text-green-700">
                  {convertIDR(jumlahBayar)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400">
                <td colSpan={3} className="py-2 px-3 text-right font-bold">
                  Jumlah Dibayar:
                </td>
                <td className="py-2 px-3 text-right font-bold text-green-700">
                  {convertIDR(jumlahBayar)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-1 px-3 text-right text-gray-600">
                  Sisa Tagihan:
                </td>
                <td className={`py-1 px-3 text-right font-semibold ${sisaSetelahIni > 0 ? "text-red-700" : "text-green-700"}`}>
                  {sisaSetelahIni > 0 ? convertIDR(sisaSetelahIni) : "LUNAS ✓"}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Status box */}
          <div className={`border-2 rounded p-3 mb-6 text-center font-bold ${
            isLunas
              ? "border-green-500 bg-green-50 text-green-800"
              : "border-amber-500 bg-amber-50 text-amber-800"
          }`}>
            STATUS TAGIHAN: {isLunas ? "✓ LUNAS" : "⚠ BELUM LUNAS"}
            {!isLunas && (
              <p className="font-normal text-xs mt-1">
                Sisa tagihan: {convertIDR(sisaSetelahIni)}
              </p>
            )}
          </div>

          {/* Tanda tangan */}
          <div className="flex justify-between mt-8">
            <div className="text-center text-sm">
              <p className="mb-14">Wali Siswa,</p>
              <div className="border-t border-black pt-1 px-4">
                ({siswaData?.namawali || siswaData?.namaWali || "............................."})
              </div>
            </div>
            <div className="text-center text-sm">
              <p className="mb-14">Bendahara,</p>
              <div className="border-t border-black pt-1 px-8">
                (........................................)
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
            <p>Kwitansi ini dicetak secara digital dan sah sebagai bukti pembayaran</p>
            <p className="mt-1">
              Dicetak: {new Date().toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}