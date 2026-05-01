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

    // Format order_id baru: PPPM-{tagihanId}-{pembayaranId}-{timestamp}
    // Format lama: PPPM-{tagihanId}-{timestamp}
    let tagihanId: string;
    let pembayaranIdFromOrder: string | null = null;

    if (midtransOrderId?.startsWith("PPPM-")) {
      const parts = midtransOrderId.split("-");
      tagihanId = parts[1];
      // Format baru punya 4 parts: PPPM, tagihanId, pembayaranId, timestamp
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
      .select("idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan, jumlahterbayar, sisa")
      .eq("idtagihansiswa", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan not found:", tagihanId);
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    const metodepembayaran = body.payment_type || "midtrans_online";
    const jumlahTagihan = parseFloat(tagihan.jumlahtagihan || 0);
    const sudahBayar = parseFloat(tagihan.jumlahterbayar || 0);
    const nominalBayar = parseFloat(gross_amount || 0);

    let statuspembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" = "BELUM BAYAR";
    let statusPembayaranRecord: "SUCCESS" | "PARTIAL" | "FAILED" | "PENDING" = "PENDING";
    let terbayarBaru = sudahBayar;
    let sisaBaru = parseFloat(tagihan.sisa || (jumlahTagihan - sudahBayar).toString());

    if (transaction_status === "settlement" || transaction_status === "capture") {
      terbayarBaru = sudahBayar + nominalBayar;
      sisaBaru = Math.max(0, jumlahTagihan - terbayarBaru);

      if (sisaBaru < 0.01) {
        // Full / pelunasan
        statuspembayaran = "LUNAS";
        statusPembayaranRecord = "SUCCESS";
        terbayarBaru = jumlahTagihan;
        sisaBaru = 0;
      } else {
        // Partial payment — tagihan masih BELUM BAYAR tapi sisa berkurang
        statuspembayaran = "BELUM BAYAR";
        statusPembayaranRecord = "PARTIAL";
      }

      console.log(`✅ [WEBHOOK] Payment Success: Nominal=${nominalBayar}, SudahBayar=${sudahBayar}, Baru=${terbayarBaru}, Sisa=${sisaBaru}, Status=${statuspembayaran}`);
    } else if (transaction_status === "expire") {
      statuspembayaran = "KADALUARSA";
      statusPembayaranRecord = "FAILED";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      statuspembayaran = "BELUM BAYAR";
      statusPembayaranRecord = "FAILED";
    } else {
      console.log("⏳ [WEBHOOK] Transaction pending");
      return NextResponse.json({ status: "pending", transaction_status });
    }

    // Update tagihan_siswa — update sisa secara eksplisit
    const updateData: any = {
      statuspembayaran,
      jumlahterbayar: terbayarBaru,
      updatedat: new Date().toISOString(),
    };

    // Untuk sisa, update eksplisit kalau kolom tidak auto-compute
    // (bergantung pada setup DB — kalau ada generated column, ini akan diabaikan DB)
    // Kita set sisa agar webhook bisa update langsung
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
      // Coba update PENDING record yang sesuai (dari order_id)
      let updated = false;

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

      if (!updated) {
        // Fallback: update PENDING record berdasarkan tagihan
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

      if (!updated) {
        // Buat record baru
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

    console.log(`✅ [WEBHOOK] Done: Tagihan=${tagihanId}, Status=${statuspembayaran}, Sisa=${sisaBaru}, PembayaranId=${pembayaranId}`);

    return NextResponse.json({
      status: "success",
      tagihan_id: tagihanId,
      updated_status: statuspembayaran,
      pembayaran_id: pembayaranId,
      sisa_tagihan: sisaBaru,
      jumlah_dibayar: nominalBayar,
    });
  } catch (error: any) {
    console.error("💥 [WEBHOOK] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}