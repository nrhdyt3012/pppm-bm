"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, MessageCircle, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

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

// ─── Tipe tunggakan per siswa (dikelompokkan) ────────────────────────────────
type SiswaTunggakan = {
  id: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  noWa: string;
  totalTunggakan: number;
  daftarTagihan: { namaTagihan: string; jumlah: number; bulan: number; tahun: number }[];
};

export default function RekapanTunggakan() {
  const supabase = createClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State untuk dialog WhatsApp
  const [showWaDialog, setShowWaDialog] = useState(false);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);

  const { data: tunggakanData, isLoading } = useQuery({
    queryKey: ["rekapan-tunggakan", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_siswa")
        .select(
          `
          idtagihansiswa,
          jumlahtagihan,
          statuspembayaran,
          bulan,
          tahun,
          createdat,
          siswa:siswa!idsiswa(id, namasiswa, kelas, nowa, nis),
          master_tagihan:master_tagihan!idmastertagihan(namatagihan, jenjang, jenistagihan)
        `
        )
        .eq("statuspembayaran", "BELUM BAYAR")
        .eq("bulan", selectedMonth)
        .eq("tahun", selectedYear)
        .order("createdat", { ascending: false });

      if (error) {
        toast.error("Gagal memuat data", { description: error.message });
        return [];
      }
      return data || [];
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["chart-tunggakan"],
    queryFn: async () => {
      const results = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const { count } = await supabase
          .from("tagihan_siswa")
          .select("*", { count: "exact", head: true })
          .eq("statuspembayaran", "BELUM BAYAR")
          .eq("bulan", m)
          .eq("tahun", y);
        results.push({
          name: `${BULAN_NAMA[m].slice(0, 3)} ${y.toString().slice(2)}`,
          total: count || 0,
        });
      }
      return results;
    },
  });

  const totalNominal = useMemo(
    () =>
      tunggakanData?.reduce(
        (s: number, i: any) => s + parseFloat(i.jumlahtagihan || 0),
        0
      ) || 0,
    [tunggakanData]
  );

  // ─── Kelompokkan tunggakan per siswa ──────────────────────────────────────
  const siswaTunggakanList = useMemo<SiswaTunggakan[]>(() => {
    if (!tunggakanData?.length) return [];

    const map = new Map<string, SiswaTunggakan>();

    tunggakanData.forEach((item: any) => {
      const siswa = item.siswa;
      if (!siswa?.id) return;

      if (!map.has(siswa.id)) {
        map.set(siswa.id, {
          id: siswa.id,
          nis: siswa.nis || "-",
          namaSiswa: siswa.namasiswa || "-",
          kelas: siswa.kelas || "-",
          noWa: siswa.nowa || "",
          totalTunggakan: 0,
          daftarTagihan: [],
        });
      }

      const entry = map.get(siswa.id)!;
      entry.totalTunggakan += parseFloat(item.jumlahtagihan || 0);
      entry.daftarTagihan.push({
        namaTagihan: item.master_tagihan?.namatagihan || "-",
        jumlah: parseFloat(item.jumlahtagihan || 0),
        bulan: item.bulan,
        tahun: item.tahun,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.namaSiswa.localeCompare(b.namaSiswa)
    );
  }, [tunggakanData]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else setSelectedMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else setSelectedMonth((m) => m + 1);
  };

  const handleExport = () => {
    if (!tunggakanData?.length) {
      toast.error("Tidak ada data");
      return;
    }
    const rows = tunggakanData.map((item: any, i: number) => ({
      No: i + 1,
      "ID Tagihan": item.idtagihansiswa,
      "Nama Siswa": item.siswa?.namasiswa || "-",
      Kelas: item.siswa?.kelas || "-",
      "No. WA Wali": item.siswa?.nowa || "-",
      "Nama Tagihan": item.master_tagihan?.namatagihan || "-",
      Jenjang: item.master_tagihan?.jenjang || "-",
      Bulan: BULAN_NAMA[item.bulan],
      Tahun: item.tahun,
      "Jumlah Tunggakan": parseFloat(item.jumlahtagihan || 0),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tunggakan");
    XLSX.writeFile(
      wb,
      `Tunggakan_${BULAN_NAMA[selectedMonth]}_${selectedYear}.xlsx`
    );
    toast.success("Data berhasil diekspor");
  };

  // ─── Handler dialog WhatsApp ───────────────────────────────────────────────
  const handleOpenWaDialog = () => {
    setSelectedSiswaIds([]);
    setShowWaDialog(true);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedSiswaIds(checked ? siswaTunggakanList.map((s) => s.id) : []);
  };

  const handleSelectSiswa = (id: string, checked: boolean) => {
    setSelectedSiswaIds((prev) =>
      checked ? [...prev, id] : prev.filter((s) => s !== id)
    );
  };

  // Format pesan WhatsApp per siswa
  const buildWaMessage = (siswa: SiswaTunggakan): string => {
    const rincian = siswa.daftarTagihan
      .map(
        (t, i) =>
          `${i + 1}. ${t.namaTagihan} (${BULAN_NAMA[t.bulan]} ${t.tahun}) — ${convertIDR(t.jumlah)}`
      )
      .join("\n");

    return (
      `Assalamu'alaikum Wr. Wb.\n\n` +
      `Yth. Wali Murid *${siswa.namaSiswa}* (${siswa.kelas})\n\n` +
      `Kami menginformasikan bahwa terdapat tagihan yang belum dibayarkan:\n\n` +
      `${rincian}\n\n` +
      `*Total Tunggakan: ${convertIDR(siswa.totalTunggakan)}*\n\n` +
      `Mohon segera melakukan pembayaran agar proses administrasi dapat berjalan lancar.\n\n` +
      `Terima kasih atas perhatian dan kerjasamanya.\n\n` +
      `Wassalamu'alaikum Wr. Wb.\n` +
      `KB TK Aisyiyah Bustanul Athfal 1 Buduran`
    );
  };

  // Kirim ke satu siswa
  const handleKirimSatu = (siswa: SiswaTunggakan) => {
    if (!siswa.noWa) {
      toast.error(`Nomor WA wali ${siswa.namaSiswa} tidak tersedia`);
      return;
    }
    const noWa = siswa.noWa.replace(/^0/, "62").replace(/\D/g, "");
    const pesan = encodeURIComponent(buildWaMessage(siswa));
    window.open(`https://wa.me/${noWa}?text=${pesan}`, "_blank");
  };

  // Kirim ke semua yang dipilih (buka satu per satu dengan delay)
  const handleKirimSemua = () => {
    const dipilih = siswaTunggakanList.filter((s) =>
      selectedSiswaIds.includes(s.id)
    );

    if (!dipilih.length) {
      toast.error("Pilih minimal 1 siswa");
      return;
    }

    const tidakAdaWa = dipilih.filter((s) => !s.noWa);
    if (tidakAdaWa.length) {
      toast.warning(
        `${tidakAdaWa.length} siswa tidak memiliki nomor WA: ${tidakAdaWa.map((s) => s.namaSiswa).join(", ")}`
      );
    }

    const adaWa = dipilih.filter((s) => !!s.noWa);
    if (!adaWa.length) {
      toast.error("Tidak ada siswa yang memiliki nomor WA");
      return;
    }

    // Buka WhatsApp satu per satu dengan delay agar browser tidak block popup
    adaWa.forEach((siswa, idx) => {
      setTimeout(() => {
        const noWa = siswa.noWa.replace(/^0/, "62").replace(/\D/g, "");
        const pesan = encodeURIComponent(buildWaMessage(siswa));
        window.open(`https://wa.me/${noWa}?text=${pesan}`, "_blank");
      }, idx * 800);
    });

    toast.success(
      `Membuka ${adaWa.length} chat WhatsApp... Pastikan browser mengizinkan pop-up.`
    );
    setShowWaDialog(false);
  };

  const isAllSelected =
    siswaTunggakanList.length > 0 &&
    selectedSiswaIds.length === siswaTunggakanList.length;

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Rekapan Tunggakan</h1>

      {/* Grafik */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Tunggakan (6 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#dc2626" name="Jumlah Tunggakan" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Kontrol bulan + tombol aksi */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {BULAN_NAMA[selectedMonth]} {selectedYear}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {/* Tombol Tagihkan ke WhatsApp */}
          <Button
            onClick={handleOpenWaDialog}
            disabled={!tunggakanData?.length}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Tagihkan via WhatsApp
          </Button>

          {/* Tombol Export Excel */}
          <Button
            onClick={handleExport}
            disabled={!tunggakanData?.length}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Jumlah Siswa Menunggak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {siswaTunggakanList.length} Siswa
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Nominal Tunggakan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {convertIDR(totalNominal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel tunggakan */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa Belum Bayar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : !tunggakanData?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada tunggakan untuk periode ini 🎉
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">No</th>
                    <th className="text-left p-3">Nama Siswa</th>
                    <th className="text-left p-3">Kelas</th>
                    <th className="text-left p-3">No. WA Wali</th>
                    <th className="text-left p-3">Tagihan</th>
                    <th className="text-right p-3">Nominal</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tunggakanData.map((item: any, i: number) => (
                    <tr
                      key={item.idtagihansiswa}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-medium">
                        {item.siswa?.namasiswa || "-"}
                      </td>
                      <td className="p-3">{item.siswa?.kelas || "-"}</td>
                      <td className="p-3">{item.siswa?.nowa || "-"}</td>
                      <td className="p-3">
                        {item.master_tagihan?.namatagihan || "-"}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {convertIDR(parseFloat(item.jumlahtagihan || 0))}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                          Belum Bayar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/30">
                    <td colSpan={5} className="p-3 text-right">
                      Total:
                    </td>
                    <td className="p-3 text-right text-red-600">
                      {convertIDR(totalNominal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Dialog Tagihkan via WhatsApp ──────────────────────────────────── */}
      <Dialog open={showWaDialog} onOpenChange={setShowWaDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Tagihkan via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Pilih siswa yang akan dikirimkan pesan tagihan ke WhatsApp wali.
              Periode: {BULAN_NAMA[selectedMonth]} {selectedYear}
            </DialogDescription>
          </DialogHeader>

          {/* Header tabel + select all */}
          <div className="flex items-center justify-between px-1 py-2 border-b">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(c) => handleSelectAll(c as boolean)}
                id="select-all"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer select-none"
              >
                {isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}
              </label>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{selectedSiswaIds.length} dipilih</span>
            </div>
          </div>

          {/* Tabel siswa */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {!siswaTunggakanList.length ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                Tidak ada data tunggakan
              </p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                  <tr className="border-b">
                    <th className="p-3 text-left w-10"></th>
                    <th className="p-3 text-left">NIS</th>
                    <th className="p-3 text-left">Nama Lengkap</th>
                    <th className="p-3 text-left">Kelas</th>
                    <th className="p-3 text-right">Jumlah Tunggakan</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaTunggakanList.map((siswa) => {
                    const isChecked = selectedSiswaIds.includes(siswa.id);
                    return (
                      <tr
                        key={siswa.id}
                        className={`border-b transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-green-50 dark:bg-green-950/30"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectSiswa(siswa.id, !isChecked)}
                      >
                        {/* Checkbox */}
                        <td
                          className="p-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(c) =>
                              handleSelectSiswa(siswa.id, c as boolean)
                            }
                          />
                        </td>

                        {/* NIS */}
                        <td className="p-3 font-mono text-muted-foreground">
                          {siswa.nis}
                        </td>

                        {/* Nama */}
                        <td className="p-3">
                          <p className="font-medium">{siswa.namaSiswa}</p>
                          {!siswa.noWa && (
                            <p className="text-xs text-red-500 mt-0.5">
                              ⚠ No. WA tidak tersedia
                            </p>
                          )}
                        </td>

                        {/* Kelas */}
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            {siswa.kelas}
                          </span>
                        </td>

                        {/* Total tunggakan */}
                        <td className="p-3 text-right font-semibold text-red-600">
                          {convertIDR(siswa.totalTunggakan)}
                          <p className="text-xs text-muted-foreground font-normal">
                            {siswa.daftarTagihan.length} tagihan
                          </p>
                        </td>

                        {/* Tombol kirim satu */}
                        <td
                          className="p-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 text-xs gap-1"
                            onClick={() => handleKirimSatu(siswa)}
                            disabled={!siswa.noWa}
                            title={
                              !siswa.noWa ? "Nomor WA tidak tersedia" : ""
                            }
                          >
                            <MessageCircle className="h-3 w-3" />
                            Tagihkan
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <DialogFooter className="border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowWaDialog(false)}>
              Tutup
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={handleKirimSemua}
              disabled={selectedSiswaIds.length === 0}
            >
              <MessageCircle className="h-4 w-4" />
              Kirim ke {selectedSiswaIds.length} Siswa Terpilih
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}