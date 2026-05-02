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
 * Midtrans sekarang hanya untuk pembayaran PENUH.
 * Fungsi ini sebagai fallback ketika webhook tidak terpanggil (localhost/dev).
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

  // Kalau sudah LUNAS (webhook sudah berhasil update duluan), return langsung
  if (tagihan.statuspembayaran === "LUNAS") {
    console.log("✅ [confirmPayment] Tagihan sudah LUNAS sebelumnya");
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

  // Cari record pembayaran yang terkait (PENDING atau sudah SUCCESS)
  let targetPembayaran: any = null;

  if (pembayaranId) {
    // Coba cari by id langsung
    const { data } = await supabase
      .from("pembayaran")
      .select("idpembayaran, statuspembayaran, jumlahdibayar")
      .eq("idpembayaran", pembayaranId)
      .maybeSingle();
    targetPembayaran = data;
  }

  // Fallback: cari PENDING record berdasarkan tagihan
  if (!targetPembayaran) {
    const { data } = await supabase
      .from("pembayaran")
      .select("idpembayaran, statuspembayaran, jumlahdibayar")
      .eq("idtagihansiswa", parseInt(tagihanId))
      .in("statuspembayaran", ["PENDING", "SUCCESS"])
      .order("idpembayaran", { ascending: false })
      .limit(1)
      .maybeSingle();
    targetPembayaran = data;
  }

  // Kalau record pembayaran sudah SUCCESS tapi tagihan belum terupdate
  // (bisa terjadi jika webhook partial berhasil tapi ada race condition)
  if (targetPembayaran?.statuspembayaran === "SUCCESS") {
    console.log("✅ [confirmPayment] Pembayaran sudah SUCCESS, sync tagihan");
    await supabase
      .from("tagihan_siswa")
      .update({
        statuspembayaran: "LUNAS",
        jumlahterbayar: jumlahTagihan,
        updatedat: new Date().toISOString(),
      })
      .eq("idtagihansiswa", tagihanId);

    revalidatePath("/siswa/tagihan");
    revalidatePath("/siswa/riwayat");
    return {
      status: "success",
      data: {
        jumlahBayar: parseFloat(targetPembayaran.jumlahdibayar || "0") || jumlahTagihan,
        sisaTagihan: 0,
        statusBaru: "LUNAS",
        tagihanId,
      },
    };
  }

  // === FALLBACK UTAMA: Webhook tidak terpanggil (localhost/dev) ===
  // Status pembayaran masih PENDING → kita update manual ke SUCCESS
  const nominalYangDibayar = nominalBayar || jumlahTagihan; // Midtrans = full payment

  console.log(`🔧 [confirmPayment] Webhook tidak terpanggil. Update manual. Nominal: ${nominalYangDibayar}`);

  // Update tagihan_siswa → LUNAS
  const { error: updateTagihanError } = await supabase
    .from("tagihan_siswa")
    .update({
      statuspembayaran: "LUNAS",
      jumlahterbayar: jumlahTagihan, // selalu penuh karena Midtrans = full
      updatedat: new Date().toISOString(),
    })
    .eq("idtagihansiswa", tagihanId);

  if (updateTagihanError) {
    return { status: "error", message: `Gagal update tagihan: ${updateTagihanError.message}` };
  }

  // Update atau insert record pembayaran → SUCCESS
  let finalPembayaranId = targetPembayaran?.idpembayaran ?? null;

  if (targetPembayaran?.idpembayaran) {
    // Update PENDING → SUCCESS
    await supabase
      .from("pembayaran")
      .update({
        statuspembayaran: "SUCCESS",
        jumlahdibayar: nominalYangDibayar,
        tanggalpembayaran: new Date().toISOString(),
        metodepembayaran: "midtrans_online",
      })
      .eq("idpembayaran", targetPembayaran.idpembayaran);
  } else {
    // Tidak ada record sama sekali → insert baru
    const { data: newPembayaran } = await supabase
      .from("pembayaran")
      .insert({
        idtagihansiswa: parseInt(tagihanId),
        idsiswa: tagihan.idsiswa,
        jumlahdibayar: nominalYangDibayar,
        tanggalpembayaran: new Date().toISOString(),
        metodepembayaran: "midtrans_online",
        statuspembayaran: "SUCCESS",
      })
      .select("idpembayaran")
      .single();
    finalPembayaranId = newPembayaran?.idpembayaran ?? null;
  }

  // Log ke payment_gateway_log sebagai fallback record
  if (finalPembayaranId !== null) {
    await supabase.from("payment_gateway_log").insert({
      idpembayaran: finalPembayaranId,
      orderid: rawOrderId,
      transactionstatusmidtrans: "settlement",
      rawresponsemidtrans: {
        note: "Confirmed from success callback page (webhook fallback)",
        raw_order_id: rawOrderId,
        tagihan_id: tagihanId,
        nominal_bayar: nominalYangDibayar,
        timestamp: new Date().toISOString(),
      },
    });
  }

  revalidatePath("/siswa/tagihan");
  revalidatePath("/siswa/riwayat");

  // Kirim kwitansi email jika pembayaran sukses
  if (finalPembayaranId !== null) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      await fetch(`${appUrl}/api/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPembayaran: finalPembayaranId,
          idTagihan: parseInt(tagihanId),
          jumlahBayar: nominalYangDibayar,
          totalTagihan: jumlahTagihan,
          sisaTagihan: 0,
          statusBaru: "LUNAS",
          metodePembayaran: "midtrans_online",
        }),
      });
      console.log(`📧 [confirmPayment] Receipt email queued for pembayaran ${finalPembayaranId}`);
    } catch (emailError) {
      console.error(`⚠️ [confirmPayment] Failed to queue receipt email:`, emailError);
      // Jangan stop execution jika email fail
    }
  }

  return {
    status: "success",
    data: {
      jumlahBayar: nominalYangDibayar,
      sisaTagihan: 0,
      statusBaru: "LUNAS",
      tagihanId,
      pembayaranId: finalPembayaranId,
    },
  };
}

/**
 * Ambil detail pembayaran untuk cetak kwitansi per transaksi.
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