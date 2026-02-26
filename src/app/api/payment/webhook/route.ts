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
    const { order_id, status_code, gross_amount, signature_key } = body;

    // =========================
    // 1. VERIFY SIGNATURE
    // =========================
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.error("❌ [WEBHOOK] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // =========================
    // 2. CEK TAGIHAN
    // =========================
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_santri")
      .select("idTagihanSantri, statusPembayaran")
      .eq("idTagihanSantri", order_id)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", order_id);
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
    // 3. MAP STATUS MIDTRANS
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
      console.log("⏳ [WEBHOOK] Payment PENDING");
    }

    // =========================
    // 4. UPDATE STATUS TAGIHAN
    // =========================
    const { error: updateError } = await supabase
      .from("tagihan_santri")
      .update({
        statusPembayaran: statusPembayaran,  // ⭐ PERBAIKAN: Gunakan camelCase
        updatedAt: new Date().toISOString(),
        ...(statusPembayaran === "KADALUARSA" || statusPembayaran === "BELUM BAYAR" 
          ? { paymentToken: null }  // Reset token jika gagal/expire
          : {}
        ),
      })
      .eq("idTagihanSantri", order_id);

    if (updateError) {
      console.error("❌ [WEBHOOK] Update failed:", updateError);
      return NextResponse.json(
        { error: "Gagal update status" },
        { status: 500 }
      );
    }

    console.log("✅ [WEBHOOK] Status updated:", {
      order_id,
      newStatus: statusPembayaran,
    });

    // =========================
    // 5. LOG PAYMENT GATEWAY
    // =========================
    await supabase.from("payment_gateway_log").insert({
      id_pembayaran: tagihan.idTagihanSantri,
      order_id,
      transaction_status_midtrans: midtransStatus,
      raw_response_midtrans: body,
    });

    return NextResponse.json({ 
      status: "success",
      order_id,
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