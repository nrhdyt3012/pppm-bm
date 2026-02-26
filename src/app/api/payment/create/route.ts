// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { environment } from "@/configs/environtment";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, gross_amount, customer_name } = body;

    console.log("💳 [Payment API] Request:", { order_id, gross_amount, customer_name });

    // Validasi input
    if (!order_id || !gross_amount || !customer_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validasi environment variables
    if (!environment.MIDTRANS_SERVER_KEY) {
      console.error("❌ MIDTRANS_SERVER_KEY is not set!");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    console.log("🔑 Server key exists:", !!environment.MIDTRANS_SERVER_KEY);

    // Create Snap API instance
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: environment.MIDTRANS_SERVER_KEY,
    });

    // Midtrans order_id harus unik dan string — tambahkan prefix dan timestamp agar tidak bentrok
    const midtransOrderId = `PPPM-${order_id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(Number(gross_amount)), // harus integer
      },
      customer_details: {
        first_name: customer_name,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/santri/payment/success?order_id=${order_id}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/santri/payment/failed?order_id=${order_id}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/santri/tagihan`,
      },
    };

    console.log("📦 Midtrans parameter:", JSON.stringify(parameter, null, 2));

    const transaction = await snap.createTransaction(parameter);

    console.log("✅ Midtrans transaction created:", {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("💥 Payment creation error:", error);
    console.error("💥 Error details:", JSON.stringify(error, null, 2));

    // Midtrans error biasanya punya ApiResponse
    const midtransError = error?.ApiResponse || error?.message || "Failed to create payment";

    return NextResponse.json(
      { error: midtransError },
      { status: 500 }
    );
  }
}