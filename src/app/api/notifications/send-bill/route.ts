/**
 * API Endpoint: POST /api/notifications/send-bill
 * Mengirim notifikasi tagihan ke wali siswa via WhatsApp
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWhatsAppNotificationService } from "@/lib/fonnte/whatsapp-sender";

interface SendBillNotificationRequest {
  idTagihan: number;
  manualSend?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendBillNotificationRequest = await request.json();
    const { idTagihan, manualSend = false } = body;

    console.log(
      `[NOTIFICATION-BILL] Processing tagihan ${idTagihan}, manualSend: ${manualSend}`
    );

    if (!idTagihan || typeof idTagihan !== "number") {
      return NextResponse.json(
        { error: "idTagihan harus berupa number" },
        { status: 400 }
      );
    }

    const supabase = await createClient({ isAdmin: true });

    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan_siswa")
      .select(
        `
        idtagihansiswa,
        idsiswa,
        idmastertagihan,
        jumlahtagihan,
        bulan,
        tahun,
        statuspembayaran,
        paymenttoken,
        whatsapp_notified_at,
        master_tagihan(namatagihan),
        siswa(namasiswa, nowa, namawali)
      `
      )
      .eq("idtagihansiswa", idTagihan)
      .single();

    if (tagihanError || !tagihan) {
      console.error(
        `[NOTIFICATION-BILL] Tagihan tidak ditemukan: ${idTagihan}`
      );
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 }
      );
    }

    const siswa = tagihan.siswa as any;
    const masterTagihan = tagihan.master_tagihan as any;

    if (!siswa || !siswa.nowa) {
      console.error(
        `[NOTIFICATION-BILL] Nomor WhatsApp wali tidak ditemukan`
      );
      return NextResponse.json(
        { error: "Nomor WhatsApp wali tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!manualSend && tagihan.whatsapp_notified_at) {
      console.log(
        `[NOTIFICATION-BILL] Notifikasi sudah dikirim sebelumnya untuk tagihan ${idTagihan}`
      );
      return NextResponse.json(
        { message: "Notifikasi sudah dikirim sebelumnya" },
        { status: 200 }
      );
    }

    const bulanArray = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const periode = `${bulanArray[tagihan.bulan - 1] || "Bulan " + tagihan.bulan} ${tagihan.tahun}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const linkPembayaran = `${appUrl}/(dashboard)/siswa/payment?id=${tagihan.idtagihansiswa}`;

    const whatsAppService = getWhatsAppNotificationService();

    const result = await whatsAppService.sendNotification({
      recipientPhone: siswa.nowa,
      messageType: "TAGIHAN",
      targetId: tagihan.idtagihansiswa,
      recipientName: siswa.namawali || "Wali Murid",
      studentName: siswa.namasiswa,
      data: {
        periode,
        namaTagihan: masterTagihan?.namatagihan || "Tagihan",
        nominal: Math.floor(tagihan.jumlahtagihan),
        linkPembayaran,
        batasPembayaran: "Secepatnya",
      },
    });

    if (!result.success) {
      console.error(
        `[NOTIFICATION-BILL] Gagal mengirim notifikasi: ${result.error}`
      );
      return NextResponse.json(
        { error: result.error || "Gagal mengirim notifikasi" },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("tagihan_siswa")
      .update({ whatsapp_notified_at: new Date().toISOString() })
      .eq("idtagihansiswa", idTagihan);

    if (updateError) {
      console.warn(
        `[NOTIFICATION-BILL] Gagal update timestamp notifikasi:`,
        updateError
      );
    }

    console.log(
      `✅ [NOTIFICATION-BILL] Notifikasi terkirim untuk tagihan ${idTagihan}, message_id: ${result.messageId}`
    );

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil dikirim",
      messageId: result.messageId,
      tagihan: {
        id: tagihan.idtagihansiswa,
        siswa: siswa.namasiswa,
        wali: siswa.namawali,
        nominal: tagihan.jumlahtagihan,
      },
    });
  } catch (error: any) {
    console.error("[NOTIFICATION-BILL] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
