// src/app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { environment } from "@/configs/environtment";

const crypto = require("crypto");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify signature
    const serverKey = environment.MIDTRANS_SERVER_KEY;
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;

    const signatureKey = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    if (signatureKey !== body.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const supabase = await createClient();

    // Update tagihan status based on transaction status
    if (
      body.transaction_status === "settlement" ||
      body.transaction_status === "capture"
    ) {
      // Payment success
      await supabase
        .from("tagihan_santri")
        .update({
          status_pembayaran: "LUNAS",
          updated_at: new Date().toISOString(),
        })
        .eq("id_tagihan_santri", orderId);
    } else if (
      body.transaction_status === "expire" ||
      body.transaction_status === "cancel"
    ) {
      // Payment expired or cancelled
      await supabase
        .from("tagihan_santri")
        .update({
          payment_token: null,
        })
        .eq("id_tagihan_santri", orderId);
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
