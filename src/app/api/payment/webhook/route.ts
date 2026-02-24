// src/app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { environment } from "@/configs/environtment";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
      .select("idTagihanSantri")
      .eq("idTagihanSantri", order_id)
      .single();

    if (tagihanError || !tagihan) {
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 }
      );
    }

    // =========================
    // 3. CEK PEMBAYARAN
    // =========================
    const { data: pembayaran } = await supabase
      .from("pembayaran")
      .select("id_pembayaran, status_pembayaran")
      .eq("id_tagihan_santri", tagihan.idTagihanSantri)
      .maybeSingle();

    // =========================
    // 4. MAP STATUS MIDTRANS
    // =========================
    const midtransStatus = body.transaction_status;

    let statusPembayaran: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" =
      "PENDING";

    if (midtransStatus === "settlement" || midtransStatus === "capture") {
      statusPembayaran = "SUCCESS";
    } else if (midtransStatus === "expire") {
      statusPembayaran = "EXPIRED";
    } else if (midtransStatus === "cancel" || midtransStatus === "deny") {
      statusPembayaran = "FAILED";
    }

    // =========================
    // 5. INSERT / UPDATE PEMBAYARAN
    // =========================
    let idPembayaran: string;

    if (!pembayaran) {
      const { data: newPembayaran, error } = await supabase
        .from("pembayaran")
        .insert({
          id_tagihan_santri: tagihan.idTagihanSantri,
          id_santri: body.custom_field1,
          jumlah_dibayar: parseFloat(gross_amount),
          metode_pembayaran: body.payment_type,
          status_pembayaran: statusPembayaran,
        })
        .select("id_pembayaran")
        .single();

      if (error || !newPembayaran) {
        throw new Error("Gagal membuat pembayaran");
      }

      idPembayaran = newPembayaran.id_pembayaran;
    } else {
      idPembayaran = pembayaran.id_pembayaran;

      await supabase
        .from("pembayaran")
        .update({ status_pembayaran: statusPembayaran })
        .eq("id_pembayaran", idPembayaran);
    }

    // =========================
    // 6. LOG PAYMENT GATEWAY
    // =========================
    await supabase.from("payment_gateway_log").insert({
      id_pembayaran: idPembayaran,
      order_id,
      transaction_status_midtrans: midtransStatus,
      raw_response_midtrans: body,
    });

    // =========================
    // 7. UPDATE STATUS TAGIHAN
    // =========================
    if (statusPembayaran === "SUCCESS") {
      await supabase
        .from("tagihan_santri")
        .update({
          status_pembayaran: "LUNAS",
          updated_at: new Date().toISOString(),
        })
        .eq("idTagihanSantri", order_id);
    }

    if (statusPembayaran === "EXPIRED" || statusPembayaran === "FAILED") {
      await supabase
        .from("tagihan_santri")
        .update({
          payment_token: null,
        })
        .eq("idTagihanSantri", order_id);
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
