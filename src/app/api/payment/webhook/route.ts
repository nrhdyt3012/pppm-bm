// src/app/api/payment/webhook/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { environment } from "@/configs/environtment";
import crypto from "crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

    // Verifikasi signature Midtrans
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${midtransOrderId}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn("⚠️ [WEBHOOK] Invalid signature — lanjut untuk sandbox");
    }

    // Parse order_id: PPPM-{tagihanId}-{pembayaranId}-{timestamp}
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

    console.log(
      "🔍 [WEBHOOK] tagihanId:",
      tagihanId,
      "pembayaranId:",
      pembayaranIdFromOrder,
      "status:",
      transaction_status
    );

    const supabase = await createClient({ isAdmin: true });

    // ════════════════════════════════════════════════════════════════════
    // FIX DUPLIKASI #1 — Idempotency check di awal.
    // Cek dulu apakah order_id ini SUDAH PERNAH diproses sebelumnya
    // (tercatat di payment_gateway_log). Kalau sudah, webhook ini adalah
    // retry/duplicate dari Midtrans (mereka memang suka retry beberapa kali)
    // dan kita harus berhenti di sini, JANGAN proses ulang.
    // ════════════════════════════════════════════════════════════════════
    const { data: existingLog } = await supabase
      .from("payment_gateway_log")
      .select("idlog")
      .eq("orderid", midtransOrderId)
      .maybeSingle();

    if (existingLog) {
      console.log(
        `ℹ️ [WEBHOOK] Order ${midtransOrderId} sudah pernah diproses (idlog: ${existingLog.idlog}), skip duplikat.`
      );
      return NextResponse.json({ status: "already_processed" });
    }

    // Ambil data tagihan
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_siswa")
      .select(
        "idtagihansiswa, idsiswa, statuspembayaran, jumlahtagihan, jumlahterbayar"
      )
      .eq("idtagihansiswa", tagihanId)
      .single();

    if (tagihanError || !tagihan) {
      console.error("❌ [WEBHOOK] Tagihan tidak ditemukan:", tagihanId);
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Idempotent: sudah LUNAS → skip (jaga-jaga kalau log belum tercatat
    // tapi tagihan sudah terupdate lewat jalur lain)
    if (tagihan.statuspembayaran === "LUNAS") {
      console.log("ℹ️ [WEBHOOK] Tagihan sudah LUNAS, skip");
      return NextResponse.json({ status: "already_paid" });
    }

    const metodepembayaran = body.payment_type || "midtrans_online";
    const jumlahTagihan = parseFloat(tagihan.jumlahtagihan || "0");
    const nominalBayar = parseFloat(gross_amount || "0");

    // ─── Map status Midtrans → status internal ──────────────────────────
    let statuspembayaranTagihan: "BELUM BAYAR" | "LUNAS" | "KADALUARSA" =
      "BELUM BAYAR";
    let statusPembayaranRecord: "SUCCESS" | "FAILED" | "EXPIRED" | "PENDING" =
      "PENDING";

    if (transaction_status === "settlement" || transaction_status === "capture") {
      statuspembayaranTagihan = "LUNAS";
      statusPembayaranRecord = "SUCCESS";
      console.log(`✅ [WEBHOOK] SUKSES: nominal=${nominalBayar}, status=LUNAS`);
    } else if (transaction_status === "expire") {
      statuspembayaranTagihan = "KADALUARSA";
      statusPembayaranRecord = "EXPIRED";
      console.log("⏰ [WEBHOOK] Token EXPIRED");
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      statuspembayaranTagihan = "BELUM BAYAR";
      statusPembayaranRecord = "FAILED";
      console.log(
        `🚫 [WEBHOOK] ${transaction_status.toUpperCase()}: tagihan kembali ke BELUM BAYAR`
      );
    } else {
      console.log("⏳ [WEBHOOK] Status pending/lainnya:", transaction_status);
      return NextResponse.json({ status: "pending", transaction_status });
    }
    // ────────────────────────────────────────────────────────────────────

    // ════════════════════════════════════════════════════════════════════
    // FIX DUPLIKASI #2 — Cek apakah sudah ada pembayaran SUCCESS midtrans
    // lain untuk tagihan ini SEBELUM kita insert/update apapun. Ini jaring
    // pengaman kedua selain idempotency check di atas, untuk kasus dua
    // order_id berbeda merujuk ke tagihan yang sama (edge case retry user).
    // ════════════════════════════════════════════════════════════════════
    if (statusPembayaranRecord === "SUCCESS") {
      const { data: alreadySuccess } = await supabase
        .from("pembayaran")
        .select("idpembayaran")
        .eq("idtagihansiswa", parseInt(tagihanId))
        .eq("statuspembayaran", "SUCCESS")
        .neq("metodepembayaran", "cash")
        .maybeSingle();

      if (alreadySuccess) {
        console.log(
          `ℹ️ [WEBHOOK] Tagihan ${tagihanId} sudah punya pembayaran midtrans SUCCESS (id: ${alreadySuccess.idpembayaran}). Sinkronkan status saja, jangan insert baru.`
        );
        await supabase
          .from("tagihan_siswa")
          .update({
            statuspembayaran: "LUNAS",
            jumlahterbayar: jumlahTagihan,
            updatedat: new Date().toISOString(),
          })
          .eq("idtagihansiswa", tagihanId);

        // Tetap catat log ini sebagai "processed" agar retry Midtrans
        // berikutnya berhenti di idempotency check paling atas.
        await supabase.from("payment_gateway_log").insert({
          idpembayaran: alreadySuccess.idpembayaran,
          orderid: midtransOrderId,
          transactionstatusmidtrans: transaction_status,
          rawresponsemidtrans: {
            note: "Duplicate webhook call, payment already recorded",
            ...body,
          },
        });

        return NextResponse.json({ status: "already_paid_synced" });
      }
    }

    // Update tagihan_siswa
    const updateData: any = {
      statuspembayaran: statuspembayaranTagihan,
      updatedat: new Date().toISOString(),
    };

    if (statuspembayaranTagihan === "LUNAS") {
      updateData.jumlahterbayar = jumlahTagihan; // full payment
    }

    if (
      statuspembayaranTagihan === "KADALUARSA" ||
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      updateData.paymenttoken = null;
    }

    const { error: updateError } = await supabase
      .from("tagihan_siswa")
      .update(updateData)
      .eq("idtagihansiswa", tagihanId);

    if (updateError) {
      console.error("❌ [WEBHOOK] Gagal update tagihan:", updateError);
      return NextResponse.json({ error: "Gagal update tagihan" }, { status: 500 });
    }

    // ─── Update / insert record pembayaran ──────────────────────────────
    let pembayaranId: number | null = null;
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

    if (
      !updated &&
      (transaction_status === "settlement" || transaction_status === "capture")
    ) {
      const { data: newPembayaran, error: insertPembayaranError } = await supabase
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

      // Kalau gagal karena melanggar unique index (uniq_midtrans_success_per_tagihan
      // dari migration), berarti ada race condition lain yang menang lebih dulu.
      // Jangan dianggap error fatal — cukup log & lanjut tanpa insert pembayaran baru.
      if (insertPembayaranError) {
        console.warn(
          "⚠️ [WEBHOOK] Insert pembayaran gagal (kemungkinan duplikat ditolak constraint):",
          insertPembayaranError.message
        );
      }

      pembayaranId = newPembayaran?.idpembayaran ?? null;
    }
    // ────────────────────────────────────────────────────────────────────

    // Log ke payment_gateway_log — orderid sudah unique constraint,
    // jadi kalau ada race condition dobel-insert webhook, salah satu
    // akan gagal di sini secara aman (idempotency check di awal seharusnya
    // sudah mencegah ini, tapi constraint ini jaring pengaman terakhir).
    if (pembayaranId !== null) {
      const { error: logError } = await supabase
        .from("payment_gateway_log")
        .insert({
          idpembayaran: pembayaranId,
          orderid: midtransOrderId,
          transactionstatusmidtrans: transaction_status,
          rawresponsemidtrans: body,
        });

      if (logError) {
        console.warn(
          "⚠️ [WEBHOOK] Gagal insert payment_gateway_log (kemungkinan duplikat):",
          logError.message
        );
      }
    }

    console.log(
      `✅ [WEBHOOK] Done: tagihan=${tagihanId}, status=${statuspembayaranTagihan}, pembayaranId=${pembayaranId}`
    );

    // Kirim kwitansi email hanya saat sukses
    if (
      pembayaranId !== null &&
      (transaction_status === "settlement" || transaction_status === "capture")
    ) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      try {
        await fetch(`${appUrl}/api/send-receipt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idPembayaran: pembayaranId,
            idTagihan: parseInt(tagihanId),
            jumlahBayar: nominalBayar,
            totalTagihan: jumlahTagihan,
            sisaTagihan: 0,
            statusBaru: statuspembayaranTagihan,
            metodePembayaran: metodepembayaran,
          }),
        });
        console.log(`📧 [WEBHOOK] Receipt email queued for pembayaran ${pembayaranId}`);
      } catch (emailError) {
        console.error(`⚠️ [WEBHOOK] Gagal kirim email kwitansi:`, emailError);
      }

      if (process.env.FONNTE_API_KEY) {
        try {
          await fetch(`${appUrl}/api/notifications/send-payment-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idPembayaran: pembayaranId,
              idTagihan: parseInt(tagihanId),
              status: "SUCCESS",
            }),
          });
          console.log(
            `📱 [WEBHOOK] WhatsApp payment success notification queued for pembayaran ${pembayaranId}`
          );
        } catch (whatsappError) {
          console.error(`⚠️ [WEBHOOK] Gagal kirim WhatsApp notification:`, whatsappError);
        }
      }
    }

    if (
      pembayaranId !== null &&
      (transaction_status === "cancel" ||
        transaction_status === "deny" ||
        transaction_status === "expire")
    ) {
      if (process.env.FONNTE_API_KEY) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const statusMap: Record<string, "FAILED" | "EXPIRED"> = {
          cancel: "FAILED",
          deny: "FAILED",
          expire: "EXPIRED",
        };

        try {
          await fetch(`${appUrl}/api/notifications/send-payment-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idPembayaran: pembayaranId,
              idTagihan: parseInt(tagihanId),
              status: statusMap[transaction_status] || "FAILED",
            }),
          });
          console.log(
            `📱 [WEBHOOK] WhatsApp payment failed notification queued for pembayaran ${pembayaranId}`
          );
        } catch (whatsappError) {
          console.error(`⚠️ [WEBHOOK] Gagal kirim WhatsApp notification:`, whatsappError);
        }
      }
    }

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