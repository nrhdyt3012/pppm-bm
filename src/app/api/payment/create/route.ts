// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { environment } from "@/configs/environtment";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, gross_amount, customer_name } = body;

    if (!order_id || !gross_amount || !customer_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!environment.MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: environment.MIDTRANS_SERVER_KEY,
    });

    // Format order_id: PPPM-{idTagihanSiswa}-{timestamp}
    const midtransOrderId = `PPPM-${order_id}-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(Number(gross_amount)),
      },
      customer_details: {
        first_name: customer_name,
      },
      callbacks: {
        finish: `${appUrl}/siswa/payment/success?order_id=${order_id}`,
        error: `${appUrl}/siswa/payment/failed?order_id=${order_id}`,
        pending: `${appUrl}/siswa/tagihan`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    const midtransError = error?.ApiResponse || error?.message || "Failed to create payment";
    return NextResponse.json({ error: midtransError }, { status: 500 });
  }
}