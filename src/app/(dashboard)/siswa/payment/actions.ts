// src/app/(dashboard)/siswa/payment/actions.ts
"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { environment } from "@/configs/environtment";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  return createSupabaseClient(
    environment.SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════
 * PENTING — PERUBAHAN PERILAKU (fix duplikasi pembayaran):
 *
 * Fungsi ini DULU melakukan fallback "tulis manual ke DB" kalau webhook
 * Midtrans belum sempat masuk. Itu menyebabkan race condition: webhook
 * dan confirmPayment bisa berebut menulis & menyebabkan baris pembayaran
 * dobel (1 dari webhook, 1 dari sini), sehingga total jumlahterbayar /
 * rekap pembayaran tampak 2x lipat.
 *
 * SEKARANG: confirmPayment HANYA membaca status dari database, TIDAK
 * PERNAH menulis/insert/update apapun. Satu-satunya yang boleh menulis
 * status pembayaran adalah webhook (/api/payment/webhook).
 *
 * Fungsi ini dipanggil dari client (snap.pay onSuccess) sebagai cara untuk
 * menampilkan status terbaru ke user sambil menunggu webhook selesai
 * (polling beberapa kali dengan delay), BUKAN sebagai jalur penulisan data.
 * ════════════════════════════════════════════════════════════════════════
 */
export async function confirmPayment(
  tagihanId: string,
  rawOrderId: string,
  nominalBayar?: number,
  pembayaranId?: number
) {
  if (!tagihanId) {
    return { status: "error", message: "ID tagihan tidak valid" };
  }

  const supabase = getAdminClient();
  console.log(
    "🔍 [confirmPayment] (read-only) tagihanId:",
    tagihanId,
    "rawOrderId:",
    rawOrderId
  );

  // Polling singkat: beri waktu webhook untuk masuk & menulis status.
  // Maks ~10 detik (5x percobaan, delay 2 detik), supaya UX tidak terlalu lama
  // menunggu tapi tetap memberi kesempatan webhook bekerja lebih dulu.
  const MAX_ATTEMPTS = 5;
  const DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { data: tagihan, error: fetchError } = await supabase
      .from("tagihan_siswa")
      .select("idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan, jumlahterbayar")
      .eq("idtagihansiswa", tagihanId)
      .single();

    if (fetchError || !tagihan) {
      return {
        status: "error",
        message: `Tagihan tidak ditemukan: ${fetchError?.message}`,
      };
    }

    if (tagihan.statuspembayaran === "LUNAS") {
      console.log(
        `✅ [confirmPayment] Tagihan sudah LUNAS (terverifikasi via webhook), attempt ${attempt}`
      );

      // Ambil jumlah yang benar-benar tercatat di record pembayaran (kalau ada)
      // supaya angka yang ditampilkan ke user akurat, bukan hasil tebakan.
      let jumlahBayarAktual = parseFloat(tagihan.jumlahtagihan || "0");

      if (pembayaranId) {
        const { data: pembayaranRow } = await supabase
          .from("pembayaran")
          .select("jumlahdibayar, statuspembayaran")
          .eq("idpembayaran", pembayaranId)
          .maybeSingle();
        if (pembayaranRow?.statuspembayaran === "SUCCESS") {
          jumlahBayarAktual = parseFloat(pembayaranRow.jumlahdibayar || "0");
        }
      }

      revalidatePath("/siswa/tagihan");
      revalidatePath("/siswa/riwayat");

      return {
        status: "success",
        data: {
          jumlahBayar: jumlahBayarAktual,
          sisaTagihan: 0,
          statusBaru: "LUNAS",
          tagihanId,
          pembayaranId,
        },
      };
    }

    // Belum LUNAS — kalau masih ada kesempatan retry, tunggu lalu coba lagi.
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // Setelah semua percobaan, webhook belum juga selesai memproses.
  // Jangan menulis apapun secara manual — cukup informasikan ke user
  // bahwa status masih diproses, halaman pending sudah punya polling
  // sendiri untuk melanjutkan pengecekan di background.
  return {
    status: "pending",
    message:
      "Pembayaran sedang diverifikasi oleh sistem. Status akan diperbarui otomatis dalam beberapa saat.",
  };
}

/**
 * Ambil detail pembayaran untuk cetak kwitansi per transaksi.
 * (tidak diubah — fungsi ini sudah read-only)
 */
export async function getPembayaranDetail(pembayaranId: number) {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("pembayaran")
    .select(`
      idpembayaran,
      jumlahdibayar,
      tanggalpembayaran,
      metodepembayaran,
      statuspembayaran,
      tagihan_siswa:tagihan_siswa!idtagihansiswa(
        idtagihansiswa,
        jumlahtagihan,
        jumlahterbayar,
        statuspembayaran,
        bulan,
        tahun,
        siswa:siswa!idsiswa(id, namasiswa, kelas, namawali, nowa),
        master_tagihan:master_tagihan!idmastertagihan(namatagihan, jenjang, jenistagihan)
      )
    `)
    .eq("idpembayaran", pembayaranId)
    .single();

  if (error) return { status: "error", message: error.message };
  return { status: "success", data };
}