// src/app/(dashboard)/santri/payment/actions.ts
"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { environment } from "@/configs/environtment";

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
    .from("tagihan_santri")
    .select("idTagihanSantri, idSantri, statusPembayaran, jumlahTagihan")
    .eq("idTagihanSantri", tagihanId)
    .single();

  if (fetchError || !tagihan) {
    const msg = fetchError?.message ?? "Tagihan tidak ditemukan";
    console.error("❌ [confirmPayment] fetch error:", fetchError);
    return { status: "error", message: `Tagihan tidak ditemukan: ${msg}` };
  }

  console.log("📊 [confirmPayment] tagihan:", tagihan);

  // Step 2: Jika sudah LUNAS, langsung return sukses
  if (tagihan.statusPembayaran === "LUNAS") {
    console.log("✅ [confirmPayment] already LUNAS");
    return { status: "success", message: "already_lunas" };
  }

  // Step 3: Update tagihan_santri → LUNAS
  const { error: updateError } = await supabase
    .from("tagihan_santri")
    .update({
      statusPembayaran: "LUNAS",
      updatedAt: new Date().toISOString(),
    })
    .eq("idTagihanSantri", tagihanId);

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
    .select("id_pembayaran")
    .eq("id_tagihan_santri", parseInt(tagihanId))
    .maybeSingle();

  let pembayaranId: number | null = existingPembayaran?.id_pembayaran ?? null;

  if (!existingPembayaran) {
    // Step 5: Insert ke tabel pembayaran
    const insertPayload = {
      id_tagihan_santri: parseInt(tagihanId),
      id_santri: tagihan.idSantri,
      jumlah_dibayar: parseFloat(tagihan.jumlahTagihan),
      tanggal_pembayaran: new Date().toISOString(),
      metode_pembayaran: "midtrans_online",
      status_pembayaran: "SUCCESS",
    };

    console.log("📝 [confirmPayment] inserting pembayaran:", insertPayload);

    const { data: newPembayaran, error: insertError } = await supabase
      .from("pembayaran")
      .insert(insertPayload)
      .select("id_pembayaran")
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
      pembayaranId = newPembayaran.id_pembayaran;
      console.log("✅ [confirmPayment] pembayaran inserted, id:", pembayaranId);
    }
  } else {
    console.log("ℹ️ [confirmPayment] pembayaran exists:", existingPembayaran.id_pembayaran);
  }

  // Step 6: Insert ke payment_gateway_log
  if (pembayaranId !== null) {
    const { error: logError } = await supabase
      .from("payment_gateway_log")
      .insert({
        id_pembayaran: pembayaranId,
        order_id: rawOrderId,
        transaction_status_midtrans: "settlement",
        raw_response_midtrans: {
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

  return { status: "success" };
}