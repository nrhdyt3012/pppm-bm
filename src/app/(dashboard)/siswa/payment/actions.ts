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
 * Konfirmasi pembayaran setelah Midtrans callback.
 * Mendukung partial payment: update jumlahterbayar & sisa tanpa set LUNAS kalau belum full.
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
  console.log("🔄 [confirmPayment] tagihanId:", tagihanId, "nominalBayar:", nominalBayar, "pembayaranId:", pembayaranId);

  // Ambil data tagihan terbaru
  const { data: tagihan, error: fetchError } = await supabase
    .from("tagihan_siswa")
    .select("idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan, jumlahterbayar")
    .eq("idtagihansiswa", tagihanId)
    .single();

  if (fetchError || !tagihan) {
    return { status: "error", message: `Tagihan tidak ditemukan: ${fetchError?.message}` };
  }

  const jumlahTagihan = parseFloat(tagihan.jumlahtagihan || "0");
  const sudahBayar = parseFloat(tagihan.jumlahterbayar || "0");

  // Kalau webhook sudah update, status mungkin sudah benar
  // Kita cek apakah pembayaran sudah tercatat
  if (pembayaranId) {
    const { data: existingPembayaran } = await supabase
      .from("pembayaran")
      .select("idpembayaran, statuspembayaran, jumlahdibayar")
      .eq("idpembayaran", pembayaranId)
      .maybeSingle();

    if (existingPembayaran && existingPembayaran.statuspembayaran === "SUCCESS") {
      // Webhook sudah handle, cukup revalidate
      revalidatePath("/siswa/tagihan");
      revalidatePath("/siswa/riwayat");
      return {
        status: "success",
        data: {
          jumlahBayar: parseFloat(existingPembayaran.jumlahdibayar || "0"),
          sisaTagihan: jumlahTagihan - sudahBayar,
          statusBaru: tagihan.statuspembayaran,
          tagihanId,
        },
      };
    }

    if (existingPembayaran && existingPembayaran.statuspembayaran === "PARTIAL") {
      revalidatePath("/siswa/tagihan");
      revalidatePath("/siswa/riwayat");
      return {
        status: "success",
        data: {
          jumlahBayar: parseFloat(existingPembayaran.jumlahdibayar || "0"),
          sisaTagihan: jumlahTagihan - sudahBayar,
          statusBaru: tagihan.statuspembayaran,
          tagihanId,
        },
      };
    }
  }

  // Fallback: webhook belum jalan (misal dev/localhost), kita update manual
  const nominalYangDibayar = nominalBayar || 0;

  if (nominalYangDibayar <= 0) {
    // Tidak ada info nominal — cek apakah sudah LUNAS dari status existing
    if (tagihan.statuspembayaran === "LUNAS") {
      revalidatePath("/siswa/tagihan");
      revalidatePath("/siswa/riwayat");
      return {
        status: "success",
        data: {
          jumlahBayar: jumlahTagihan,
          sisaTagihan: 0,
          statusBaru: "LUNAS",
          tagihanId,
        },
      };
    }
    return { status: "error", message: "Nominal pembayaran tidak diketahui. Tunggu konfirmasi sistem." };
  }

  // Hitung sisa baru
  const terbayarBaru = sudahBayar + nominalYangDibayar;
  const sisaBaru = Math.max(0, jumlahTagihan - terbayarBaru);
  const statusBaru = sisaBaru < 0.01 ? "LUNAS" : "BELUM BAYAR";
  const statusRecord: "SUCCESS" | "PARTIAL" = statusBaru === "LUNAS" ? "SUCCESS" : "PARTIAL";

  // Jika sudah LUNAS sebelumnya, skip
  if (tagihan.statuspembayaran === "LUNAS") {
    revalidatePath("/siswa/tagihan");
    revalidatePath("/siswa/riwayat");
    return {
      status: "success",
      data: { jumlahBayar: nominalYangDibayar, sisaTagihan: 0, statusBaru: "LUNAS", tagihanId },
    };
  }

  // Update tagihan_siswa
  const { error: updateError } = await supabase
    .from("tagihan_siswa")
    .update({
      statuspembayaran: statusBaru,
      jumlahterbayar: statusBaru === "LUNAS" ? jumlahTagihan : terbayarBaru,
      updatedat: new Date().toISOString(),
    })
    .eq("idtagihansiswa", tagihanId);

  if (updateError) {
    return { status: "error", message: `Gagal update tagihan: ${updateError.message}` };
  }

  // Update atau insert record pembayaran
  let finalPembayaranId = pembayaranId ?? null;

  if (pembayaranId) {
    await supabase
      .from("pembayaran")
      .update({
        statuspembayaran: statusRecord,
        tanggalpembayaran: new Date().toISOString(),
        metodepembayaran: "midtrans_online",
        jumlahdibayar: nominalYangDibayar,
      })
      .eq("idpembayaran", pembayaranId);
  } else {
    // Cek apakah ada PENDING
    const { data: existingPending } = await supabase
      .from("pembayaran")
      .select("idpembayaran")
      .eq("idtagihansiswa", parseInt(tagihanId))
      .eq("statuspembayaran", "PENDING")
      .maybeSingle();

    if (existingPending) {
      await supabase
        .from("pembayaran")
        .update({
          statuspembayaran: statusRecord,
          tanggalpembayaran: new Date().toISOString(),
          metodepembayaran: "midtrans_online",
          jumlahdibayar: nominalYangDibayar,
        })
        .eq("idpembayaran", existingPending.idpembayaran);
      finalPembayaranId = existingPending.idpembayaran;
    } else {
      const { data: newPembayaran } = await supabase
        .from("pembayaran")
        .insert({
          idtagihansiswa: parseInt(tagihanId),
          idsiswa: tagihan.idsiswa,
          jumlahdibayar: nominalYangDibayar,
          tanggalpembayaran: new Date().toISOString(),
          metodepembayaran: "midtrans_online",
          statuspembayaran: statusRecord,
        })
        .select("idpembayaran")
        .single();
      finalPembayaranId = newPembayaran?.idpembayaran ?? null;
    }
  }

  // Log gateway
  if (finalPembayaranId !== null) {
    await supabase.from("payment_gateway_log").insert({
      idpembayaran: finalPembayaranId,
      orderid: rawOrderId,
      transactionstatusmidtrans: "settlement",
      rawresponsemidtrans: {
        note: "Confirmed from success callback page (fallback)",
        raw_order_id: rawOrderId,
        tagihan_id: tagihanId,
        nominal_bayar: nominalYangDibayar,
        timestamp: new Date().toISOString(),
      },
    });
  }

  revalidatePath("/siswa/tagihan");
  revalidatePath("/siswa/riwayat");

  return {
    status: "success",
    data: {
      jumlahBayar: nominalYangDibayar,
      sisaTagihan: statusBaru === "LUNAS" ? 0 : sisaBaru,
      statusBaru,
      tagihanId,
      pembayaranId: finalPembayaranId,
    },
  };
}

/**
 * Ambil detail pembayaran untuk cetak kwitansi per transaksi.
 * Digunakan di halaman riwayat & success.
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