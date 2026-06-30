"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { convertIDR } from "@/lib/utils";
import { MessageSquare, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";

interface TunggakanItem {
  idtagihansiswa: number;
  jumlahtagihan: number;
  siswa?:
    | {
        id?: string;
        namasiswa?: string;
        kelas?: string;
        nowa?: string;
      }
    | {
        id?: string;
        namasiswa?: string;
        kelas?: string;
        nowa?: string;
      }[]
    | null;
  master_tagihan?:
    | {
        namatagihan?: string;
      }
    | {
        namatagihan?: string;
      }[]
    | null;
}

// ← Helper untuk normalisasi hasil join Supabase yang kadang ke-infer sebagai array
const first = <T,>(v: T | T[] | null | undefined): T | undefined =>
  Array.isArray(v) ? v[0] : v ?? undefined;

interface DialogTagihMassalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TunggakanItem[];
  onSelesai?: () => void; // dipanggil setelah selesai kirim, misal buat refetch tabel
}

type SendStatus = "idle" | "sending" | "success" | "failed" | "pending";

// ← Jeda ACAK per-pesan (bukan per-batch) untuk meniru pola pengiriman manusia,
// sesuai rekomendasi anti-banned Fonnte: 30-60 detik antar pesan.
// Total waktu untuk 75 siswa: ±45 menit rata-rata — proses berjalan sekuensial.
const MIN_DELAY_MS = 30_000;
const MAX_DELAY_MS = 60_000;

