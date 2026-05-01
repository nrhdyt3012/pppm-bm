// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { environment } from "@/configs/environtment";
import { createClient } from "@/lib/supabase/server";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, gross_amount, nominal_total, customer_name, customer_id } = body;

    if (!order_id || !gross_amount || !customer_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!environment.MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const supabase = await createClient({ isAdmin: true });

    // Cek apakah ada record pembayaran PENDING yang sudah ada untuk tagihan ini
    // (Untuk menghindari duplikat saat retry)
    const { data: existingPending } = await supabase
      .from("pembayaran")
      .select("idpembayaran")
      .eq("idtagihansiswa", parseInt(order_id))
      .eq("statuspembayaran", "PENDING")
      .maybeSingle();

    // Hapus PENDING lama jika ada (diganti dengan yang baru)
    if (existingPending) {
      await supabase
        .from("pembayaran")
        .delete()
        .eq("idpembayaran", existingPending.idpembayaran);
    }

    // Insert record pembayaran PENDING baru
    const { data: newPembayaran, error: insertError } = await supabase
      .from("pembayaran")
      .insert({
        idtagihansiswa: parseInt(order_id),
        idsiswa: customer_id,
        jumlahdibayar: gross_amount,
        metodepembayaran: "midtrans",
        statuspembayaran: "PENDING",
      })
      .select("idpembayaran")
      .single();

    if (insertError) {
      console.error("Error insert pembayaran:", insertError);
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: environment.MIDTRANS_SERVER_KEY,
    });

    // Format order_id: PPPM-{idTagihanSiswa}-{idPembayaran}-{timestamp}
    // Menyertakan idPembayaran agar webhook bisa langsung update record yang tepat
    const pembayaranId = newPembayaran?.idpembayaran ?? Date.now();
    const midtransOrderId = `PPPM-${order_id}-${pembayaranId}-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Encode semua data yang diperlukan ke callback URL
    const successUrl = new URL(`${appUrl}/siswa/payment/success`);
    successUrl.searchParams.set("order_id", order_id);
    successUrl.searchParams.set("amount", gross_amount.toString());
    successUrl.searchParams.set("total", (nominal_total || gross_amount).toString());
    successUrl.searchParams.set("pembayaran_id", pembayaranId.toString());

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(Number(gross_amount)),
      },
      customer_details: {
        first_name: customer_name,
        customer_id: customer_id,
      },
      callbacks: {
        finish: successUrl.toString(),
        error: `${appUrl}/siswa/payment/failed?order_id=${order_id}`,
        pending: `${appUrl}/siswa/tagihan`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      pembayaran_id: pembayaranId,
      midtrans_order_id: midtransOrderId,
    });
  } catch (error: any) {
    const midtransError = error?.ApiResponse || error?.message || "Failed to create payment";
    return NextResponse.json({ error: midtransError }, { status: 500 });
  }
}