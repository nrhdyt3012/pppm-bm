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
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  Users,
  Calendar,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
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
  Cell,
} from "recharts";
import * as XLSX from "xlsx";

const BULAN_NAMA = [
  "",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const BULAN_SINGKAT = [
  "", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agt", "Sep", "Okt", "Nov", "Des",
];

const COLOR_ACTIVE = "#dc2626";
const COLOR_INACTIVE = "#fca5a5";

type SiswaTunggakan = {
  id: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  noWa: string;
  totalTunggakan: number;
  daftarTagihan: {
    namaTagihan: string;
    jumlah: number;
    bulan: number;
    tahun: number;
  }[];
};

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const breakdown: Record<string, number> = data.breakdown || {};
  const breakdownEntries = Object.entries(breakdown).filter(([, v]) => v > 0);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 min-w-[200px]">
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        📅 {label}
      </p>
      {breakdownEntries.length > 0 ? (
        <div className="space-y-1.5">
          {breakdownEntries.map(([key, count]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500 dark:text-gray-400">{key}</span>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {count} tunggakan
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Total</span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {data.total} tunggakan
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500">Tidak ada tunggakan</p>
      )}
    </div>
  );
};

// ─── Month-Year Picker ─────────────────────────────────────────────────────────
const MonthYearPicker = ({
  selectedMonth,
  selectedYear,
  onChange,
  onClose,
}: {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
  onClose: () => void;
}) => {
  const [pickerYear, setPickerYear] = useState(selectedYear);
  const currentYear = new Date().getFullYear();

  return (
    <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setPickerYear((y) => y - 1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{pickerYear}</span>
        <button
          onClick={() => setPickerYear((y) => y + 1)}
          disabled={pickerYear >= currentYear + 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {BULAN_SINGKAT.slice(1).map((nama, idx) => {
          const bulanIdx = idx + 1;
          const isActive = bulanIdx === selectedMonth && pickerYear === selectedYear;
          return (
            <button
              key={bulanIdx}
              onClick={() => {
                onChange(bulanIdx, pickerYear);
                onClose();
              }}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-red-600 text-white shadow-sm"
                  : "hover:bg-red-50 dark:hover:bg-red-950 text-gray-700 dark:text-gray-300"
              }`}
            >
              {nama}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Komponen Utama ────────────────────────────────────────────────────────────
export default function RekapanTunggakan() {
  const supabase = createClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [showWaDialog, setShowWaDialog] = useState(false);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState<string[]>([]);

  // Tutup picker ketika klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Data tabel per periode terpilih ──────────────────────────────────────
  const { data: tunggakanData, isLoading } = useQuery({
    queryKey: ["rekapan-tunggakan", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tagihan_siswa")
        .select(`
          idtagihansiswa,
          jumlahtagihan,
          statuspembayaran,
          bulan,
          tahun,
          createdat,
          siswa:siswa!idsiswa(id, namasiswa, kelas, nowa, nis),
          master_tagihan:master_tagihan!idmastertagihan(namatagihan, jenjang, jenistagihan)
        `)
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

  // ─── Data grafik 6 bulan terakhir dengan breakdown ────────────────────────
  const { data: chartData } = useQuery({
    queryKey: ["chart-tunggakan"],
    queryFn: async () => {
      const results = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();

        const { data } = await supabase
          .from("tagihan_siswa")
          .select(`
            idtagihansiswa,
            master_tagihan:master_tagihan!idmastertagihan(jenjang, jenistagihan)
          `)
          .eq("statuspembayaran", "BELUM BAYAR")
          .eq("bulan", m)
          .eq("tahun", y);

        const breakdown: Record<string, number> = {};
        (data || []).forEach((item: any) => {
          const jenjang = item.master_tagihan?.jenjang || "Lainnya";
          const jenis = item.master_tagihan?.jenistagihan || "";
          const key = jenis ? `${jenjang} ${jenis}` : jenjang;
          breakdown[key] = (breakdown[key] || 0) + 1;
        });

        results.push({
          name: `${BULAN_SINGKAT[m]} ${y.toString().slice(2)}`,
          bulan: m,
          tahun: y,
          total: (data || []).length,
          breakdown,
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

  // Kelompokkan tunggakan per siswa
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
    if (!tunggakanData?.length) { toast.error("Tidak ada data"); return; }
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
    XLSX.writeFile(wb, `Tunggakan_${BULAN_NAMA[selectedMonth]}_${selectedYear}.xlsx`);
    toast.success("Data berhasil diekspor");
  };

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

  const handleKirimSatu = (siswa: SiswaTunggakan) => {
    if (!siswa.noWa) {
      toast.error(`Nomor WA wali ${siswa.namaSiswa} tidak tersedia`);
      return;
    }
    const noWa = siswa.noWa.replace(/^0/, "62").replace(/\D/g, "");
    const pesan = encodeURIComponent(buildWaMessage(siswa));
    window.open(`https://wa.me/${noWa}?text=${pesan}`, "_blank");
  };

  const handleKirimSemua = () => {
    const dipilih = siswaTunggakanList.filter((s) => selectedSiswaIds.includes(s.id));
    if (!dipilih.length) { toast.error("Pilih minimal 1 siswa"); return; }
    const tidakAdaWa = dipilih.filter((s) => !s.noWa);
    if (tidakAdaWa.length) {
      toast.warning(`${tidakAdaWa.length} siswa tidak memiliki nomor WA: ${tidakAdaWa.map((s) => s.namaSiswa).join(", ")}`);
    }
    const adaWa = dipilih.filter((s) => !!s.noWa);
    if (!adaWa.length) { toast.error("Tidak ada siswa yang memiliki nomor WA"); return; }
    adaWa.forEach((siswa, idx) => {
      setTimeout(() => {
        const noWa = siswa.noWa.replace(/^0/, "62").replace(/\D/g, "");
        const pesan = encodeURIComponent(buildWaMessage(siswa));
        window.open(`https://wa.me/${noWa}?text=${pesan}`, "_blank");
      }, idx * 800);
    });
    toast.success(`Membuka ${adaWa.length} chat WhatsApp... Pastikan browser mengizinkan pop-up.`);
    setShowWaDialog(false);
  };

  const isAllSelected =
    siswaTunggakanList.length > 0 &&
    selectedSiswaIds.length === siswaTunggakanList.length;

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">Rekapan Tunggakan</h1>

      {/* ─── Grafik ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Tunggakan (6 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Legend
                formatter={() => "Jumlah Tunggakan"}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="total" name="Jumlah Tunggakan" radius={[6, 6, 0, 0]}>
                {(chartData || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.bulan === selectedMonth && entry.tahun === selectedYear
                        ? COLOR_ACTIVE
                        : COLOR_INACTIVE
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ─── Navigasi periode + tombol aksi ────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Tombol periode — klik buka picker */}
          <div className="relative" ref={pickerRef}>
            <Button
              variant="outline"
              className="gap-2 min-w-[160px] font-semibold"
              onClick={() => setShowPicker((v) => !v)}
            >
              <Calendar className="h-4 w-4 text-red-600" />
              {BULAN_NAMA[selectedMonth]} {selectedYear}
            </Button>

            {showPicker && (
              <MonthYearPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={(m, y) => {
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>

          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenWaDialog}
            disabled={!tunggakanData?.length}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Tagihkan via WhatsApp
          </Button>
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

      {/* ─── Kartu statistik ────────────────────────────────────────────────── */}
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
            <p className="text-2xl font-bold text-red-600">{convertIDR(totalNominal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tabel tunggakan ────────────────────────────────────────────────── */}
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
                    <tr key={item.idtagihansiswa} className="border-b hover:bg-muted/50">
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-medium">{item.siswa?.namasiswa || "-"}</td>
                      <td className="p-3">{item.siswa?.kelas || "-"}</td>
                      <td className="p-3">{item.siswa?.nowa || "-"}</td>
                      <td className="p-3">{item.master_tagihan?.namatagihan || "-"}</td>
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
                    <td colSpan={5} className="p-3 text-right">Total:</td>
                    <td className="p-3 text-right text-red-600">{convertIDR(totalNominal)}</td>
                    <td />
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

          <div className="flex items-center justify-between px-1 py-2 border-b">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(c) => handleSelectAll(c as boolean)}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
                {isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}
              </label>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{selectedSiswaIds.length} dipilih</span>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            {!siswaTunggakanList.length ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Tidak ada data tunggakan</p>
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
                          isChecked ? "bg-green-50 dark:bg-green-950/30" : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectSiswa(siswa.id, !isChecked)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(c) => handleSelectSiswa(siswa.id, c as boolean)}
                          />
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">{siswa.nis}</td>
                        <td className="p-3">
                          <p className="font-medium">{siswa.namaSiswa}</p>
                          {!siswa.noWa && (
                            <p className="text-xs text-red-500 mt-0.5">⚠ No. WA tidak tersedia</p>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            {siswa.kelas}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold text-red-600">
                          {convertIDR(siswa.totalTunggakan)}
                          <p className="text-xs text-muted-foreground font-normal">
                            {siswa.daftarTagihan.length} tagihan
                          </p>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 text-xs gap-1"
                            onClick={() => handleKirimSatu(siswa)}
                            disabled={!siswa.noWa}
                            title={!siswa.noWa ? "Nomor WA tidak tersedia" : ""}
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
            <Button variant="outline" onClick={() => setShowWaDialog(false)}>Tutup</Button>
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