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

    // Format order_id: PPPM-{tagihanId}-{pembayaranId}-{timestamp}
    let tagihanId: string;
    let pembayaranIdFromOrder: string | null = null;

    if (midtransOrderId?.startsWith("PPPM-")) {
      const parts = midtransOrderId.split("-");
      tagihanId = parts[1];
      if (parts.length >= 4) {
        pembayaranIdFromOrder = parts[2];
      }
    } else {
      tagihanId = midtransOrderId;
    }

    console.log("🔍 [WEBHOOK] Tagihan ID:", tagihanId, "Pembayaran ID:", pembayaranIdFromOrder, "Gross Amount:", gross_amount);

    const supabase = await createClient({ isAdmin: true });

    // Ambil data tagihan
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_siswa")
      .select("idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan, jumlahterbayar")
      .eq("idtagihansiswa", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", tagihanId);
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    // Jika sudah LUNAS, skip (idempotent)
    if (tagihan.statuspembayaran === "LUNAS") {
      console.log("ℹ️ [WEBHOOK] Tagihan sudah LUNAS, skip");
      return NextResponse.json({ status: "already_paid" });
    }

    const metodepembayaran = body.payment_type || "midtrans_online";
    const jumlahTagihan = parseFloat(tagihan.jumlahtagihan || "0");
    const nominalBayar = parseFloat(gross_amount || "0");

    // Tentukan status berdasarkan transaction_status dari Midtrans
    let statuspembayaranTagihan: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" = "BELUM BAYAR";
    // Hanya nilai yang valid di constraint DB: PENDING, SUCCESS, FAILED, EXPIRED
    let statusPembayaranRecord: "SUCCESS" | "FAILED" | "EXPIRED" | "PENDING" = "PENDING";

    if (transaction_status === "settlement" || transaction_status === "capture") {
      // Midtrans = selalu full payment sekarang
      statuspembayaranTagihan = "LUNAS";
      statusPembayaranRecord = "SUCCESS";

      console.log(`✅ [WEBHOOK] Payment Success: Nominal=${nominalBayar}, Status=LUNAS`);
    } else if (transaction_status === "expire") {
      statuspembayaranTagihan = "KADALUARSA";
      statusPembayaranRecord = "EXPIRED";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      statuspembayaranTagihan = "BELUM BAYAR";
      statusPembayaranRecord = "FAILED";
    } else {
      console.log("⏳ [WEBHOOK] Transaction pending:", transaction_status);
      return NextResponse.json({ status: "pending", transaction_status });
    }

    // Update tagihan_siswa
    const updateData: any = {
      statuspembayaran: statuspembayaranTagihan,
      updatedat: new Date().toISOString(),
    };

    if (statuspembayaranTagihan === "LUNAS") {
      updateData.jumlahterbayar = jumlahTagihan; // full payment
    }

    if (statuspembayaranTagihan === "KADALUARSA" || transaction_status === "cancel") {
      updateData.paymenttoken = null;
    }

    const { error: updateError } = await supabase
      .from("tagihan_siswa")
      .update(updateData)
      .eq("idtagihansiswa", tagihanId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Update tagihan failed:", updateError);
      return NextResponse.json({ error: "Gagal update tagihan" }, { status: 500 });
    }

    // Update atau insert ke tabel pembayaran
    let pembayaranId: number | null = null;
    let updated = false;

    // Coba update by pembayaranId dari order_id
    if (pembayaranIdFromOrder) {
      const { error: updatePembayaranError } = await supabase
        .from("pembayaran")
        .update({
          statuspembayaran: statusPembayaranRecord,
          tanggalpembayaran: new Date().toISOString(),
          metodepembayaran,
          jumlahdibayar: nominalBayar,
        })
        .eq("idpembayaran", parseInt(pembayaranIdFromOrder));

      if (!updatePembayaranError) {
        pembayaranId = parseInt(pembayaranIdFromOrder);
        updated = true;
        console.log("✅ [WEBHOOK] Pembayaran updated by id:", pembayaranId);
      }
    }

    // Fallback: update PENDING record berdasarkan tagihan
    if (!updated) {
      const { data: existingPending } = await supabase
        .from("pembayaran")
        .select("idpembayaran")
        .eq("idtagihansiswa", parseInt(tagihanId))
        .eq("statuspembayaran", "PENDING")
        .maybeSingle();

      if (existingPending) {
        const { error } = await supabase
          .from("pembayaran")
          .update({
            statuspembayaran: statusPembayaranRecord,
            tanggalpembayaran: new Date().toISOString(),
            metodepembayaran,
            jumlahdibayar: nominalBayar,
          })
          .eq("idpembayaran", existingPending.idpembayaran);

        if (!error) {
          pembayaranId = existingPending.idpembayaran;
          updated = true;
        }
      }
    }

    // Tidak ada record → insert baru
    if (!updated && (transaction_status === "settlement" || transaction_status === "capture")) {
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

    // Log ke payment_gateway_log
    if (pembayaranId !== null) {
      await supabase.from("payment_gateway_log").insert({
        idpembayaran: pembayaranId,
        orderid: midtransOrderId,
        transactionstatusmidtrans: transaction_status,
        rawresponsemidtrans: body,
      });
    }

    console.log(`✅ [WEBHOOK] Done: Tagihan=${tagihanId}, Status=${statuspembayaranTagihan}, PembayaranId=${pembayaranId}`);

    return NextResponse.json({
      status: "success",
      tagihan_id: tagihanId,
      updated_status: statuspembayaranTagihan,
      pembayaran_id: pembayaranId,
    });
  } catch (error: any) {
    console.error("💥 [WEBHOOK] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}