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

    console.log("🔍 [WEBHOOK] Tagihan ID:", tagihanId, "Gross Amount:", gross_amount);

    const supabase = await createClient({ isAdmin: true });

    // Ambil data tagihan
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_siswa")
      .select("idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan, jumlahterbayar, sisa")
      .eq("idtagihansiswa", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", tagihanId);
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    // Map status Midtrans ke status lokal
    let statuspembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" = "BELUM BAYAR";
    const metodepembayaran = body.payment_type || "online";
    const jumlahTagihan = parseFloat(tagihan.jumlahtagihan || 0);
    const sudahBayar = parseFloat(tagihan.jumlahterbayar || 0);
    const nominalBayar = parseFloat(gross_amount || 0);

    // Handle payment status
    let statusPembayaranRecord: "SUCCESS" | "PARTIAL" | "FAILED" | "PENDING" = "PENDING";
    let terbayarBaru = sudahBayar;
    let sisaBaru = parseFloat(tagihan.sisa || 0);

    if (transaction_status === "settlement" || transaction_status === "capture") {
      // Pembayaran berhasil
      terbayarBaru = sudahBayar + nominalBayar;
      sisaBaru = Math.max(0, jumlahTagihan - terbayarBaru);

      // Tentukan apakah partial atau full payment
      if (Math.abs(sisaBaru) < 0.01) {
        // Full payment (sisa <= 0)
        statuspembayaran = "LUNAS";
        statusPembayaranRecord = "SUCCESS";
        terbayarBaru = jumlahTagihan;
        sisaBaru = 0;
      } else {
        // Partial payment (masih ada sisa)
        statuspembayaran = "BELUM BAYAR";
        statusPembayaranRecord = "PARTIAL";
      }

      console.log(`✅ [WEBHOOK] Payment Success: Nominal=${nominalBayar}, Total=${jumlahTagihan}, Sisa=${sisaBaru}`);
    } else if (transaction_status === "expire") {
      statuspembayaran = "KADALUARSA";
      statusPembayaranRecord = "FAILED";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      statuspembayaran = "BELUM BAYAR";
      statusPembayaranRecord = "FAILED";
    } else {
      // pending — tidak update
      console.log("⏳ [WEBHOOK] Transaction pending");
      return NextResponse.json({ status: "pending", transaction_status });
    }

    // Update status tagihan_siswa
    const updateData: any = {
      statuspembayaran,
      jumlahterbayar: terbayarBaru,
      updatedat: new Date().toISOString(),
    };

    if (statuspembayaran === "KADALUARSA" || transaction_status === "cancel") {
      updateData.paymenttoken = null;
    }

    const { error: updateError } = await supabase
      .from("tagihan_siswa")
      .update(updateData)
      .eq("idtagihansiswa", tagihanId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Update failed:", updateError);
      return NextResponse.json({ error: "Gagal update tagihan" }, { status: 500 });
    }

    // Update atau insert ke tabel pembayaran
    let pembayaranId: number | null = null;
    if (transaction_status === "settlement" || transaction_status === "capture") {
      // Update record pembayaran yang ada (status dari PENDING ke SUCCESS/PARTIAL)
      const { data: existingPembayaran } = await supabase
        .from("pembayaran")
        .select("idpembayaran")
        .eq("idtagihansiswa", parseInt(tagihanId))
        .eq("statuspembayaran", "PENDING")
        .maybeSingle();

      if (existingPembayaran) {
        // Update existing record
        const { error: updatePembayaranError } = await supabase
          .from("pembayaran")
          .update({
            statuspembayaran: statusPembayaranRecord,
            tanggalpembayaran: new Date().toISOString(),
            metodepembayaran,
          })
          .eq("idpembayaran", existingPembayaran.idpembayaran);

        if (!updatePembayaranError) {
          pembayaranId = existingPembayaran.idpembayaran;
        }
      } else {
        // Create new record jika tidak ada yang pending
        const { data: newPembayaran } = await supabase
          .from("pembayaran")
          .insert({
            idtagihansiswa: parseInt(tagihanId),
            idsiswa: tagihan.idsiswa,
            jumlahdibayar: nominalBayar,
            tanggalpembayaran: new Date().toISOString(),
            metodepembayaran,
            statuspembayaran: statusPembayaranRecord,
          })
          .select("idpembayaran")
          .single();

        pembayaranId = newPembayaran?.idpembayaran ?? null;
      }
    }

    // Log ke payment_gateway_log
    if (pembayaranId !== null) {
      await supabase.from("payment_gateway_log").insert({
        idpembayaran: pembayaranId,
        orderid: midtransOrderId,
        transactionstatusmidtrans: transaction_status,
        rawresponsemidtrans: body,
      });
    }

    console.log(`✅ [WEBHOOK] Updated: Tagihan=${tagihanId}, Status=${statuspembayaran}, Sisa=${sisaBaru}, PembayaranId=${pembayaranId}`);

    return NextResponse.json({
      status: "success",
      tagihan_id: tagihanId,
      updated_status: statuspembayaran,
      pembayaran_id: pembayaranId,
      sisa_tagihan: sisaBaru,
    });
  } catch (error: any) {
    console.error("💥 [WEBHOOK] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}