const randomDelay = () =>
  Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DialogTagihMassal({
  open,
  onOpenChange,
  data,
  onSelesai,
}: DialogTagihMassalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sendStatusMap, setSendStatusMap] = useState<Record<number, SendStatus>>({});
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Reset state setiap kali dialog dibuka ulang — kecuali sedang ada proses kirim berjalan
  useEffect(() => {
    if (open && !isSending) {
      // Default: hanya centang siswa yang punya nomor WA valid
      const validIds = data
        .filter((item) => {
          const s = first(item.siswa);
          return s?.nowa && s.nowa.length >= 10;
        })
        .map((item) => item.idtagihansiswa);
      setSelectedIds(new Set(validIds));
      setSendStatusMap({});
      setProgress({ done: 0, total: 0 });
    }
  }, [open, data]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const validIds = data
      .filter((item) => {
        const s = first(item.siswa);
        return s?.nowa && s.nowa.length >= 10;
      })
      .map((item) => item.idtagihansiswa);

    if (selectedIds.size === validIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validIds));
    }
  };

  const totalNominalTerpilih = useMemo(() => {
    return data
      .filter((item) => selectedIds.has(item.idtagihansiswa))
      .reduce((sum, item) => sum + parseFloat(String(item.jumlahtagihan || 0)), 0);
  }, [data, selectedIds]);

  const cancelRef = useRef(false);

  const handleKirimMassal = async () => {
    if (selectedIds.size === 0) {
      toast.error("Pilih minimal 1 siswa untuk ditagih");
      return;
    }

    setIsSending(true);
    cancelRef.current = false;
    const idsToSend = Array.from(selectedIds);

    const initialStatus: Record<number, SendStatus> = {};
    idsToSend.forEach((id) => (initialStatus[id] = "pending"));
    setSendStatusMap(initialStatus);
    setProgress({ done: 0, total: idsToSend.length });

    let successCount = 0;
    let failedCount = 0;
    const finalStatus: Record<number, SendStatus> = { ...initialStatus };

    // ← Kirim SATU PER SATU dengan jeda acak 30-60 detik, meniru pola manusia.
    // Estimasi total: ~45 menit untuk 75 siswa. Proses tetap jalan walau dialog ditutup,
    // selama tab browser tidak ditutup (lihat catatan di bawah komponen ini).
    for (let i = 0; i < idsToSend.length; i++) {
      if (cancelRef.current) {
        // Sisa yang belum terkirim ditandai batal, bukan gagal
        idsToSend.slice(i).forEach((id) => (finalStatus[id] = "idle"));
        setSendStatusMap({ ...finalStatus });
        break;
      }

      const idTagihan = idsToSend[i];
      finalStatus[idTagihan] = "sending";
      setSendStatusMap({ ...finalStatus });

      try {
        const res = await fetch("/api/notifications/send-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idTagihan, manualSend: true }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal mengirim");
        finalStatus[idTagihan] = "success";
        successCount++;
      } catch {
        finalStatus[idTagihan] = "failed";
        failedCount++;
      }

      setSendStatusMap({ ...finalStatus });
      setProgress({ done: successCount + failedCount, total: idsToSend.length });

      // Jeda acak sebelum pesan berikutnya (skip jeda setelah pesan terakhir)
      if (i < idsToSend.length - 1 && !cancelRef.current) {
        await delay(randomDelay());
      }
    }

    setIsSending(false);

    if (cancelRef.current) {
      toast.info(`Dihentikan. Terkirim ${successCount}, sisanya dibatalkan.`);
    } else if (failedCount === 0) {
      toast.success(`Berhasil mengirim ${successCount} tagihan via WhatsApp`);
    } else {
      toast.warning(
        `Terkirim ${successCount}, gagal ${failedCount}. Cek detail di daftar.`
      );
    }

    onSelesai?.();
  };

  const handleStop = () => {
    cancelRef.current = true;
  };

  const validCount = data.filter((item) => {
    const s = first(item.siswa);
    return s?.nowa && s.nowa.length >= 10;
  }).length;
  const invalidCount = data.length - validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Reminder Tagih Massal via WhatsApp
            {isSending && (
              <span className="text-xs font-normal text-muted-foreground">
                (sedang berjalan...)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Pilih siswa yang akan ditagih, lalu kirim notifikasi ke semua wali secara bertahap
          </DialogDescription>
        </DialogHeader>

        {invalidCount > 0 && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
            ⚠️ {invalidCount} siswa tidak memiliki nomor WhatsApp valid dan tidak akan
            otomatis tercentang.
          </div>
        )}

        {/* ← Progress bar saat proses kirim berjalan */}
        {isSending && (
  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
    <div className="flex justify-between text-xs text-blue-900">
      <span className="font-medium">Mengirim bertahap (jeda 30–60 detik/pesan)</span>
      <span>{progress.done} / {progress.total}</span>
    </div>

    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-600 transition-all duration-300"
        style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
      />
    </div>

    <p className="text-xs text-blue-700">
      Estimasi sisa: ~{Math.ceil(((progress.total - progress.done) * 45) / 60)} menit.
      Boleh tutup popup, proses tetap lanjut selama tab tidak ditutup.
    </p>

    <Button
      variant="outline"
      size="sm"
      onClick={handleStop}
      className="w-full text-red-600 border-red-200 hover:bg-red-50"
    >
      Hentikan Pengiriman
    </Button>
  </div>
)}

        {/* Header pilih semua */}
        <div className="flex items-center justify-between border-b pb-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={selectedIds.size > 0 && selectedIds.size === validCount}
              onCheckedChange={toggleSelectAll}
              disabled={isSending}
            />
            Pilih Semua ({validCount} siswa bisa ditagih)
          </label>
          <span className="text-sm font-semibold">
            {selectedIds.size} dipilih
          </span>
        </div>

        {/* List siswa */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {data.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              Tidak ada tunggakan pada periode ini
            </p>
          ) : (
            data.map((item) => {
              const siswa = first(item.siswa);
              const masterTagihan = first(item.master_tagihan);
              const isValid = siswa?.nowa && siswa.nowa.length >= 10;
              const status = sendStatusMap[item.idtagihansiswa];

              return (
                <div
                  key={item.idtagihansiswa}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm ${
                    !isValid ? "opacity-50 bg-muted/30" : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedIds.has(item.idtagihansiswa)}
                    onCheckedChange={() => toggleSelect(item.idtagihansiswa)}
                    disabled={!isValid || isSending}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {siswa?.namasiswa || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {siswa?.kelas || "-"} ·{" "}
                      {masterTagihan?.namatagihan || "-"} ·{" "}
                      {isValid ? siswa?.nowa : "No. WA tidak tersedia"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {convertIDR(parseFloat(String(item.jumlahtagihan || 0)))}
                  </span>

                  {/* Indikator status kirim */}
                  {status === "pending" && (
                    <span className="text-xs text-muted-foreground">menunggu</span>
                  )}
                  {status === "sending" && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {status === "failed" && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer total + aksi */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Total nominal: </span>
            <span className="font-bold text-red-600">
              {convertIDR(totalNominalTerpilih)}
            </span>
          </div>
          <div className="flex gap-2">
            {!isSending && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Tutup
                </Button>
                <Button
                  onClick={handleKirimMassal}
                  disabled={selectedIds.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Kirim ke {selectedIds.size} Wali
                </Button>
              </>
            )}
            {isSending && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Sembunyikan (proses tetap lanjut)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}