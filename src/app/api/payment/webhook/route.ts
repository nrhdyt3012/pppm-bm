// src/app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { environment } from "@/configs/environtment";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("🎯 [WEBHOOK] Received:", {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      payment_type: body.payment_type,
    });

    const serverKey = environment.MIDTRANS_SERVER_KEY;
    const { order_id: midtransOrderId, status_code, gross_amount, signature_key } = body;

    // =========================
    // 1. VERIFY SIGNATURE
    // =========================
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${midtransOrderId}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.error("❌ [WEBHOOK] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // =========================
    // 2. EKSTRAK TAGIHAN ID dari order_id
    // Format: PPPM-{idTagihanSantri}-{timestamp}
    // =========================
    let tagihanId: string;
    if (midtransOrderId.startsWith("PPPM-")) {
      // Format baru: PPPM-{id}-{timestamp}
      const parts = midtransOrderId.split("-");
      tagihanId = parts[1]; // ambil id tagihan
    } else {
      // Format lama (fallback)
      tagihanId = midtransOrderId;
    }

    console.log("🔍 [WEBHOOK] Tagihan ID:", tagihanId);

    const supabase = await createClient();

    // =========================
    // 3. CEK TAGIHAN
    // =========================
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_santri")
      .select("idTagihanSantri, statusPembayaran")
      .eq("idTagihanSantri", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", tagihanId);
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("✅ [WEBHOOK] Tagihan found:", {
      id: tagihan.idTagihanSantri,
      currentStatus: tagihan.statusPembayaran,
    });

    // =========================
    // 4. MAP STATUS MIDTRANS
    // =========================
    const midtransStatus = body.transaction_status;
    let statusPembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" = "BELUM BAYAR";

    if (midtransStatus === "settlement" || midtransStatus === "capture") {
      statusPembayaran = "LUNAS";
      console.log("✅ [WEBHOOK] Payment SUCCESS");
    } else if (midtransStatus === "expire") {
      statusPembayaran = "KADALUARSA";
      console.log("⏰ [WEBHOOK] Payment EXPIRED");
    } else if (midtransStatus === "cancel" || midtransStatus === "deny") {
      statusPembayaran = "BELUM BAYAR";
      console.log("❌ [WEBHOOK] Payment FAILED");
    } else {
      console.log("⏳ [WEBHOOK] Payment PENDING:", midtransStatus);
    }

    // =========================
    // 5. UPDATE STATUS TAGIHAN
    // =========================
    const { error: updateError } = await supabase
      .from("tagihan_santri")
      .update({
        statusPembayaran: statusPembayaran,
        updatedAt: new Date().toISOString(),
        ...(statusPembayaran === "KADALUARSA" || statusPembayaran === "BELUM BAYAR"
          ? { paymentToken: null }
          : {}
        ),
      })
      .eq("idTagihanSantri", tagihanId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Update failed:", updateError);
      return NextResponse.json(
        { error: "Gagal update status" },
        { status: 500 }
      );
    }

    console.log("✅ [WEBHOOK] Status updated:", {
      tagihanId,
      newStatus: statusPembayaran,
    });

    // =========================
    // 6. LOG PAYMENT GATEWAY
    // =========================
    await supabase.from("payment_gateway_log").insert({
      id_pembayaran: parseInt(tagihanId),
      order_id: midtransOrderId,
      transaction_status_midtrans: midtransStatus,
      raw_response_midtrans: body,
    });

    return NextResponse.json({
      status: "success",
      order_id: tagihanId,
      updated_status: statusPembayaran,
    });

  } catch (error: any) {
    console.error("💥 [WEBHOOK] Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}