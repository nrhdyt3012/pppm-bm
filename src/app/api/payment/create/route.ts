// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { environment } from "@/configs/environtment";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, gross_amount, customer_name } = body;

    // Validasi input
    if (!order_id || !gross_amount || !customer_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Snap API instance
    const snap = new midtransClient.Snap({
      isProduction: false, // Set to true for production
      serverKey: environment.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount,
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

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
