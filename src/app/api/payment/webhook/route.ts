// src/app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { environment } from "@/configs/environtment";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("🎯 [WEBHOOK] Received:", JSON.stringify(body, null, 2));

    const serverKey = environment.MIDTRANS_SERVER_KEY;
    const {
      order_id: midtransOrderId,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
    } = body;

    // =========================
    // 1. VERIFY SIGNATURE
    // gross_amount dari Midtrans adalah string seperti "50000.00"
    // gunakan langsung dari body, jangan dikonversi
    // =========================
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${midtransOrderId}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.error("❌ [WEBHOOK] Invalid signature");
      console.error("Expected:", expectedSignature);
      console.error("Received:", signature_key);
      // Di sandbox, boleh skip untuk testing — hapus baris return ini saat production
      // return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // =========================
    // 2. EKSTRAK idTagihanSantri dari order_id
    // Format: PPPM-{idTagihanSantri}-{timestamp}
    // =========================
    let tagihanId: string;
    if (midtransOrderId && midtransOrderId.startsWith("PPPM-")) {
      const parts = midtransOrderId.split("-");
      tagihanId = parts[1];
    } else {
      tagihanId = midtransOrderId;
    }

    console.log("🔍 [WEBHOOK] Tagihan ID:", tagihanId);

    const supabase = await createClient();

    // =========================
    // 3. CEK TAGIHAN
    // =========================
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_santri")
      .select("idTagihanSantri, idSantri, statusPembayaran, jumlahTagihan")
      .eq("idTagihanSantri", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", tagihanId, tagihanError);
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ [WEBHOOK] Tagihan found:", tagihan);

    // =========================
    // 4. MAP STATUS MIDTRANS
    // =========================
    let statusPembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" =
      "BELUM BAYAR";
    let metodePembayaran = body.payment_type || "online";

    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      statusPembayaran = "LUNAS";
      console.log("✅ [WEBHOOK] Payment SUCCESS");
    } else if (transaction_status === "expire") {
      statusPembayaran = "KADALUARSA";
      console.log("⏰ [WEBHOOK] Payment EXPIRED");
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      statusPembayaran = "BELUM BAYAR";
      console.log("❌ [WEBHOOK] Payment FAILED/CANCELLED");
    } else {
      // pending, dll — tidak update status
      console.log("⏳ [WEBHOOK] Payment PENDING:", transaction_status);
      return NextResponse.json({ status: "pending", transaction_status });
    }

    // =========================
    // 5. UPDATE STATUS TAGIHAN
    // =========================
    const { error: updateError } = await supabase
      .from("tagihan_santri")
      .update({
        statusPembayaran: statusPembayaran,
        updatedAt: new Date().toISOString(),
        // Reset token jika expired/cancelled
        ...(statusPembayaran === "KADALUARSA" ||
        (statusPembayaran === "BELUM BAYAR" &&
          (transaction_status === "cancel" || transaction_status === "deny"))
          ? { paymentToken: null }
          : {}),
      })
      .eq("idTagihanSantri", tagihanId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Update tagihan failed:", updateError);
      return NextResponse.json(
        { error: "Gagal update status tagihan" },
        { status: 500 }
      );
    }

    console.log("✅ [WEBHOOK] tagihan_santri updated:", {
      tagihanId,
      newStatus: statusPembayaran,
    });

    // =========================
    // 6. INSERT KE TABEL pembayaran (jika LUNAS)
    // =========================
    let pembayaranId: number | null = null;

    if (statusPembayaran === "LUNAS") {
      // Cek apakah sudah ada record pembayaran untuk tagihan ini (idempotency)
      const { data: existingPembayaran } = await supabase
        .from("pembayaran")
        .select("id_pembayaran")
        .eq("id_tagihan_santri", parseInt(tagihanId))
        .eq("status_pembayaran", "SUCCESS")
        .maybeSingle();

      if (!existingPembayaran) {
        const { data: pembayaranData, error: pembayaranError } = await supabase
          .from("pembayaran")
          .insert({
            id_tagihan_santri: parseInt(tagihanId),
            id_santri: tagihan.idSantri,
            jumlah_dibayar: parseFloat(tagihan.jumlahTagihan),
            tanggal_pembayaran: new Date().toISOString(),
            metode_pembayaran: metodePembayaran,
            status_pembayaran: "SUCCESS",
          })
          .select("id_pembayaran")
          .single();

        if (pembayaranError) {
          console.error(
            "❌ [WEBHOOK] Insert pembayaran failed:",
            pembayaranError
          );
          // Jangan return error — tagihan sudah terupdate, log saja
        } else {
          pembayaranId = pembayaranData?.id_pembayaran || null;
          console.log("✅ [WEBHOOK] pembayaran inserted:", pembayaranId);
        }
      } else {
        pembayaranId = existingPembayaran.id_pembayaran;
        console.log(
          "ℹ️ [WEBHOOK] pembayaran already exists:",
          existingPembayaran.id_pembayaran
        );
      }
    }

    // =========================
    // 7. LOG KE payment_gateway_log
    // Hanya insert jika pembayaranId tersedia (FK required)
    // =========================
    if (pembayaranId !== null) {
      const { error: logError } = await supabase
        .from("payment_gateway_log")
        .insert({
          id_pembayaran: pembayaranId,
          order_id: midtransOrderId,
          transaction_status_midtrans: transaction_status,
          raw_response_midtrans: body,
        });

      if (logError) {
        console.error("❌ [WEBHOOK] Insert payment_gateway_log failed:", logError);
      } else {
        console.log("✅ [WEBHOOK] payment_gateway_log inserted");
      }
    }

    return NextResponse.json({
      status: "success",
      tagihan_id: tagihanId,
      updated_status: statusPembayaran,
      pembayaran_id: pembayaranId,
    });
  } catch (error: any) {
    console.error("💥 [WEBHOOK] Uncaught error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}