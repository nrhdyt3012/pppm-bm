// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { environment } from "@/configs/environtment";
import { createClient } from "@/lib/supabase/server";

const midtransClient = require("midtrans-client");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      gross_amount,
      nominal_total,
      customer_name,
      customer_id,
    } = body;

    if (!order_id || !gross_amount || !customer_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!environment.MIDTRANS_SERVER_KEY) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient({ isAdmin: true });

    // Jika tagihan sebelumnya KADALUARSA, reset ke BELUM BAYAR
    // supaya tagihan kembali muncul normal & bisa diproses ulang
    const { data: tagihanNow } = await supabase
      .from("tagihan_siswa")
      .select("statuspembayaran")
      .eq("idtagihansiswa", parseInt(order_id))
      .single();

    if (tagihanNow?.statuspembayaran === "KADALUARSA") {
      await supabase
        .from("tagihan_siswa")
        .update({
          statuspembayaran: "BELUM BAYAR",
          paymenttoken: null,
          updatedat: new Date().toISOString(),
        })
        .eq("idtagihansiswa", parseInt(order_id));
    }

    // Hapus semua record PENDING lama untuk tagihan ini
    // (agar tidak terjadi duplikat saat retry)
    await supabase
      .from("pembayaran")
      .delete()
      .eq("idtagihansiswa", parseInt(order_id))
      .eq("statuspembayaran", "PENDING");

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
    const pembayaranId = newPembayaran?.idpembayaran ?? Date.now();
    const midtransOrderId = `PPPM-${order_id}-${pembayaranId}-${Date.now()}`;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const successUrl = new URL(`${appUrl}/siswa/payment/success`);
    successUrl.searchParams.set("order_id", order_id);
    successUrl.searchParams.set("amount", gross_amount.toString());
    successUrl.searchParams.set(
      "total",
      (nominal_total || gross_amount).toString()
    );
    successUrl.searchParams.set("pembayaran_id", pembayaranId.toString());

    // Waktu kadaluarsa token: 24 jam dari sekarang
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    const expiryStr = expiry
      .toISOString()
      .replace("T", " ")
      .substring(0, 19) + " +0700";

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(Number(gross_amount)),
      },
      customer_details: {
        first_name: customer_name,
        customer_id: customer_id,
      },

      // ─── Metode pembayaran yang ditampilkan di popup Snap ──────────────
      // Hapus baris ini jika ingin menampilkan semua metode aktif di akun Midtrans
      enabled_payments: [
        // Transfer Virtual Account
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "other_va",      // bank lain via VA Midtrans
        "echannel",      // Mandiri Bill Payment

        // Dompet Digital
        "gopay",
        "shopeepay",

        // QRIS (scan QR, support semua bank & e-wallet)
        "qris",

        // Kartu Kredit / Debit
        "credit_card",

        // Gerai / Over-the-counter
        "indomaret",
        "alfamart",
      ],
      // ───────────────────────────────────────────────────────────────────

      // Token kadaluarsa dalam 24 jam
      expiry: {
        start_time: new Date()
          .toISOString()
          .replace("T", " ")
          .substring(0, 19) + " +0700",
        unit: "hours",
        duration: 24,
      },

      callbacks: {
        finish: successUrl.toString(),
        error: `${appUrl}/siswa/payment/failed?order_id=${order_id}`,
        pending: `${appUrl}/siswa/payment/pending?order_id=${order_id}&pembayaran_id=${pembayaranId}`,
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
    const midtransError =
      error?.ApiResponse || error?.message || "Failed to create payment";
    return NextResponse.json({ error: midtransError }, { status: 500 });
  }
}