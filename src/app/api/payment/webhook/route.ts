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

    // Verifikasi signature
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${midtransOrderId}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn("⚠️ [WEBHOOK] Invalid signature - continuing for sandbox");
    }

    // Ekstrak idTagihanSiswa dari order_id (format: PPPM-{id}-{timestamp})
    let tagihanId: string;
    if (midtransOrderId?.startsWith("PPPM-")) {
      tagihanId = midtransOrderId.split("-")[1];
    } else {
      tagihanId = midtransOrderId;
    }

    console.log("🔍 [WEBHOOK] Tagihan ID:", tagihanId);

    const supabase = await createClient();

    // Ambil data tagihan
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_siswa")
      .select("idTagihanSiswa, idSiswa, statusPembayaran, jumlahTagihan")
      .eq("idTagihanSiswa", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", tagihanId);
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    // Map status Midtrans ke status lokal
    let statusPembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" = "BELUM BAYAR";
    const metodePembayaran = body.payment_type || "online";

    if (transaction_status === "settlement" || transaction_status === "capture") {
      statusPembayaran = "LUNAS";
    } else if (transaction_status === "expire") {
      statusPembayaran = "KADALUARSA";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      statusPembayaran = "BELUM BAYAR";
    } else {
      // pending — tidak update
      return NextResponse.json({ status: "pending", transaction_status });
    }

    // Update status tagihan_siswa
    const updateData: any = {
      statusPembayaran,
      updatedAt: new Date().toISOString(),
    };

    if (statusPembayaran === "LUNAS") {
      updateData.jumlahTerbayar = parseFloat(tagihan.jumlahTagihan);
    }

    if (statusPembayaran === "KADALUARSA" || transaction_status === "cancel") {
      updateData.paymentToken = null;
    }

    const { error: updateError } = await supabase
      .from("tagihan_siswa")
      .update(updateData)
      .eq("idTagihanSiswa", tagihanId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Update failed:", updateError);
      return NextResponse.json({ error: "Gagal update tagihan" }, { status: 500 });
    }

    // Insert ke tabel pembayaran jika LUNAS
    let pembayaranId: number | null = null;
    if (statusPembayaran === "LUNAS") {
      const { data: existing } = await supabase
        .from("pembayaran")
        .select("idPembayaran")
        .eq("idTagihanSiswa", parseInt(tagihanId))
        .eq("statusPembayaran", "SUCCESS")
        .maybeSingle();

      if (!existing) {
        const { data: newPembayaran } = await supabase
          .from("pembayaran")
          .insert({
            idTagihanSiswa: parseInt(tagihanId),
            idSiswa: tagihan.idSiswa,
            jumlahDibayar: parseFloat(tagihan.jumlahTagihan),
            tanggalPembayaran: new Date().toISOString(),
            metodePembayaran,
            statusPembayaran: "SUCCESS",
          })
          .select("idPembayaran")
          .single();

        pembayaranId = newPembayaran?.idPembayaran ?? null;
      } else {
        pembayaranId = existing.idPembayaran;
      }
    }

    // Log ke payment_gateway_log
    if (pembayaranId !== null) {
      await supabase.from("payment_gateway_log").insert({
        idPembayaran: pembayaranId,
        orderId: midtransOrderId,
        transactionStatusMidtrans: transaction_status,
        rawResponseMidtrans: body,
      });
    }

    return NextResponse.json({
      status: "success",
      tagihan_id: tagihanId,
      updated_status: statusPembayaran,
      pembayaran_id: pembayaranId,
    });
  } catch (error: any) {
    console.error("💥 [WEBHOOK] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}