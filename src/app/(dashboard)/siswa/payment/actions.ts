// src/app/(dashboard)/santri/payment/actions.ts
"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { environment } from "@/configs/environtment";
import { revalidatePath } from "next/cache";

// Gunakan plain supabase-js client dengan service role key
// createServerClient dari @supabase/ssr TIDAK bypass RLS meski pakai service role
// createClient dari @supabase/supabase-js dengan service role key BYPASS RLS
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

export async function confirmPayment(tagihanId: string, rawOrderId: string) {
  if (!tagihanId) {
    return { status: "error", message: "ID tagihan tidak valid" };
  }

  const supabase = getAdminClient();

  console.log("🔄 [confirmPayment] tagihanId:", tagihanId);

  // Step 1: Ambil data tagihan
  const { data: tagihan, error: fetchError } = await supabase
    .from("tagihan_siswa")
    .select("idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan")
    .eq("idtagihansiswa", tagihanId)
    .single();

  if (fetchError || !tagihan) {
    const msg = fetchError?.message ?? "Tagihan tidak ditemukan";
    console.error("❌ [confirmPayment] fetch error:", fetchError);
    return { status: "error", message: `Tagihan tidak ditemukan: ${msg}` };
  }

  console.log("📊 [confirmPayment] tagihan:", tagihan);

  // Step 2: Jika sudah LUNAS, langsung return sukses
  if (tagihan.statuspembayaran === "LUNAS") {
    console.log("✅ [confirmPayment] already LUNAS");
    return { status: "success", message: "already_lunas" };
  }

  // Step 3: Update tagihan_siswa → LUNAS
  const { error: updateError } = await supabase
    .from("tagihan_siswa")
    .update({
      statuspembayaran: "LUNAS",
      updatedat: new Date().toISOString(),
    })
    .eq("idtagihansiswa", tagihanId);

  if (updateError) {
    console.error("❌ [confirmPayment] update error:", updateError);
    return {
      status: "error",
      message: `Gagal update tagihan: ${updateError.message}`,
    };
  }

  console.log("✅ [confirmPayment] tagihan updated to LUNAS");

  // Step 4: Cek apakah record pembayaran sudah ada (idempotent)
  const { data: existingPembayaran } = await supabase
    .from("pembayaran")
    .select("idpembayaran")
    .eq("idtagihansiswa", parseInt(tagihanId))
    .maybeSingle();

  let pembayaranId: number | null = existingPembayaran?.idpembayaran ?? null;

  if (!existingPembayaran) {
    // Step 5: Insert ke tabel pembayaran
    const insertPayload = {
      idtagihansiswa: parseInt(tagihanId),
      idsiswa: tagihan.idsiswa,
      jumlahdibayar: parseFloat(tagihan.jumlahtagihan),
      tanggalpembayaran: new Date().toISOString(),
      metodepembayaran: "midtrans_online",
      statuspembayaran: "SUCCESS",
    };

    console.log("📝 [confirmPayment] inserting pembayaran:", insertPayload);

    const { data: newPembayaran, error: insertError } = await supabase
      .from("pembayaran")
      .insert(insertPayload)
      .select("idpembayaran")
      .single();

    if (insertError) {
      console.error("❌ [confirmPayment] insert pembayaran error:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });
      // Tidak fatal — tagihan sudah LUNAS
    } else {
      pembayaranId = newPembayaran.idpembayaran;
      console.log("✅ [confirmPayment] pembayaran inserted, id:", pembayaranId);
    }
  } else {
    console.log("ℹ️ [confirmPayment] pembayaran exists:", existingPembayaran.idpembayaran);
  }

  // Step 6: Insert ke payment_gateway_log
  if (pembayaranId !== null) {
    const { error: logError } = await supabase
      .from("payment_gateway_log")
      .insert({
        idpembayaran: pembayaranId,
        orderid: rawOrderId,
        transactionstatusmidtrans: "settlement",
        rawresponsemidtrans: {
          note: "Confirmed from success callback page",
          raw_order_id: rawOrderId,
          tagihan_id: tagihanId,
          timestamp: new Date().toISOString(),
        },
      });

    if (logError) {
      console.error("⚠️ [confirmPayment] insert log error:", logError);
    } else {
      console.log("✅ [confirmPayment] payment_gateway_log inserted");
    }
  }

  // Revalidate cache untuk halaman tagihan
  revalidatePath("/siswa/tagihan");
  revalidatePath("/siswa/riwayat");

  return { status: "success" };
}